const createResponse = (data, message, messageCode, status, success) => {
    return {
        data,
        message,
        messageCode,
        status,
        success,
    };
};

const responseNotificationSocket = (action, data) => {
    return {
        action,
        data,
    };
};

module.exports = {
    createResponse,
    responseNotificationSocket,
};
