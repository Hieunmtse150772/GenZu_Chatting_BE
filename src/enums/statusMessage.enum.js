const STATUS_MESSAGE = {
    // General
    FORBIDDEN: 'Forbidden',

    //Auth
    CREATE_USER_SUCCESS: 'Create user successfully',
    CREATE_USER_FAIL: 'Create user failed',
    USER_NOT_REGISTERED: 'The user is not registered',
    LOGIN_SUCCESS: 'Your login was successfully',
    LOGIN_FAIL: 'Your login failed',
    LOGIN_GOOGLE_SUCCESS: 'Auth logged with google in successful',
    LOGIN_GOOGLE_FAIL: 'Auth logged with google in failed',
    REFRESH_TOKEN_SUCCESS: 'Your refresh token was successfully',

    //Message
    SEND_MESSAGE_SUCCESS: 'Send message successfully',
    SEND_MESSAGE_FAIL: 'Send message failed',

    //Conversation

    // Group chat
    GROUP_NOT_FOUND: 'Group chat not found',
    DELETE_GROUP_SUCCESS: 'Delete group successfully',

    //Friend
    FRIEND_REQUEST_SENT_SUCCESS: 'Friend request sent',

    //User
    CREATE_USER_SUCCESS: 'Create user successfully',
    UPDATE_USER_SUCCESS: 'Update user successfully',
    DELETE_USER_SUCCESS: 'Delete user successfully',
};

const STATUS_MESSAGE_CODE = {
    // General
    FORBIDDEN: 'forbidden',

    //Auth
    CREATE_USER_SUCCESS: 'creat_user_successfully',
    CREATE_USER_FAIL: 'create_user_failed',
    USER_NOT_REGISTERED: 'the_user_is_not_registered',
    LOGIN_SUCCESS: 'your_login_was_successfully',
    LOGIN_FAIL: 'your_login_failed',
    LOGIN_GOOGLE_SUCCESS: 'auth_logged_with_google_in_successful',
    LOGIN_GOOGLE_FAIL: 'auth_logged_with_google_in_failed',
    REFRESH_TOKEN_SUCCESS: 'your_refresh_token_was_successfully',

    //Message
    SEND_MESSAGE_SUCCESS: 'send_message_successfully',
    SEND_MESSAGE_FAIL: 'send_message_failed',

    // Group chat
    GROUP_NOT_FOUND: 'group_not_found',
    DELETE_GROUP_SUCCESS: 'delete_group_successfully',

    //Friend
    FRIEND_REQUEST_SENT_SUCCESS: 'friend_request_sent',

    //User
    CREATE_USER_SUCCESS: 'create_user_successfully',
    UPDATE_USER_SUCCESS: 'update_user_successfully',
    DELETE_USER_SUCCESS: 'delete_user_successfully',
};

module.exports = { STATUS_MESSAGE, STATUS_MESSAGE_CODE };
