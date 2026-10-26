"use strict";

const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$/;

async function hashPasswordIfNeeded(user) {
  if (!user.password) return;
  if (BCRYPT_HASH.test(user.password)) return;
  user.password = await bcrypt.hash(user.password, 10);
}

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Profile, { foreignKey: "UserId" });
      User.hasMany(models.Transaction, { foreignKey: "UserId" });
      User.hasMany(models.Comment, { foreignKey: "UserId" });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user",
        validate: { isIn: [["user", "admin"]] },
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: hashPasswordIfNeeded,
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            await hashPasswordIfNeeded(user);
          }
        },
      },
    }
  );

  return User;
};
