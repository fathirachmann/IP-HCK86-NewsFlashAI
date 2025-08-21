// Mock jwt and models before requiring app
jest.mock('../utils/jwt', () => ({
  signToken: jest.fn(() => 'dummy-token'),
  verifyToken: jest.fn(() => ({ id: 1, email: 'test@test.com' }))
}));

// Ensure Note.findByPk mock is properly set up
jest.mock('../models', () => ({
  Note: {
    findByPk: jest.fn((id) => {
      if (id === 2) {
        return Promise.resolve({
          id: 2,
          articleId: 1,
          content: 'old',
          update: jest.fn().mockResolvedValue({ id: 2, content: 'updated' }),
          destroy: jest.fn().mockResolvedValue()
        });
      }
      return Promise.resolve(null);
    }),
    findAll: jest.fn(),
    create: jest.fn()
  },
  User: { findByPk: jest.fn().mockResolvedValue({ id: 1 }) },
  Article: { findByPk: jest.fn((id) => Promise.resolve({ id, userId: 1 })) }
}));

const request = require('supertest');
const app = require('../app');
const { Note } = require('../models');

describe('Note endpoints', () => {
  const token = 'dummy-token';

  beforeEach(() => jest.clearAllMocks());

  it('GET /articles/:id/notes requires auth', async () => {
    const res = await request(app).get('/articles/1/notes');
    expect(res.status).toBe(401);
  });

  it('GET /articles/:id/notes returns notes', async () => {
    Note.findAll = jest.fn().mockResolvedValue([{ id: 1, articleId: 1, content: 'n' }]);
    const res = await request(app).get('/articles/1/notes').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /articles/:id/notes creates note and validates content', async () => {
    Note.create = jest.fn().mockResolvedValue({ id: 2, articleId: 1, content: 'new' });
    const res = await request(app).post('/articles/1/notes').set('Authorization', `Bearer ${token}`).send({ content: 'new' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');

    const res2 = await request(app).post('/articles/1/notes').set('Authorization', `Bearer ${token}`).send({ content: '' });
    expect(res2.status).toBe(400);
  });

  it('PUT /notes/:noteId updates and DELETE /notes/:noteId deletes', async () => {
    const mock = { id: 2, articleId: 1, content: 'old', update: jest.fn().mockResolvedValue({ id: 2, content: 'updated' }), destroy: jest.fn().mockResolvedValue() };
    Note.findByPk = jest.fn().mockResolvedValue(mock);

    const putRes = await request(app).put('/notes/2').set('Authorization', `Bearer ${token}`).send({ content: 'updated' });
    expect(putRes.status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith({ content: 'updated' });

    const delRes = await request(app).delete('/notes/2').set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);
    expect(mock.destroy).toHaveBeenCalled();
  });
});
