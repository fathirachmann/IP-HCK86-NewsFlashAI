// Mock jwt and models before requiring app
jest.mock('../utils/jwt', () => ({
  signToken: jest.fn(() => 'dummy-token'),
  verifyToken: jest.fn(() => ({ id: 1, email: 'test@test.com' }))
}));

jest.mock('../models', () => ({
  Article: {},
  User: { findByPk: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }) }
}));

const request = require('supertest');
const app = require('../app');
const { Article } = require('../models');

describe('Article endpoints', () => {
  const token = 'dummy-token';

  beforeEach(() => jest.clearAllMocks());

  it('GET /articles requires auth', async () => {
    const res = await request(app).get('/articles');
    expect(res.status).toBe(401);
  });

  it('GET /articles returns list for user', async () => {
    Article.findAll = jest.fn().mockResolvedValue([{ id: 1, userId: 1, title: 'T' }]);
    const res = await request(app).get('/articles').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /articles creates article', async () => {
    const mock = { id: 2, userId: 1, title: 'T', url: 'http://a' };
    Article.create = jest.fn().mockResolvedValue(mock);
    const res = await request(app).post('/articles').set('Authorization', `Bearer ${token}`).send({ title: 'T', url: 'http://a' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(mock);
  });

  it('PUT /articles/:id updates tags', async () => {
    const mock = { id: 2, userId: 1, tags: null, update: jest.fn().mockResolvedValue({ id: 2, tags: 'tag1' }) };
    Article.findByPk = jest.fn().mockResolvedValue(mock);
    const res = await request(app).put('/articles/2').set('Authorization', `Bearer ${token}`).send({ tags: 'tag1' });
    expect(res.status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith({ tags: 'tag1' });
  });

  it('PUT /articles/:id returns 404 when article not found', async () => {
    Article.findByPk = jest.fn().mockResolvedValue(null);
    const res = await request(app).put('/articles/999').set('Authorization', `Bearer ${token}`).send({ tags: 'x' });
    expect(res.status).toBe(404);
  });

  it('PUT /articles/:id returns 403 when user does not own the article', async () => {
    const mock = { id: 3, userId: 2, tags: null, update: jest.fn() };
    Article.findByPk = jest.fn().mockResolvedValue(mock);
    const res = await request(app).put('/articles/3').set('Authorization', `Bearer ${token}`).send({ tags: 'x' });
    expect(res.status).toBe(403);
  });

  it('DELETE /articles/:id deletes article', async () => {
  const mock = { id: 2, userId: 1, destroy: jest.fn().mockResolvedValue() };
  // checkArticleOwner uses findByPk first, so mock it to an owned article
  Article.findByPk = jest.fn().mockResolvedValue(mock);
  Article.findOne = jest.fn().mockResolvedValue(mock);
  const res = await request(app).delete('/articles/2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(mock.destroy).toHaveBeenCalled();
  });

  it('DELETE /articles/:id returns 404 when article not found', async () => {
  // make checkArticleOwner pass (owned article) but controller's findOne returns null
  const owned = { id: 999, userId: 1 };
  Article.findByPk = jest.fn().mockResolvedValue(owned);
  Article.findOne = jest.fn().mockResolvedValue(null);
  const res = await request(app).delete('/articles/999').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(404);
  });
});
