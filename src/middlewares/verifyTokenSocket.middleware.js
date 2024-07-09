const jwt = require('jsonwebtoken');

const createResponse = require('@/utils/responseHelper');
const User = require('@/model/user.model');
const { STATUS_MESSAGE, MESSAGE_CODE, STATUS_CODE } = require('@/enums/response');

module.exports = async function (token, socket) {
    try {
        if (!token) {
            return socket.emit(
                'validation',
                createResponse(null, STATUS_MESSAGE.UNAUTHORIED, MESSAGE_CODE.UNAUTHORIED, STATUS_CODE.UNAUTHORIED),
            );
        }

        const accessToken = token.split(' ')[1];
        co;
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);

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
        return socket.emit(
            'validation',
            createResponse(
                err,
                STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
                MESSAGE_CODE.INTERNAL_SERVER_ERROR,
                STATUS_CODE.UNAUTHORIED,
                false,
            ),
        );
    }
};
