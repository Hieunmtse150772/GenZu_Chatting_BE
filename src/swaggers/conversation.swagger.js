const conversationSwagger = {
    '/conversations': {
        get: {
            tags: ['Conversation'],
            description: 'Get all conversations of user',
            security: [
                {
                    accessToken: [],
                },
            ],
            parameters: [],
            responses: {
                200: {
                    description: 'Get all conversation of users successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = conversationSwagger;
