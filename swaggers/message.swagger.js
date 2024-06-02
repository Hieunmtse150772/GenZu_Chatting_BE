const messageSwagger = {
    '/messages/:id': {
        post: {
            tags: ['Message'],
            description: 'Get all message of conversation',
            parameters: [
                {
                    name: 'receiverId',
                    in: 'query',
                    description: 'Id of receiver',
                    schema: {
                        type: 'string',
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
                401: {
                    description: 'Get all message of conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    'messages/send/:id': {
        post: {
            tags: ['Message'],
            description: 'Create comments',
            parameters: [
                {
                    name: 'token',
                    in: 'header',
                    description: 'Token to be passed as a header',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    example: 'Bearer ',
                },
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                comment: {
                                    description: 'Comment of the user',
                                    type: 'string',
                                },
                                userId: {
                                    description: 'Id of the user',
                                    type: 'string',
                                },
                                movieId: {
                                    description: 'Id of the movie',
                                    type: 'string',
                                },
                            },
                            required: ['title', 'type', 'genre', 'idMovies'],
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Create comments successfully',
                    content: {
                        'application/json': {},
                    },
                },
                401: {
                    description: 'Get all message of conversation successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = messageSwagger;
