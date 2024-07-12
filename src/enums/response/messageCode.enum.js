const MESSAGE_CODE = {
    //Auth 1000
    CREATE_USER_SUCCESS: 1001,
    CREATE_USER_FAIL: 1002,
    USER_NOT_REGISTERED: 1003,
    LOGIN_SUCCESS: 1004,
    LOGIN_FAIL: 1005,
    LOGIN_GOOGLE_SUCCESS: 1006,
    LOGIN_GOOGLE_FAIL: 1007,
    REFRESH_TOKEN_SUCCESS: 1008,
    GET_PROFILE_SUCCESSFULLY: 1009,
    EMAIL_NOT_FOUND: 1010,
    PLEASE_VERIFY_EMAIL: 1011,
    INCORRECT_PASSWORD: 1012,
    ACCOUNT_INACTIVE: 1013,
    SAME_LANGUAGE_CODE: 1014,
    CHANGE_LANGUAGE_CODE_SUCCESSFULLY: 1015,
    REFRESH_TOKEN_INVALID: 1016,
    PLEASE_WAIT: 1017,
    VERIFIED_EMAIL: 1018,
    RESEND_EMAIL_SUCCESSFULLY: 1019,
    TOKEN_INVALID: 1020,
    VERIFY_EMAIL_SUCCESSFULLY: 1021,
    CHANGE_PASSWORD_SUCCESSFULLY: 1022,
    FORGOT_PASSWORD_SUCCESSFULLY: 1023,
    LOGOUT_SUCCESSFULLY: 1024,
    UNAUTHORIED: 1025,
    EMAIL_ALREADY_EXISTED: 1026,

    //Message 2000
    SEND_MESSAGE_SUCCESS: 2001,
    SEND_MESSAGE_FAIL: 2002,
    NO_PERMISSION_RECALL_MESSAGE: 2003,
    DELETE_MESSAGE_SUCCESS: 2004,
    EDIT_MESSAGE_SUCCESS: 2005,
    MESSAGE_TOO_OLD_TO_EDIT: 2004,
    MESSAGE_NOT_FOUND: 2005,
    RECALL_MESSAGE_SUCCESS: 2006,
    USER_WAS_BLOCKED: 2007,
    NO_PERMISSION_SEND_MESSAGE: 2008,

    //Group 3000
    CREATE_GROUP_SUCCESSFULLY: 3001,
    UPDATE_GROUP_SUCCESSFULLY: 3002,
    MEMBER_ALREADY_EXIST_IN_GROUP: 3003,
    DELETE_GROUP_SUCCESSFULLY: 3004,
    GROUP_NOT_FOUND: 3005,
    ADD_MEMBER_TO_GROUP_SUCCESSFULLY: 3006,
    DELETE_MEMBER_SUCCESSFULLY: 3007,
    MEMBER_NOT_FOUND: 3008,
    EXCHANGE_ADMIN_ID_REQUIRED: 3009,
    USER_NOT_IN_GROUP: 3010,
    USER_LEAVE_IN_GROUP: 3011,
    DELETE_USER_IN_GROUP: 3012,
    TRANSFER_GROUP_LEADER: 3013,
    GROUP_NAME_REQUIRED: 3014,
    USERS_MUST_MONGOID: 3015,
    USERS_DUPLICATE: 3016,

    //Friend 4000
    FRIEND_REQUEST_SENT_SUCCESS: 4001,
    FRIEND_REQUEST_SENT_FAIL: 4002,
    ACCEPT_FRIEND_SUCCESS: 4003,
    ACCEPT_FRIEND_FAIL: 4004,
    REJECT_FRIEND_SUCCESS: 4005,
    REJECT_FRIEND_FAIL: 4006,
    ALREADY_FRIEND: 4007,
    DELETE_FRIEND_SUCCESS: 4008,
    NO_PERMISSION_ACCEPT_REQUEST: 4009,
    NO_PERMISSION_REJECT_REQUEST: 4010,
    NO_PERMISSION_REMOVE_REQUEST: 4011,
    REMOVE_FRIEND_REQUEST_SUCCESS: 4012,
    REMOVE_FRIEND_SUCCESS: 4013,

    //User 5000
    CREATE_USER_SUCCESS: 5001,
    UPDATE_USER_SUCCESS: 5002,
    DELETE_USER_SUCCESS: 5003,

    //Emoji 6000
    NOT_YOUR_EMOJI: 6001,
    //Conversation 7000
    CONVERSATION_NOT_FOUND: 7001,
    CONVERSATION_ACCESS_SUCCESS: 7002,
    DELETE_CONVERSATION_HISTORY_SUCCESS: 7003,
    UPDATE_CONVERSATION_AVATAR_SUCCESS: 7004,
    UPDATE_CONVERSATION_BACKGROUND_SUCCESS: 7005,
    REDO_CONVERSATION_HISTORY_SUCCESS: 7006,
    NO_PERMISSION_ACCESS_CONVERSATION: 7007,
    UPDATE_BACKGROUND_CONVERSATION_SUCCESS: 7008,
    NO_PERMISSION_UPDATE_BACKGROUND: 7009,
    NO_PERMISSION_UPDATE_AVATAR: 7010,
    UPDATE_AVATAR_CONVERSATION_SUCCESS: 7010,
    CONVERSATION_CREATE_SUCCESS: 7000,
};

module.exports = MESSAGE_CODE;
