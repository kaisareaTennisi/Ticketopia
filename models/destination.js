"use strict";

const { Model, Op } = require("sequelize");

const SORT_ORDERS = {
  name: [["name", "ASC"]],
  name_desc: [["name", "DESC"]],
  newest: [["createdAt", "DESC"]],
};

module.exports = (sequelize, DataTypes) => {
  class Destination extends Model {
    static associate(models) {
      Destination.belongsTo(models.Province, { foreignKey: "ProvinceId" });
      Destination.hasMany(models.Ticket, { foreignKey: "DestinationId" });
      Destination.hasMany(models.Comment, { foreignKey: "DestinationId" });
    }

    static async searchAndSort({ q, province, sort } = {}) {
      const { Province } = sequelize.models;
      const where = {};
      const include = [{ model: Province }, { model: sequelize.models.Ticket }];

      if (q) {
        const term = `%${q}%`;
        where[Op.or] = [
          { name: { [Op.iLike]: term } },
          { description: { [Op.iLike]: term } },
        ];
      }

      if (province) {
        include[0].where = { name: province };
      }

      let order = SORT_ORDERS[sort] || SORT_ORDERS.name;
      if (sort === "price_asc" || sort === "price_desc") {
        const direction = sort === "price_desc" ? "DESC" : "ASC";
        order = [
          [
            sequelize.literal(
              `(SELECT MIN("price") FROM "Tickets" WHERE "Tickets"."DestinationId" = "Destination"."id")`
            ),
            direction,
          ],
        ];
      }

      return this.findAll({ where, include, order });
    }

    getStartingPrice() {
      const tickets = this.Tickets || [];
      if (!tickets.length) return null;
      return Math.min(...tickets.map((ticket) => Number(ticket.price)));
    }

    get formattedStartingPrice() {
      const price = this.getStartingPrice();
      if (price == null) return "-";
      return `Rp${price.toLocaleString("id-ID")}`;
    }
  }

  Destination.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      ProvinceId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Destination",
    }
  );

  return Destination;
};
