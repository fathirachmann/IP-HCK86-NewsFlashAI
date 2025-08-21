"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.Article, { foreignKey: "articleId" });
    }
  }
  Note.init(
    {
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    { sequelize, modelName: "Note" }
  );
  return Note;
};
