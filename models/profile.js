"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: "UserId" });
    }

    get age() {
      if (!this.birthDate) return null;
      const today = new Date();
      const birth = new Date(this.birthDate);
      let years = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        years -= 1;
      }
      return years;
    }

    getGenderLabel() {
      if (this.gender === "male") return "Laki-laki";
      if (this.gender === "female") return "Perempuan";
      if (this.gender === "other") return "Lainnya";
      return "-";
    }
  }

  Profile.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: DataTypes.TEXT,
      phoneNumber: DataTypes.STRING,
      birthDate: DataTypes.DATEONLY,
      gender: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Profile",
    }
  );

  return Profile;
};
