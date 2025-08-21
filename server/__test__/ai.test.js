// Mocks must be registered before requiring app
jest.mock('../utils/jwt', () => ({
	signToken: jest.fn(() => 'dummy-token'),
	verifyToken: jest.fn(() => ({ id: 1, email: 'test@test.com' }))
}));

jest.mock('../models', () => ({
	User: { findByPk: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com', name: 'Test' }) },
	Article: { findByPk: jest.fn(), create: jest.fn() }
}));

// Mock extractTextFromUrl so URL path provides sufficient content
jest.mock('../utils/extractText', () => ({
	extractTextFromUrl: jest.fn(async (url) => 'This is a sufficiently long content. '.repeat(10))
}));

// Ensure GoogleGenAI mock is properly set up
jest.mock('@google/genai', () => ({
	GoogleGenAI: jest.fn().mockImplementation(() => ({
		models: {
			generateContent: jest.fn((options) => {
				if (options.content) {
					return Promise.resolve({
						text: JSON.stringify({
							bullets: ['a', 'b', 'c', 'd', 'e'],
							sentiment: 'neutral',
							keywords: ['x'],
							impact: 'Low - none'
						})
					});
				}
				throw new Error('Not enough content to summarize.');
			})
		}
	}))
}));

const request = require('supertest');
const app = require('../app');
const { GoogleGenAI } = require('@google/genai');

describe('/ai/summarize endpoint', () => {
	beforeEach(() => jest.clearAllMocks());

	it('returns 400 when no content/url/articleId provided', async () => {
		const res = await request(app)
			.post('/ai/summarize')
			.set('Authorization', `Bearer dummy-token`)
			.send({});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('error');
	});

	it('returns 400 when content too short', async () => {
		const res = await request(app)
			.post('/ai/summarize')
			.set('Authorization', `Bearer dummy-token`)
			.send({ content: 'short' });
		expect(res.status).toBe(400);
	});

	it('returns summary for valid content (mocked AI)', async () => {
		const longContent = 'This is a sufficiently long content. '.repeat(10);
		const res = await request(app)
			.post('/ai/summarize')
			.set('Authorization', `Bearer dummy-token`)
			.send({ content: longContent });

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('bullets');
		expect(Array.isArray(res.body.bullets)).toBe(true);
		expect(res.body).toHaveProperty('sentiment');
	});

	it('returns 401 if no token provided', async () => {
		const res = await request(app)
			.post('/ai/summarize')
			.send({ content: 'This is a sufficiently long content. '.repeat(10) });
		expect(res.status).toBe(401);
	});
});

describe('Additional /ai/summarize tests', () => {
	it('returns 404 for invalid articleId', async () => {
		const res = await request(app)
			.post('/ai/summarize')
			.set('Authorization', `Bearer dummy-token`)
			.send({ articleId: 999 });

		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty('error', 'Article not found');
	});

	it('creates a new article when url and user are provided', async () => {
		const res = await request(app)
			.post('/ai/summarize')
			.set('Authorization', `Bearer dummy-token`)
			.send({ url: 'http://example.com/article' });

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('savedArticleId');
		expect(res.body.savedArticleId).not.toBeNull();
	});

	it('updates an existing article when articleId is valid', async () => {
		const mockArticle = { id: 1, update: jest.fn() };
		require('../models').Article.findByPk.mockResolvedValue(mockArticle);

		const res = await request(app)
			.post('/ai/summarize')
			.set('Authorization', `Bearer dummy-token`)
			.send({ articleId: 1 });

		expect(res.status).toBe(200);
		expect(mockArticle.update).toHaveBeenCalled();
	});

	it('handles invalid AI response gracefully', async () => {
		require('@google/genai').GoogleGenAI.mockImplementation(() => ({
			models: {
				generateContent: jest.fn(() => Promise.resolve({ text: 'invalid json' }))
			}
		}));

		const res = await request(app)
			.post('/ai/summarize')
			.set('Authorization', `Bearer dummy-token`)
			.send({ content: 'This is a sufficiently long content. '.repeat(10) });

		expect(res.status).toBe(502);
		expect(res.body).toHaveProperty('error', 'AI response invalid');
	});
});

