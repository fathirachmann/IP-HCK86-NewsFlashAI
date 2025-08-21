const request = require('supertest');
const app = require('../app');

// Mock jwt signing so tests don't require env secret
jest.mock('../utils/jwt', () => ({
  signToken: jest.fn(() => 'dummy-token')
}));

// Mock models
jest.mock('../models', () => ({
  User: {
    findOrCreate: jest.fn()
  }
}));

// Ensure verifyIdToken mock is properly set up
jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      const mockClient = {
        verifyIdToken: jest.fn((options) => {
          if (options.idToken === 'valid-token') {
            return {
              getPayload: () => ({
                email: 'user@example.com',
                name: 'User Example',
                picture: 'http://pic'
              })
            };
          } else if (options.idToken === 'expired-token') {
            throw new Error('Token has expired'); // Updated error message
          } else {
            throw new Error('Invalid token');
          }
        })
      };
      return mockClient;
    })
  };
});

const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');

describe('Auth endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/google - should return 400 when idToken missing', async () => {
    const res = await request(app).post('/auth/google').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('message');
  });

  it('POST /auth/google - should return 401 for invalid token', async () => {
    const res = await request(app).post('/auth/google').send({ idToken: 'bad' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /auth/google - should return 401 for expired token', async () => {
    const res = await request(app).post('/auth/google').send({ idToken: 'expired-token' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  // controller wraps Google errors into a GoogleAuthError with message "Invalid Google ID token"
  expect(res.body.error.message).toBe('Invalid Google ID token');
  });

  it('POST /auth/google - should create/find user and return token on success', async () => {
    // User.findOrCreate should return [user, created]
    User.findOrCreate.mockResolvedValue([{ id: 1, email: 'user@example.com', name: 'User Example', picture: 'http://pic' }, true]);

    const res = await request(app).post('/auth/google').send({ idToken: 'valid-token' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token', 'dummy-token');
    expect(res.body).toHaveProperty('email', 'user@example.com');
    expect(User.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'user@example.com' } })
    );
  });
});
