const createResponse = require('@/utils/responseHelper');
const User = require('@/model/user.model');
const { STATUS_MESSAGE, MESSAGE_CODE, STATUS_CODE } = require('@/enums/response');
const jwt = require('jsonwebtoken');

module.exports = async function (cookie, socket) {
    try {
        if (!cookie) {
            return socket.emit(
                'validation',
                createResponse(null, STATUS_MESSAGE.UNAUTHORIED, MESSAGE_CODE.UNAUTHORIED, STATUS_CODE.UNAUTHORIED),
            );
        }

        const decoded = jwt.verify(cookie.accessToken, process.env.ACCESS_TOKEN_KEY);

        if (!decoded) {
            return socket.emit(
                'validation',
                createResponse(
                    null,
                    STATUS_MESSAGE.TOKEN_INVALID,
                    MESSAGE_CODE.TOKEN_INVALID,
                    STATUS_CODE.UNAUTHORIED,
                    false,
                ),
            );
        }

        const user = await User.findById(decoded.data).select('-password');
        if (!user) {
            return socket.emit(
                'validation',
                createResponse(
                    null,
                    STATUS_MESSAGE.USER_NOT_REGISTERED,
                    MESSAGE_CODE.USER_NOT_REGISTERED,
                    STATUS_CODE.NOT_FOUND,
                    false,
                ),
            );
        }

        if (!user.is_active) {
            return socket.emit(
                'validation',
                createResponse(
                    null,
                    STATUS_MESSAGE.ACCOUNT_INACTIVE,
                    MESSAGE_CODE.ACCOUNT_INACTIVE,
                    STATUS_CODE.FORBIDDEN,
                    false,
                ),
            );
        }
        user.socketId.push(socket.id);
        user.is_online = true;
        const newUser = await user.save();

        socket.user = newUser;
        return false;
    } catch (err) {
        return socket.emit('validation', createResponse(err, null, null, STATUS_CODE.UNAUTHORIED, false));
    }
};
