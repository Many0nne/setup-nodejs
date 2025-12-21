export const openapi = {
  openapi: '3.0.3',
  info: { title: 'NodeJS Setup API', version: '0.1.0' },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: { '201': { description: 'Created' }, '409': { description: 'Email taken' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
          '401': { description: 'Invalid credentials' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        description:
          'Uses HttpOnly refresh token cookie to issue a new access token and rotate the refresh token.',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: { id: { type: 'string' }, email: { type: 'string' } },
                    },
                    token: { type: 'string', description: 'JWT access token' },
                  },
                  required: ['user', 'token'],
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout',
        description: 'Revokes refresh token and clears cookie.',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/users/me': {
      get: {
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
} as const;
