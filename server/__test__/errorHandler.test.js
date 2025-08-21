const express = require('express');
const request = require('supertest');
const errorHandler = require('../middlewares/errorHandler');

function makeApp(errToThrow) {
  const app = express();
  app.get('/', (req, res, next) => next(errToThrow));
  app.use(errorHandler);
  return app;
}

describe('errorHandler middleware mappings', () => {
  test('handles axios / external API errors', async () => {
    const axiosErr = new Error('Upstream');
    axiosErr.isAxiosError = true;
    axiosErr.response = { status: 502, data: { message: 'Upstream fail' } };
    axiosErr.config = { url: 'http://up', params: { q: 'x' }, method: 'get' };

    const app = makeApp(axiosErr);
    const res = await request(app).get('/');
    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('EXTERNAL_API_ERROR');
    expect(res.body.error.message).toBe('Upstream fail');
    expect(res.body.error.details.upstreamStatus).toBe(502);
  });

  test('maps JsonWebTokenError to 401 INVALID_TOKEN', async () => {
    const e = new Error('jwt bad');
    e.name = 'JsonWebTokenError';
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
    expect(res.body.error.message).toBe('Invalid authentication token');
  });

  test('maps TokenExpiredError to 401 TOKEN_EXPIRED', async () => {
    const e = new Error('expired');
    e.name = 'TokenExpiredError';
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    expect(res.body.error.message).toBe('Authentication token has expired');
  });

  test('maps GoogleAuthError to 401 GOOGLE_AUTH_ERROR with original message', async () => {
    const e = new Error('Google failed');
    e.name = 'GoogleAuthError';
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('GOOGLE_AUTH_ERROR');
    expect(res.body.error.message).toBe('Google failed');
  });

  test('maps SequelizeValidationError to 400 VALIDATION_ERROR and returns details', async () => {
    const e = new Error('validation');
    e.name = 'SequelizeValidationError';
    e.errors = [{ path: 'email', message: 'Invalid email' }];
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details[0]).toEqual({ field: 'email', message: 'Invalid email' });
  });

  test('maps SequelizeUniqueConstraintError to 409 UNIQUE_CONSTRAINT', async () => {
    const e = new Error('unique');
    e.name = 'SequelizeUniqueConstraintError';
    e.errors = [{ path: 'username', message: 'Taken' }];
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('UNIQUE_CONSTRAINT');
  });

  test('maps SequelizeForeignKeyConstraintError to 400 FK_CONSTRAINT and attaches details', async () => {
    const e = new Error('fk');
    e.name = 'SequelizeForeignKeyConstraintError';
    e.table = 'Users';
    e.fields = { userId: '1' };
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('FK_CONSTRAINT');
    expect(res.body.error.details.table).toBe('Users');
  });

  test('maps SequelizeDatabaseError to 400 DB_ERROR', async () => {
    const e = new Error('db');
    e.name = 'SequelizeDatabaseError';
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DB_ERROR');
  });

  test('respects err.code shortcuts (BAD_REQUEST, NOT_FOUND, FORBIDDEN, UNAUTHORIZED)', async () => {
    const codes = [
      ['BAD_REQUEST', 400],
      ['NOT_FOUND', 404],
      ['FORBIDDEN', 403],
      ['UNAUTHORIZED', 401]
    ];

    for (const [code, status] of codes) {
      // use plain object to ensure branch checks on err.code
      const e = { code, message: 'shortcut' };
      const app = makeApp(e);
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app).get('/');
      expect(res.status).toBe(status);
      expect(res.body.error.message).toBe('shortcut');
    }
  });

  test('default internal error returns 500 and INTERNAL_ERROR code', async () => {
    const e = new Error('boom');
    const app = makeApp(e);
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('boom');
  });
});
