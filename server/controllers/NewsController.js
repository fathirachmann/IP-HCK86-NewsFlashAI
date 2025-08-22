const axios = require("axios");
const { httpError } = require("../utils/httpError");

class NewsController {
  static async search(req, res, next) {
    try {
      const { q, page } = req.query;
      if (q === undefined || q.length < 3) {
        return next(httpError(400, "Query parameter 'q' is required and must be at least 3 characters long."));
      }

      const resp = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          q,
          apiKey: process.env.NEWS_API_KEY || "29d68a79322243a9b40384e780215301",
          language: "en",
          sortBy: "publishedAt",
          pageSize: 9,
          page
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

      res.status(200).json({ articles, totalResults: resp.data.totalResults });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NewsController;
