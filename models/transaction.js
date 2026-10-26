"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, { foreignKey: "UserId" });
      Transaction.belongsTo(models.Ticket, { foreignKey: "TicketId" });
    }

    get formattedTotal() {
      return `Rp${Number(this.totalPrice).toLocaleString("id-ID")}`;
    }
  }

  Transaction.init(
    {
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
      },
      totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        validate: { isIn: [["pending", "paid", "cancel"]] },
      },
      UserId: DataTypes.INTEGER,
      TicketId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );

  return Transaction;
};
