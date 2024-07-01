const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');
const nodemailer = require('nodemailer');
const verifyEmail = require('@/email/verify_email');

const hashText = (text, numberSalt) => {
    const salt = bcrypt.genSaltSync(numberSalt);
    const hashPassword = bcrypt.hashSync(text, salt);

    return hashPassword;
};

const generateToken = (data, secretKey, expire) => {
    return jwt.sign(
        {
            data,
        },
        secretKey,
        { expiresIn: expire },
    );
};

const verifyToken = (token, secretKey) => {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        throw createHttpError({ status: 403, message: error.message });
    }
};

const verifyRefreshToken = (refreshToken, secretRefreshTokenKey) => {
    if (!refreshToken) {
        throw createHttpError(401, {
            messageCode: 'Unauthenticated',
            message: 'Unauthenticated',
        });
    }
    const decoded = verifyToken(refreshToken, secretRefreshTokenKey);
    if (!decoded) {
        throw createHttpError(401, {
            messageCode: 'Unauthenticated',
            message: 'Unauthenticated',
        });
    }

    return decoded;
};

const sendEmail = async (email, subject, link) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 587,
            // secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        return await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html: verifyEmail(link, process.env.URL_CLIENT),
        });
    } catch (error) {
        console.log('email not sent');
        console.log(error);
    }
};

module.exports = {
    hashText,
    generateToken,
    verifyToken,
    verifyRefreshToken,
    sendEmail,
};
