"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      Ticket.belongsTo(models.Destination, { foreignKey: "DestinationId" });
      Ticket.hasMany(models.Transaction, { foreignKey: "TicketId" });
    }

    get formattedPrice() {
      if (this.price == null) return "-";
      return `Rp${Number(this.price).toLocaleString("id-ID")}`;
    }
  }

  Ticket.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      DestinationId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Ticket",
    }
  );

  return Ticket;
};
