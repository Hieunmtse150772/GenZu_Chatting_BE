const userSwagger = {
    '/users/sidebar': {
        get: {
            tags: ['User'],
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
};

module.exports = userSwagger;
