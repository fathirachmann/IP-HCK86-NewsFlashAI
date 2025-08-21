jest.mock('axios');
const axios = require('axios');
const { extractTextFromUrl } = require('../utils/extractText');

describe('extractTextFromUrl', () => {
  beforeEach(() => jest.resetAllMocks());

  test('returns combined ogTitle, metaDesc and long paragraphs', async () => {
    const html = `
      <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Meta description here">
          <meta property="og:title" content="OG Title">
        </head>
        <body>
          <p>Short para</p>
          <p>${'Long paragraph content '.repeat(5)}</p>
          <p>${'Another long paragraph '.repeat(3)}</p>
        </body>
      </html>`;

    axios.get.mockResolvedValue({ data: html });
    const res = await extractTextFromUrl('http://example.com');
    expect(res).toContain('OG Title');
    expect(res).toContain('Meta description here');
    expect(res).toContain('Long paragraph content');
  });

  test('falls back to title and meta when no paragraphs', async () => {
    const html = `
      <html>
        <head>
          <title>Only Title</title>
          <meta name="description" content="Only meta">
        </head>
        <body>
        </body>
      </html>`;

    axios.get.mockResolvedValue({ data: html });
    const res = await extractTextFromUrl('http://no-paras');
    expect(res).toContain('Only Title');
    expect(res).toContain('Only meta');
  });

  test('ignores short paragraphs (<=40 chars)', async () => {
    const html = `
      <html>
        <head>
          <title>Title</title>
        </head>
        <body>
          <p>${'a'.repeat(20)}</p>
          <p>${'b'.repeat(41)}</p>
        </body>
      </html>`;

    axios.get.mockResolvedValue({ data: html });
    const res = await extractTextFromUrl('http://short-paras');
    expect(res).toContain('b'.repeat(41));
    expect(res).not.toContain('a'.repeat(20));
  });

  test('returns empty string if no meaningful content', async () => {
    const html = `
      <html>
        <head></head>
        <body></body>
      </html>`;

    axios.get.mockResolvedValue({ data: html });
    const res = await extractTextFromUrl('http://empty');
    expect(res).toBe('');
  });
});
