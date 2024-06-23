const userSwagger = {
    '/users/sidebar': {
        get: {
            tags: ['User'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Get user for sidebar',

            responses: {
                200: {
                    description: 'Get user for sidebar successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/users/searchUsers': {
        get: {
            tags: ['User'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Get user by keyword',
            parameters: [
                {
                    name: 'search',
                    in: 'query',
                    description: 'Name/email of user',
                    schema: {
                        type: 'string',
                        example: 'hieunmt2001@gmail.com',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Get user by email successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = userSwagger;
