const friendSwagger = {
    '/friends': {
        get: {
            tags: ['Friend'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Get all friends',
            
            responses: {
                200: {
                    description: 'Get all friends successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/friends/{id}': {
        get: {
            tags: ['User'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Send add friend request to other user',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    description: 'Id of user',
                    schema: {
                        type: 'string',
                    },
                }
            ],
            responses: {
                200: {
                    description: 'Send add friend request to other user successfully.',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = friendSwagger;
