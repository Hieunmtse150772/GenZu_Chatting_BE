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
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                userId: {
                                    description: 'Id của người dùng mà bạn muốn nhắn tin',
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Access conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
        patch: {
            tags: ['Conversation'],
            description: 'Redo history conversation',
            security: [
                {
                    accessToken: [],
                },
            ],
            parameters: [
                {
                    name: 'id',
                    in: 'query',
                    description: 'Id of conversation',
                    schema: {
                        type: 'string',
                        example: '6679c40ab0528a3618e7e646',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Redo history conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
        delete: {
            tags: ['Conversation'],
            description: 'Delete history conversation by one side',
            security: [
                {
                    accessToken: [],
                },
            ],
            parameters: [
                {
                    name: 'id',
                    in: 'query',
                    description: 'Id of conversation',
                    schema: {
                        type: 'string',
                        example: '6679c40ab0528a3618e7e646',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Delete history conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = conversationSwagger;
