const userSwagger = {
    '/users/update/{id}': {
        patch: {
            tags: ['User'],
            description: 'Update profile of user',
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
                                fullName: {
                                    description: 'Fullname of user',
                                    type: 'string',
                                },
                                address: {
                                    description: 'Address of user',
                                    type: 'string',
                                },
                                gender: {
                                    description: 'Gender of user',
                                    type: 'string',
                                    example: 'male',
                                },
                                email: {
                                    description: 'Email of user',
                                    type: 'string',
                                    example: 'string@gmail.com',
                                },
                                phone_number: {
                                    description: 'Phone of user',
                                    type: 'string',
                                },
                                picture: {
                                    description: 'Picture of user',
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Update profile was successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
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
    '/users/getUserById': {
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
                    name: 'userId',
                    in: 'query',
                    description: 'Id of user(Id của người dùng mà bạn muốn lấy thông tin)',
                    schema: {
                        type: 'string',
                        example: '667bbe7cd4df68dfbbd89a4c',
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
