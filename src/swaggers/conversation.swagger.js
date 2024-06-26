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
        post: {
            tags: ['Conversation'],
            description: 'Create single chat',
            security: [
                {
                    accessToken: [],
                },
            ],
            parameters: [
                {
                    name: 'userId',
                    in: 'query',
                    description: 'Id của người dùng mà bạn muốn nhắn tin',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                201: {
                    description: 'Access conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = conversationSwagger;
