const createHttpError = require('http-errors');
const { verifyToken } = require('../utils/functions');

module.exports = async function (req, res, next) {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            throw createHttpError.Unauthorized();
        }
        const token = authorization.split(' ')[1];
        const decoded = verifyToken(token, process.env.ACCESS_TOKEN_KEY);

        if (!decoded) {
            throw createHttpError(404, {
                message: 'User not found',
                message_code: 'user_not_found',
            });
        }
        req.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
};
