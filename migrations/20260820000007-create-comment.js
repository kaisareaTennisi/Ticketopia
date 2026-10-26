"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.addIndex("Comments", ["UserId"], {
      name: "comments_user_id_idx",
    });
    await queryInterface.addIndex("Comments", ["DestinationId"], {
      name: "comments_destination_id_idx",
    });
    await queryInterface.addIndex("Comments", ["UserId", "DestinationId"], {
      unique: true,
      name: "comments_user_destination_unique",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "Comments"
      ADD CONSTRAINT comments_rating_check CHECK (rating >= 1 AND rating <= 5);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Comments");
  },
};
