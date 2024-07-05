const STATUS_MESSAGE = {
    // General
    CREATE_SUCCESS: 'Create successfully',
    FORBIDDEN: 'Forbidden',
    ACTION_FAILED: 'Action failed',
    ACTION_SUCCESS: 'Action success',

    //Auth
    USER_NOT_REGISTERED: 'The user is not registered',
    LOGIN_SUCCESS: 'Your login was successfully',
    GET_PROFILE_SUCCESSFULLY: 'Get profile successfully',
    LOGIN_FAIL: 'Your login failed',
    LOGIN_GOOGLE_SUCCESS: 'Auth logged with google in successful',
    LOGIN_GOOGLE_FAIL: 'Auth logged with google in failed',
    REFRESH_TOKEN_SUCCESS: 'Your refresh token was successfully',
    EMAIL_NOT_FOUND: 'Email not found',
    PLEASE_VERIFY_EMAIL: 'Please verify the email',
    INCORRECT_PASSWORD: 'Incorrect password',
    ACCOUNT_INACTIVE: 'The account inactive',
    SAME_LANGUAGE_CODE: 'Same language code',
    CHANGE_LANGUAGE_CODE_SUCCESSFULLY: 'Change language code successfully',
    REFRESH_TOKEN_INVALID: 'Refresh token invalid',
    VERIFIED_EMAIL: 'Verified email',
    RESEND_EMAIL_SUCCESSFULLY: 'Resend email successfully',
    TOKEN_INVALID: 'Token invalid',
    VERIFY_EMAIL_SUCCESSFULLY: 'Verify email successfully',
    CHANGE_PASSWORD_SUCCESSFULLY: 'Change password succcessfully',
    FORGOT_PASSWORD_SUCCESSFULLY: 'Forgot password successfully',
    LOGOUT_SUCCESSFULLY: 'Logout successfully',

    //Message
    SEND_MESSAGE_SUCCESS: 'Send message successfully',
    SEND_MESSAGE_FAIL: 'Send message failed',

    // Group chat
    CREATE_GROUP_SUCCESSFULLY: 'Create group successfully',
    UPDATE_GROUP_SUCCESSFULLY: 'Update group successfully',
    GROUP_NOT_FOUND: 'Group chat not found',
    MEMBER_NOT_FOUND: 'Member not found',
    DELETE_GROUP_SUCCESS: 'Delete group successfully',
    ADD_MEMBER_TO_GROUP_SUCCESS: 'Add member to group successfully',
    MEMBER_ALREADY_EXIST_IN_GROUP: 'Member already exist in group',
    DELETE_MEMBER_SUCCESS: 'Delete member from group successfully',
    EXCHANGE_ADMIN_ID_REQUIRED: 'Exchange admin id required',
    USER_NOT_IN_GROUP: 'User not in the group',

    //User
    CREATE_USER_SUCCESS: 'Create user successfully',
    UPDATE_USER_SUCCESS: 'Update user successfully',
    DELETE_USER_SUCCESS: 'Delete user successfully',

    //Message
    SEND_MESSAGE_SUCCESS: 'Send message successfully',
    SEND_MESSAGE_FAIL: 'Send message failed',
    DELETE_MESSAGE_SUCCESS: 'Delete message successfully',
    RECALL_MESSAGE_SUCCESS: 'Recall message successfully',
    NO_PERMISSION_RECALL_MESSAGE: 'You have no permission to recall this message',
    NO_PERMISSION_EDIT_MESSAGE: 'You have no permission to edit this message',
    EDIT_MESSAGE_SUCCESS: 'Edit message successfully',
    MESSAGE_NOT_FOUND: 'Message not found',
    MESSAGE_TOO_OLD_TO_EDIT: 'Message too old to edit (More than 30p)',
    //Conversation
    REMOVE_CONVERSATION_SUCCESS: 'Remove conversation success',
    CONVERSATION_NOT_FOUND: 'Conversation not found',

    //Friend
    FRIEND_REQUEST_SENT_SUCCESS: 'Friend request sent',
    FRIEND_REQUEST_SENT_FAIL: 'Friend request sent failed',
    ACCEPT_FRIEND_SUCCESS: 'Accept friend success',
    ACCEPT_FRIEND_FAIL: 'Accept friend failed',
    REJECT_FRIEND_SUCCESS: 'Reject friend success',
    REJECT_FRIEND_FAIL: 'Reject friend failed',
    ALREADY_FRIEND: 'Your are already friend with this user',
    DELETE_FRIEND_SUCCESS: 'Delete friend success',
    NO_PERMISSION_ACCEPT_REQUEST: 'You have no permission to accept request',
    NO_PERMISSION_REJECT_REQUEST: 'You have no permission to reject request',
    NO_PERMISSION_REMOVE_REQUEST: 'You have no permission to remove request',
    REMOVE_FRIEND_REQUEST_SUCCESS: 'Remove friend request success',
    REMOVE_FRIEND_SUCCESS: 'Remove friend success',

    //Emoji
    ADD_EMOJI_MESSAGE_SUCCESS: 'Add emoji success',
    UPDATE_EMOJI_MESSAGE_SUCCESS: 'Update emoji success',
    REMOVE_EMOJI_MESSAGE_SUCCESS: 'Remove emoji success',
    NOT_YOUR_EMOJI: 'Not your emoji',
};

module.exports = STATUS_MESSAGE;
