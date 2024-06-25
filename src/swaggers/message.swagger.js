const messageSwagger = {
    '/messages/{id}': {
        get: {
            tags: ['Message'],
            description: 'Get all message of conversation',
            security: [
                {
                    accessToken: [],
                },
            ],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    description: 'Id of conversation',
                    schema: {
                        type: 'string',
                        example: '6679c40ab0528a3618e7e646',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Get all message of conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/messages/getPaginationMessage/{id}': {
        get: {
            tags: ['Message'],
            description: 'Get all message of conversation',
            security: [
                {
                    accessToken: [],
                },
            ],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    description: 'Id of conversation',
                    schema: {
                        type: 'string',
                        example: '6679c40ab0528a3618e7e646',
                    },
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'limit of messages',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        example: 10,
                        description: 'The numbers of items to return (the default value is 20)',
                    },
                },
                {
                    name: 'search',
                    in: 'query',
                    description: 'search messages by keyword',
                    schema: {
                        type: 'string',
                        description: 'The numbers of items to return (the default value is 20)',
                    },
                },
                {
                    name: 'page',
                    in: 'query',
                    description: 'page of messages',
                    schema: {
                        type: 'integer',
                        description: 'Pagination page number (the default value is 1)',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Get all message of conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/messages/send/': {
        post: {
            tags: ['Message'],
            description: 'Send message',
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
                                message: {
                                    description: 'Send message',
                                    type: 'string',
                                },
                                id: {
                                    description: 'id of receiver',
                                    type: 'string',
                                },
                            },
                            required: ['message'],
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Send message successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = messageSwagger;
