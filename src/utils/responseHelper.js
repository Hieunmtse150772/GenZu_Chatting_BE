const createResponse = (data, message, messageCode, status, success) => {
    return {
        data,
        message,
        messageCode,
        status,
        success,
    };
};

module.exports = createResponse;
