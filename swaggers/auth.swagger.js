const authSwagger = {
    '/auth/sign-up': {
        post: {
            tags: ['Auth'],
            description: 'Creating accounts for access',
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                fullName: {
                                    description: 'Full name of the user',
                                    type: 'string',
                                },
                                address: {
                                    description: 'Address of the user',
                                    type: 'string',
                                },
                                gender: {
                                    description: 'Gender of the user',
                                    type: 'string',
                                },
                                email: {
                                    description: 'Email of the user',
                                    type: 'string',
                                    example: 'string@gmail.com',
                                },
                                password: {
                                    description: 'Password of the user',
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Creating accounts successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/auth/sign-in': {
        post: {
            tags: ['Auth'],
            description: 'Verifying identity for personalized interactions and services',
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                email: {
                                    description: 'Email of the user',
                                    type: 'string',
                                    example: 'string@gmail.com',
                                },
                                password: {
                                    description: 'Password of the user',
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Login successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/auth/refresh-token': {
        post: {
            tags: ['Auth'],
            description: 'Refresh token for access',
            responses: {
                200: {
                    description: 'Refresh token successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/auth/logout': {
        delete: {
            tags: ['Auth'],
            description: 'Logout for user',
            responses: {
                200: {
                    description: 'Logout successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = authSwagger;
