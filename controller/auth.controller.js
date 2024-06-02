const createHttpError = require('http-errors');
const UserModel = require('../model/users.model');
const { generateToken, verifyToken, verifyRefreshToken } = require('../utils/functions');
const client = require('../connections/redis');

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
                });
        } catch (error) {
            console.log(error);
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
                });
        } catch (error) {
            console.log(error);
            next(error);
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
            console.log(error);
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
            console.log(error);
            next(error);
        }
    },
};
