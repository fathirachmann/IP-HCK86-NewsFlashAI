"use strict";

const { Article } = require("../models");
const { httpError } = require("../utils/httpError");

async function checkArticleOwner(req, res, next) {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);

    if (!article) throw httpError.notFound("Article not found");
    if (article.userId !== req.user.id) {
      throw httpError.forbidden("You do not own this article");
    }

    req.article = article
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkArticleOwner;
