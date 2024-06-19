const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

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
        return error;
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

module.exports = {
    hashText,
    generateToken,
    verifyToken,
    verifyRefreshToken,
};
