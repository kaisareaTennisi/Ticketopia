"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, { foreignKey: "UserId" });
      Comment.belongsTo(models.Destination, { foreignKey: "DestinationId" });
    }
  }

  Comment.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: { min: 1, max: 5 },
      },
      UserId: DataTypes.INTEGER,
      DestinationId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );

  return Comment;
};
