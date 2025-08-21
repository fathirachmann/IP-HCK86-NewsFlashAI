jest.mock('../utils/jwt', () => ({
  signToken: jest.fn(() => 'dummy-token'),
  verifyToken: jest.fn(() => ({ id: 2, email: 'extra@test.com' })),
}));

jest.mock('../models', () => ({
  User: { findByPk: jest.fn().mockResolvedValue({ id: 2, email: 'extra@test.com' }) },
  Article: {
    findByPk: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 999, imageUrl: 'from-create' }),
  },
}));

jest.mock('../utils/extractText', () => ({
  extractTextFromUrl: jest.fn(async (url) => 'This url content is long enough. '.repeat(5)),
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn((opts) => {
        // Default valid JSON
        return Promise.resolve({ text: JSON.stringify({ bullets: ['1','2'], sentiment: 'neutral', keywords: ['k'], impact: 'Low - none' }) });
      }),
    },
  })),
}));

const request = require('supertest');
const app = require('../app');

describe('AiController extra branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('fallback parsing reads JSON block from err.output', async () => {
    // Make AI return raw output containing JSON block
    require('@google/genai').GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: jest.fn(() => Promise.resolve({ text: 'garbage... {"bullets":["x"],"sentiment":"neutral","impact":"Low - ok"} ...' })),
      },
    }));

    const res = await request(app)
      .post('/ai/summarize')
      .set('Authorization', `Bearer dummy-token`)
      .send({ content: 'This is a sufficiently long content. '.repeat(5) });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bullets');
  });

  test('imageUrl from request is returned and saved payload includes imageUrl', async () => {
    // Ensure create will return id and imageUrl
    require('../models').Article.create.mockResolvedValue({ id: 321, imageUrl: 'uploaded-image' });

    const res = await request(app)
      .post('/ai/summarize')
      .set('Authorization', `Bearer dummy-token`)
      .send({ url: 'http://example.com/with-image', imageUrl: 'http://img' });

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBe('http://img');
    expect(res.body.savedArticleId).toBe(321);
  });

  test('persist=false returns summary but does not create article', async () => {
    const res = await request(app)
      .post('/ai/summarize')
      .set('Authorization', `Bearer dummy-token`)
      .send({ content: 'This is a sufficiently long content. '.repeat(5), persist: false });

    expect(res.status).toBe(200);
    expect(res.body.savedArticleId).toBeNull();
    // Article.create should not be called
    expect(require('../models').Article.create).not.toHaveBeenCalled();
  });

  test('existing article by url is updated when found', async () => {
    const mockExisting = { id: 555, update: jest.fn(), imageUrl: null };
    require('../models').Article.findOne.mockResolvedValue(mockExisting);

    const res = await request(app)
      .post('/ai/summarize')
      .set('Authorization', `Bearer dummy-token`)
      .send({ url: 'http://exists' });

    expect(res.status).toBe(200);
    expect(mockExisting.update).toHaveBeenCalled();
    expect(res.body.savedArticleId).toBe(555);
  });

  test('when url exists but no user and no existing article, auth rejects (401)', async () => {
    // Ensure findOne returns null
    require('../models').Article.findOne.mockResolvedValue(null);

    // If no valid user, route should return 401 because auth middleware enforces auth
    const res = await request(app)
      .post('/ai/summarize')
      // no Authorization header
      .send({ url: 'http://anon' });

    expect(res.status).toBe(401);
  });
});
