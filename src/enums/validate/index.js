const {
    createGroupBody,
    addMemberGroupBody,
    deleteMemberGroupBody,
    updateGroupBody,
    validateIdMongodb,
} = require('@/validations');

module.exports = {
    gender: ['male', 'female', 'other'],
    languageCode: ['vn', 'en', 'jp'],
    eventValidators: {
        'create group': createGroupBody,
        'add member': addMemberGroupBody,
        'delete member': deleteMemberGroupBody,
        'update group': updateGroupBody,
        'delete group': validateIdMongodb,
    },
};
