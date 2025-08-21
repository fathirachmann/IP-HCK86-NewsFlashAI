jest.mock('axios');
const axios = require('axios');
const request = require('supertest');
const app = require('../app');

describe('/news/search endpoint', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  it('returns 400 when q missing or too short', async () => {
    let res = await request(app).get('/news/search');
    expect(res.status).toBe(400);
    res = await request(app).get('/news/search?q=a');
    expect(res.status).toBe(400);
  });

  it('returns articles on valid query (mock axios)', async () => {
    axios.get.mockResolvedValue({ data: { articles: [{ source: { id: 'cnn', name: 'CNN' }, title: 'Test', url: 'http://t' }], totalResults: 1 } });
    const res = await request(app).get('/news/search?q=tesla');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('articles');
    expect(res.body).toHaveProperty('totalResults');
  });
});
