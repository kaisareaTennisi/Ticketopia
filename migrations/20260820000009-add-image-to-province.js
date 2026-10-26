"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Provinces", "image", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    const provinceImages = {
      "Jawa Barat":
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
      "Jawa Timur":
        "https://images.unsplash.com/photo-1589308454676-32d1c9e91a4b?w=800",
      Bali: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800",
      "Jawa Tengah":
        "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800",
      "DI Yogyakarta":
        "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800",
      "Nusa Tenggara Timur":
        "https://images.unsplash.com/photo-1516691718037-50536bf6ba14?w=800",
      "Nusa Tenggara Barat":
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "Sumatera Utara":
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
      "Sumatera Barat":
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      Aceh: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      "DKI Jakarta":
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      Banten: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      "Kepulauan Bangka Belitung":
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
      "Kalimantan Timur":
        "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800",
      "Kalimantan Tengah":
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
      "Sulawesi Utara":
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "Sulawesi Selatan":
        "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800",
      "Papua Barat":
        "https://images.unsplash.com/photo-1516691718037-50536bf6ba14?w=800",
    };

    for (const [name, image] of Object.entries(provinceImages)) {
      await queryInterface.sequelize.query(
        `UPDATE "Provinces" SET image = :image WHERE name = :name`,
        { replacements: { name, image } }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Provinces", "image");
  },
};
