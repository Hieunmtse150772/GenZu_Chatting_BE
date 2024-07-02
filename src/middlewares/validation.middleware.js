const createHttpError = require('http-errors');

module.exports = function (validator) {
    return async function (req, res, next) {
        try {
            const validated = await validator.validateAsync({ ...req.body, ...req.params, ...req.query });
            req.body = validated;
            next();
        } catch (err) {
            if (err.isJoi) return next(createHttpError(422, { message: err.message }));
            next(createHttpError(500));
        }
    };
};
