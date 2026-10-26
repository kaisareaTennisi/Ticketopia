"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const provinceImages = {
      "Nusa Tenggara Timur":
        "https://images.unsplash.com/photo-1751684557329-030fdfac4a00?w=800",
      "Papua Barat":
        "https://images.unsplash.com/photo-1703769605314-18648cfc3428?w=800",
      "Sulawesi Utara":
        "https://images.unsplash.com/photo-1600481171699-a5c3359c3aa5?w=800",
      "Sumatera Utara":
        "https://images.unsplash.com/photo-1707712661442-92819a2a639d?w=800",
      "Sumatera Barat":
        "https://images.unsplash.com/photo-1653292953434-759c54428dbd?w=800",
      Aceh: "https://images.unsplash.com/photo-1591017683260-655b616bfb17?w=800",
      "Kalimantan Tengah":
        "https://images.unsplash.com/photo-1727004135367-05ca2ad5cad0?w=800",
    };

    for (const [name, image] of Object.entries(provinceImages)) {
      await queryInterface.sequelize.query(
        `UPDATE "Provinces" SET image = :image WHERE name = :name`,
        { replacements: { name, image } }
      );
    }
  },

  async down(queryInterface) {
    const provinceImages = {
      "Nusa Tenggara Timur":
        "https://images.unsplash.com/photo-1516691718037-50536bf6ba14?w=800",
      "Papua Barat":
        "https://images.unsplash.com/photo-1516691718037-50536bf6ba14?w=800",
      "Sulawesi Utara":
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "Sumatera Utara":
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
      "Sumatera Barat":
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      Aceh: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      "Kalimantan Tengah":
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
    };

    for (const [name, image] of Object.entries(provinceImages)) {
      await queryInterface.sequelize.query(
        `UPDATE "Provinces" SET image = :image WHERE name = :name`,
        { replacements: { name, image } }
      );
    }
  },
};
