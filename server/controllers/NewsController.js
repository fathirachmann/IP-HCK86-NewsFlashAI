const axios = require("axios");
const { httpError } = require("../utils/httpError");

class NewsController {
  static async search(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 2) {
        throw httpError.badRequest("Query 'q' minimal 2 karakter");
      }

      const resp = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          q,
          apiKey: '29d68a79322243a9b40384e780215301',
          language: "en",
          sortBy: "publishedAt",
          pageSize: 10
        },
        timeout: 10000
      });

      const articles = resp.data.articles.map(a => ({
        sourceId: a.source?.id,
        sourceName: a.source?.name,
        title: a.title,
        url: a.url,
        imageUrl: a.urlToImage,
        publishedAt: a.publishedAt,
        description: a.description
      }));

      res.json({ articles, totalResults: resp.data.totalResults });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NewsController;
