const createHttpError = require('http-errors');
const { verifyToken } = require('../utils/functions');

module.exports = async function (req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return next(
                createHttpError(403, {
                    message: 'Not authenticated',
                    message_code: 'Unauthenticated',
                }),
            );
        }
        const token = authorization.split(' ')[1];
        const decoded = verifyToken(token, process.env.ACCESS_TOKEN_KEY);

        if (!decoded) {
            return next(
                createHttpError(404, {
                    message: 'User not found',
                    message_code: 'user_not_found',
                }),
            );
        }
        req.user = decoded;
        next();
    } catch (err) {
        if (err?.status === 403) return next(createHttpError(err.status, err));
        next(createHttpError(500));
    }
};
