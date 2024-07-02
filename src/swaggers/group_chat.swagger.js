const groupSwagger = {
    '/conversations/group': {
        post: {
            tags: ['Group'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Create group chat',
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                chatName: {
                                    description: 'Name of group chat',
                                    type: 'string',
                                },
                                users: {
                                    description: 'List user id of group chat',
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        description: 'User id of user',
                                    },
                                },
                                avatar: {
                                    description: 'Avatar of group chat',
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Create group chat successfully',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/conversations/group/add-member': {
        post: {
            tags: ['Group'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Add member to group chat',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            groupId: {
                                description: 'Id of group chat',
                                type: 'string',
                            },
                            memberId: {
                                description: 'id of member',
                                type: 'string',
                            },
                        },
                        required: ['groupId', 'memberId'],
                    },
                },
            },
            responses: {
                200: {
                    description: 'Add member to group chat successfully.',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/conversations/group/delete-member': {
        post: {
            tags: ['Group'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Delete member to group chat',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            groupId: {
                                description: 'Id of group chat',
                                type: 'string',
                            },
                            memberId: {
                                description: 'id of member',
                                type: 'string',
                            },
                        },
                        required: ['groupId', 'memberId'],
                    },
                },
            },
            responses: {
                200: {
                    description: 'Delete member to group chat successfully.',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
    '/conversations/group/{id}': {
        patch: {
            tags: ['Group'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Update group chat',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    description: 'Id of group chat',
                    schema: {
                        type: 'string',
                    },
                    required: true,
                },
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                chatName: {
                                    description: 'Name of group chat',
                                    type: 'string',
                                },
                                avatar: {
                                    description: 'Avatar of group chat',
                                    type: 'string',
                                },
                                background: {
                                    description: 'Background of group chat',
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Update group chat successfully.',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
        delete: {
            tags: ['Group'],
            security: [
                {
                    accessToken: [],
                },
            ],
            description: 'Delete group chat',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    description: 'Id of group chat',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Delete group chat successfully.',
                    content: {
                        'application/json': {},
                    },
                },
            },
        },
    },
};

module.exports = groupSwagger;
