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
      },
    },
  },
  '/messages/send/{id}': {
    post: {
      tags: ['Message'],
      description: 'Send message',
      security: [
        {
          accessToken: [],
        },
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Id of receiver',
          schema: {
            type: 'string',
          },
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
