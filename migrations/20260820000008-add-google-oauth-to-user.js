"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "googleId", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "googleId");

    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
