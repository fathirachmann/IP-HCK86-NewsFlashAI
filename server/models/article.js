"use strict";
const { Model, STRING } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.User, { foreignKey: "userId" });
      Article.hasMany(models.Note, {
        foreignKey: "articleId",
        onDelete: "CASCADE",
      });
    }
  }
  Article.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sourceId: DataTypes.STRING,
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      title: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      publishedAt: DataTypes.DATE,
      summary: DataTypes.TEXT,
      sentiment: DataTypes.STRING,
      keywords: DataTypes.TEXT,
      tags: DataTypes.STRING,
      impact: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Article",
    }
  );
  return Article;
};
