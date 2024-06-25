const jwt = require('jsonwebtoken');
const google = require('googleapis').google;

const UserModel = require('@/model/user.model');
const { generateToken, verifyToken, verifyRefreshToken } = require('@/utils/functions');
const client = require('@/connections/redis');
const CONFIG = require('@/config');
const OAuth2 = google.auth.OAuth2;

module.exports = {
    signUp: async (req, res, next) => {
        try {
            const user = await UserModel.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({
                    messageCode: 'email_already_exists',
                    message: 'Email already exists',
                });
            }
            console.log('user: ', user);
            const newUser = await UserModel.create(req.body);
            const { password, ...remain } = newUser._doc;
            const accessToken = generateToken(
                newUser._id,
                process.env.ACCESS_TOKEN_KEY,
                process.env.EXPIRE_ACCESS_TOKEN,
            );
            const refreshToken = generateToken(
                newUser._id,
                process.env.REFRESH_TOKEN_KEY,
                process.env.EXPIRE_REFRESH_TOKEN,
            );
            await client.set(String(newUser._id), refreshToken, {
                PX: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
            });

            return res
                .status(201)
                .cookie('refreshToken', refreshToken, {
                    maxAge: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
                    httpOnly: true, // không thể được truy cập bởi JavaScript
                    secure: true, // đảm bảo rằng cookies chỉ được gửi qua các kết nối an toàn (HTTPS)
                })
                .json({
                    messageCode: 'create_user_successfully',
                    message: 'Create user successfully',
                    user: remain,
                    accessToken,
                    success: true,
                    status: 201,
                });
        } catch (error) {
            next(error);
        }
    },
    signIn: async (req, res, next) => {
        try {
            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).json({
                    messageCode: 'user_is_not_registered',
                    message: 'The user is not registered',
                });
            }
            const isValid = user.checkPassword(req.body.password);
            if (!isValid) {
                return res.status(400).json({
                    messageCode: 'incorrect_password',
                    message: 'Your password is incorrect',
                });
            }

            const { password, ...remain } = user._doc;
            const accessToken = generateToken(user._id, process.env.ACCESS_TOKEN_KEY, process.env.EXPIRE_ACCESS_TOKEN);
            const refreshToken = generateToken(
                user._id,
                process.env.REFRESH_TOKEN_KEY,
                process.env.EXPIRE_REFRESH_TOKEN,
            );
            await client.set(String(user._id), refreshToken, {
                PX: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
            });

            return res
                .status(200)
                .cookie('refreshToken', refreshToken, {
                    maxAge: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
                    httpOnly: true, // không thể được truy cập bởi JavaScript
                    secure: true, // đảm bảo rằng cookies chỉ được gửi qua các kết nối an toàn (HTTPS)
                })
                .json({
                    messageCode: 'login_successfully',
                    message: 'Your login was successfully',
                    user: remain,
                    accessToken,
                    success: true,
                    status: 200,
                });
        } catch (error) {
            next(error);
        }
    },
    signInWithGoogle: (req, res, next) => {
        try {
            const oauth2Client = new OAuth2(
                CONFIG.oauth2Credentials.client_id,
                CONFIG.oauth2Credentials.client_secret,
                CONFIG.oauth2Credentials.redirect_uris[0],
            );
            // Obtain the google login link to which we'll send our users to give us access
            const loginLink = oauth2Client.generateAuthUrl({
                access_type: 'offline', // Indicates that we need to be able to access data continously without the user constantly giving us consent
                scope: CONFIG.oauth2Credentials.scopes, // Using the access scopes from our config file
            });
            res.status(200).json({
                success: true,
                link: loginLink,
                status: 200,
                message: 'Auth logged with google in successful.',
                messageCode: 'Auth_google_successfully',
            });
        } catch (error) {
            return next(error);
        }
    },
    callBack: (req, res) => {
        // Create an OAuth2 client object from the credentials in our config file
        const oauth2Client = new OAuth2(
            CONFIG.oauth2Credentials.client_id,
            CONFIG.oauth2Credentials.client_secret,
            CONFIG.oauth2Credentials.redirect_uris[0],
        );
        if (req.query.error) {
            // The user did not give us permission.
            return res.status(403).json(req.query.error);
        } else {
            oauth2Client.getToken(req.query.code, async function (err, token) {
                if (err) return res.status(403).json(err);
                // Store the credentials given by google into a jsonwebtoken in a cookie called 'jwt'

                const userInfo = jwt.decode(token.id_token);
                const user = await UserModel.findOne({ googleId: userInfo.sub });

                if (!user) {
                    const newUser = await UserModel.create({
                        fullName: userInfo.name,
                        picture: userInfo.picture,
                        email: userInfo.email,
                        email_verified: userInfo.email_verified,
                        googleId: userInfo.sub,
                    });
                    const { password, ...remain } = newUser._doc;
                    const accessToken = generateToken(
                        newUser._id,
                        process.env.ACCESS_TOKEN_KEY,
                        process.env.EXPIRE_ACCESS_TOKEN,
                    );
                    const refreshToken = generateToken(
                        newUser._id,
                        process.env.REFRESH_TOKEN_KEY,
                        process.env.EXPIRE_REFRESH_TOKEN,
                    );
                    await client.set(String(newUser._id), refreshToken, {
                        PX: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
                    });

                    return res
                        .status(201)
                        .cookie('refreshToken', refreshToken, {
                            maxAge: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
                            httpOnly: true, // không thể được truy cập bởi JavaScript
                            secure: true, // đảm bảo rằng cookies chỉ được gửi qua các kết nối an toàn (HTTPS)
                        })
                        .json({
                            messageCode: 'create_user_successfully',
                            message: 'Create user successfully',
                            user: remain,
                            accessToken,
                        });
                } else {
                    const { password, ...remain } = user._doc;
                    const accessToken = generateToken(
                        user._id,
                        process.env.ACCESS_TOKEN_KEY,
                        process.env.EXPIRE_ACCESS_TOKEN,
                    );
                    const refreshToken = generateToken(
                        user._id,
                        process.env.REFRESH_TOKEN_KEY,
                        process.env.EXPIRE_REFRESH_TOKEN,
                    );
                    await client.set(String(user._id), refreshToken, {
                        PX: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
                    });

                    return res
                        .status(200)
                        .cookie('refreshToken', refreshToken, {
                            maxAge: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
                            httpOnly: true, // không thể được truy cập bởi JavaScript
                            secure: true, // đảm bảo rằng cookies chỉ được gửi qua các kết nối an toàn (HTTPS)
                        })
                        .json({
                            messageCode: 'login_successfully',
                            message: 'Your login was successfully',
                            user: remain,
                            accessToken,
                        });
                }
            });
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const decoded = verifyRefreshToken(req.cookies.refreshToken, process.env.REFRESH_TOKEN_KEY);

            const value = await client.get(decoded.data);

            if (!value) {
                return res.status(401).json({
                    messageCode: 'Unauthenticated',
                    message: 'Unauthenticated',
                });
            }

            const accessToken = generateToken(
                decoded.data,
                process.env.ACCESS_TOKEN_KEY,
                process.env.EXPIRE_ACCESS_TOKEN,
            );
            const refreshToken = generateToken(
                decoded.data,
                process.env.REFRESH_TOKEN_KEY,
                process.env.EXPIRE_REFRESH_TOKEN,
            );
            return res
                .status(200)
                .cookie('refreshToken', refreshToken, {
                    maxAge: Number(process.env.EXPIRE_REFRESH_TOKEN_COOKIE),
                    httpOnly: true, // không thể được truy cập bởi JavaScript
                    secure: true, // đảm bảo rằng cookies chỉ được gửi qua các kết nối an toàn (HTTPS)
                })
                .json({
                    messageCode: 'refresh_token_successfully',
                    message: 'Your refresh token was successfully',
                    accessToken,
                });
        } catch (error) {
            next(error);
        }
    },
    logout: async (req, res, next) => {
        try {
            const decoded = verifyRefreshToken(req.cookies.refreshToken, process.env.REFRESH_TOKEN_KEY);

            await client.del(decoded.data);

            return res
                .status(200)
                .cookie('refreshToken', '', {
                    maxAge: 0,
                })
                .json({
                    messageCode: 'logout_successfully',
                    message: 'Logout was successfully',
                });
        } catch (error) {
            next(error);
        }
    },
};
