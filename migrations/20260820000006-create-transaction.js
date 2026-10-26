"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      TicketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Tickets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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

    await queryInterface.addIndex("Transactions", ["UserId"], {
      name: "transactions_user_id_idx",
    });
    await queryInterface.addIndex("Transactions", ["TicketId"], {
      name: "transactions_ticket_id_idx",
    });
    await queryInterface.addIndex("Transactions", ["status"], {
      name: "transactions_status_idx",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "Transactions"
      ADD CONSTRAINT transactions_quantity_check CHECK (quantity > 0),
      ADD CONSTRAINT transactions_total_price_check CHECK ("totalPrice" >= 0),
      ADD CONSTRAINT transactions_status_check
        CHECK (status IN ('pending', 'paid', 'cancel'));
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Transactions");
  },
};
