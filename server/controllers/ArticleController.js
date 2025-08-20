const { Article } = require("../models");

class ArticleController {
  static async getAll(req, res, next) {
    try {
      const articles = await Article.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(articles);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { sourceId, url, title, imageUrl, publishedAt, tags } = req.body;

      const article = await Article.create({
        userId: req.user.id,
        sourceId,
        url,
        title,
        imageUrl,
        publishedAt,
        tags,
      });

      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { tags } = req.body;

      const article = await Article.findByPk(id);
      if (!article) throw httpError.notFound("Article not found");
      if (article.userId !== req.user.id) {
        throw httpError.forbidden("You do not own this article");
      }

      await article.update({ tags });
      res.json(article);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const article = await Article.findOne({
        where: { id, userId: req.user.id },
      });
      if (!article) throw httpError.notFound("Article not found");

      await article.destroy();
      res.json({ message: "Article deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ArticleController;
