const { httpError } = require('../utils/httpError');

describe('httpError util', () => {
  test('creates Error with status and code when provided', () => {
    const err = httpError(500, 'Server boom', 'SERVER_ERROR');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Server boom');
    expect(err.status).toBe(500);
    expect(err.code).toBe('SERVER_ERROR');
  });

  test('does not set code when omitted', () => {
    const err = httpError(418, "I'm a teapot");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("I'm a teapot");
    expect(err.status).toBe(418);
    expect(err.code).toBeUndefined();
  });

  test('badRequest sets 400 and default code, and allows custom code', () => {
    const a = httpError.badRequest('Bad input');
    expect(a).toBeInstanceOf(Error);
    expect(a.status).toBe(400);
    expect(a.message).toBe('Bad input');
    expect(a.code).toBe('BAD_REQUEST');

    const b = httpError.badRequest('Bad input', 'CUSTOM_BAD');
    expect(b.code).toBe('CUSTOM_BAD');
  });

  test('unauthorized default message and code', () => {
    const err = httpError.unauthorized();
    expect(err.status).toBe(401);
    expect(err.message).toBe('Unauthorized');
    expect(err.code).toBe('UNAUTHORIZED');
  });

  test('forbidden default message and code', () => {
    const err = httpError.forbidden();
    expect(err.status).toBe(403);
    expect(err.message).toBe('Forbidden');
    expect(err.code).toBe('FORBIDDEN');
  });

  test('notFound default message and code', () => {
    const err = httpError.notFound();
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not Found');
    expect(err.code).toBe('NOT_FOUND');
  });
});
