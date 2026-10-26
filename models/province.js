"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Province extends Model {
    static associate(models) {
      Province.hasMany(models.Destination, { foreignKey: "ProvinceId" });
    }
  }

  Province.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Province",
    }
  );

  return Province;
};
