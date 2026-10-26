"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tickets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      DestinationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Destinations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Tickets", ["DestinationId"], {
      name: "tickets_destination_id_idx",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "Tickets"
      ADD CONSTRAINT tickets_price_check CHECK (price >= 0),
      ADD CONSTRAINT tickets_stock_check CHECK (stock >= 0);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Tickets");
  },
};
