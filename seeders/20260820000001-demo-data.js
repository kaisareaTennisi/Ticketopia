"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    await queryInterface.bulkInsert("Users", [
      {
        id: 1,
        username: "Admin Tiketopia",
        email: "admin@tiketopia.com",
        password: adminPassword,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        username: "Andi Wijaya",
        email: "andi@example.com",
        password: userPassword,
        role: "user",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        username: "Siti Rahma",
        email: "siti@example.com",
        password: userPassword,
        role: "user",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert("Profiles", [
      {
        fullName: "Admin Tiketopia",
        address: "Jl. Wisata No. 1, Jakarta",
        phoneNumber: "081234567890",
        birthDate: "1990-01-15",
        gender: "male",
        UserId: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: "Andi Wijaya",
        address: "Jl. Merdeka No. 10, Bandung",
        phoneNumber: "081298765432",
        birthDate: "1995-06-20",
        gender: "male",
        UserId: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: "Siti Rahma",
        address: "Jl. Malioboro No. 25, Yogyakarta",
        phoneNumber: "081355512345",
        birthDate: "1998-03-12",
        gender: "female",
        UserId: 3,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const provinceData = [
      {
        name: "Jawa Barat",
        image:
          "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
      },
      {
        name: "Jawa Timur",
        image:
          "https://images.unsplash.com/photo-1589308454676-32d1c9e91a4b?w=800",
      },
      {
        name: "Bali",
        image:
          "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800",
      },
      {
        name: "Jawa Tengah",
        image:
          "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800",
      },
      {
        name: "DI Yogyakarta",
        image:
          "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800",
      },
      {
        name: "Nusa Tenggara Timur",
        image:
          "https://images.unsplash.com/photo-1751684557329-030fdfac4a00?w=800",
      },
      {
        name: "Nusa Tenggara Barat",
        image:
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      },
      {
        name: "Sumatera Utara",
        image:
          "https://images.unsplash.com/photo-1707712661442-92819a2a639d?w=800",
      },
      {
        name: "Sumatera Barat",
        image:
          "https://images.unsplash.com/photo-1653292953434-759c54428dbd?w=800",
      },
      {
        name: "Aceh",
        image:
          "https://images.unsplash.com/photo-1591017683260-655b616bfb17?w=800",
      },
      {
        name: "DKI Jakarta",
        image:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      },
      {
        name: "Banten",
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      },
      {
        name: "Kepulauan Bangka Belitung",
        image:
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
      },
      {
        name: "Kalimantan Timur",
        image:
          "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800",
      },
      {
        name: "Kalimantan Tengah",
        image:
          "https://images.unsplash.com/photo-1727004135367-05ca2ad5cad0?w=800",
      },
      {
        name: "Sulawesi Utara",
        image:
          "https://images.unsplash.com/photo-1600481171699-a5c3359c3aa5?w=800",
      },
      {
        name: "Sulawesi Selatan",
        image:
          "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800",
      },
      {
        name: "Papua Barat",
        image:
          "https://images.unsplash.com/photo-1703769605314-18648cfc3428?w=800",
      },
    ];

    const provinces = provinceData.map((p, index) => ({
      id: index + 1,
      name: p.name,
      image: p.image,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Provinces", provinces);

    const destinationSeeds = [
      {
        id: 1,
        name: "Kawah Putih",
        description:
          "Danau vulkanik berwarna putih kehijauan di kawasan Ciwidey, Bandung Selatan. Udara sejuk dan kabut pagi membuat pemandangannya terasa magis.",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
        ProvinceId: 1,
        adultPrice: 120000,
        childPrice: 60000,
      },
      {
        id: 2,
        name: "Tangkuban Perahu",
        description:
          "Gunung berapi aktif di utara Bandung dengan kawah yang dapat dikunjungi dari tepi. Bentuknya menyerupai perahu terbalik dalam legenda Sangkuriang.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        ProvinceId: 1,
        adultPrice: 40000,
        childPrice: 20000,
      },
      {
        id: 3,
        name: "Green Canyon Pangandaran",
        description:
          "Ngarai hijau di Cijulang dengan sungai jernih, tebing karst, dan aktivitas body rafting. Destinasi unggulan pesisir selatan Jawa Barat.",
        image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
        ProvinceId: 1,
        adultPrice: 125000,
        childPrice: 75000,
      },
      {
        id: 4,
        name: "Gunung Bromo",
        description:
          "Gunung berapi aktif di kawasan Tengger dengan pemandangan matahari terbit yang legendaris, lautan pasir, dan kawah berasap.",
        image: "https://images.unsplash.com/photo-1751643274240-91affce4d875?w=800",
        ProvinceId: 2,
        adultPrice: 150000,
        childPrice: 75000,
      },
      {
        id: 5,
        name: "Kawah Ijen",
        description:
          "Kawah dengan danau asam turquoise dan fenomena api biru. Pendakian malam hari menuju bibir kawah menjadi daya tarik utama.",
        image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800",
        ProvinceId: 2,
        adultPrice: 175000,
        childPrice: 90000,
      },
      {
        id: 6,
        name: "Taman Nasional Baluran",
        description:
          "Savana Afrika-nya Jawa dengan padang rumput luas, hutan, dan pantai. Tempat mengamati banteng, rusa, dan burung liar.",
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
        ProvinceId: 2,
        adultPrice: 35000,
        childPrice: 15000,
      },
      {
        id: 7,
        name: "Pantai Kelingking",
        description:
          "Pantai eksotis di Nusa Penida dengan tebing berbentuk menyerupai kepala T-Rex dan air laut biru jernih di bawahnya.",
        image: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800",
        ProvinceId: 3,
        adultPrice: 100000,
        childPrice: 50000,
      },
      {
        id: 8,
        name: "Tanah Lot",
        description:
          "Pura laut ikonik di atas batu karang lepas pantai Tabanan. Sunset di sini menjadi salah satu yang paling terkenal di Bali.",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
        ProvinceId: 3,
        adultPrice: 75000,
        childPrice: 40000,
      },
      {
        id: 9,
        name: "Pura Uluwatu",
        description:
          "Pura di ujung tebing karang selatan Bali dengan pemandangan Samudra Hindia. Pertunjukan kecak saat senja menjadi daya tarik tambahan.",
        image: "https://images.unsplash.com/photo-1604842937136-1648761a6256?w=800",
        ProvinceId: 3,
        adultPrice: 80000,
        childPrice: 40000,
      },
      {
        id: 10,
        name: "Tegallalang Rice Terrace",
        description:
          "Sawah berundak khas Bali di Ubud dengan sistem subak yang sudah berusia ratusan tahun. Spot foto dan jalan kaki yang populer.",
        image: "https://images.unsplash.com/photo-1555400038-a088c772c8cd?w=800",
        ProvinceId: 3,
        adultPrice: 50000,
        childPrice: 25000,
      },
      {
        id: 11,
        name: "Candi Borobudur",
        description:
          "Candi Buddha terbesar di dunia dan situs warisan UNESCO. Relief stupa serta sunrise dari tingkat atas menjadi pengalaman yang tak terlupakan.",
        image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800",
        ProvinceId: 4,
        adultPrice: 75000,
        childPrice: 35000,
      },
      {
        id: 12,
        name: "Dataran Tinggi Dieng",
        description:
          "Dataran tinggi vulkanik dengan kawah, candi Hindu kuno, dan fenomena kawah berwarna. Udara dingin dan nebula pagi khas Dieng.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        ProvinceId: 4,
        adultPrice: 45000,
        childPrice: 20000,
      },
      {
        id: 13,
        name: "Kepulauan Karimunjawa",
        description:
          "Gugusan pulau di Laut Jawa dengan pantai putih, snorkeling, dan hutan mangrove. Destinasi pulau yang lebih tenang dari Bali.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        ProvinceId: 4,
        adultPrice: 200000,
        childPrice: 100000,
      },
      {
        id: 14,
        name: "Candi Prambanan",
        description:
          "Kompleks candi Hindu terbesar di Indonesia, didedikasikan untuk Trimurti. Relief Ramayana dan arsitektur rampingnya sangat ikonik.",
        image: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800",
        ProvinceId: 5,
        adultPrice: 50000,
        childPrice: 25000,
      },
      {
        id: 15,
        name: "Pantai Parangtritis",
        description:
          "Pantai selatan Yogyakarta dengan ombak besar, gumuk pasir, dan legenda Nyi Roro Kidul. Populer untuk sunset dan andong pantai.",
        image: "https://images.unsplash.com/photo-1619023546274-e868d5a4a704?w=800",
        ProvinceId: 5,
        adultPrice: 15000,
        childPrice: 8000,
      },
      {
        id: 16,
        name: "Tana Toraja",
        description:
          "Wilayah budaya di Sulawesi Selatan dengan rumah Tongkonan, upacara Rambu Solo, dan pemandangan pegunungan. Destinasi budaya yang sangat khas.",
        image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800",
        ProvinceId: 17,
        adultPrice: 50000,
        childPrice: 25000,
      },
      {
        id: 17,
        name: "Pulau Komodo",
        description:
          "Habitat asli komodo, taman nasional warisan dunia. Pink Beach, Padar, dan trekking melihat komodo menjadi paket wisata unggulan.",
        image: "https://images.unsplash.com/photo-1751684557329-030fdfac4a00?w=800",
        ProvinceId: 6,
        adultPrice: 350000,
        childPrice: 175000,
      },
      {
        id: 18,
        name: "Danau Kelimutu",
        description:
          "Tiga danau kawah berwarna berbeda di puncak Kelimutu, Flores. Warna airnya bisa berubah seiring waktu karena aktivitas vulkanik.",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
        ProvinceId: 6,
        adultPrice: 50000,
        childPrice: 25000,
      },
      {
        id: 19,
        name: "Gili Trawangan",
        description:
          "Pulau kecil tanpa kendaraan bermotor di utara Lombok. Snorkeling, sunset, dan suasana pantai yang santai menjadi daya tarik utamanya.",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        ProvinceId: 7,
        adultPrice: 150000,
        childPrice: 75000,
      },
      {
        id: 20,
        name: "Gunung Rinjani",
        description:
          "Gunung berapi tertinggi kedua di Indonesia dengan danau Segara Anak di kawahnya. Pendakian menantang dengan pemandangan spektakuler.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        ProvinceId: 7,
        adultPrice: 250000,
        childPrice: 125000,
      },
      {
        id: 21,
        name: "Danau Toba",
        description:
          "Danau vulkanik terbesar di Asia Tenggara dengan Pulau Samosir di tengahnya. Budaya Batak, air panas, dan pemandangan teluk yang luas.",
        image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
        ProvinceId: 8,
        adultPrice: 30000,
        childPrice: 15000,
      },
      {
        id: 22,
        name: "Lembah Harau",
        description:
          "Lembah dikelilingi tebing granit curam di Lima Puluh Kota, Sumatera Barat. Air terjun, sawah, dan panjat tebing menjadi aktivitas utamanya.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        ProvinceId: 9,
        adultPrice: 25000,
        childPrice: 12000,
      },
      {
        id: 23,
        name: "Pantai Iboih",
        description:
          "Pantai di ujung barat Pulau Weh, Sabang. Gerbang selam Indonesia dengan terumbu karang sehat dan air yang sangat jernih.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        ProvinceId: 10,
        adultPrice: 40000,
        childPrice: 20000,
      },
      {
        id: 24,
        name: "Kepulauan Seribu",
        description:
          "Gugusan pulau di utara Jakarta dengan snorkeling, pulau resort, dan konservasi penyu. Liburan laut yang paling dekat dari ibu kota.",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        ProvinceId: 11,
        adultPrice: 175000,
        childPrice: 90000,
      },
      {
        id: 25,
        name: "Taman Nasional Ujung Kulon",
        description:
          "Situs warisan dunia dan habitat badak Jawa. Hutan hujan, pantai, dan Pulau Peucang menjadi tujuan ekowisata di ujung barat Jawa.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        ProvinceId: 12,
        adultPrice: 150000,
        childPrice: 75000,
      },
      {
        id: 26,
        name: "Pantai Tanjung Tinggi",
        description:
          "Pantai granit ikonik Belitung dengan bongkahan batu raksasa di tepi laut. Terkenal dari film Laskar Pelangi.",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
        ProvinceId: 13,
        adultPrice: 20000,
        childPrice: 10000,
      },
      {
        id: 27,
        name: "Kepulauan Derawan",
        description:
          "Gugusan pulau di Kalimantan Timur dengan ubur-ubur tak menyengat di Danau Kakaban, penyu, dan diving kelas dunia.",
        image: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800",
        ProvinceId: 14,
        adultPrice: 300000,
        childPrice: 150000,
      },
      {
        id: 28,
        name: "Taman Nasional Tanjung Puting",
        description:
          "Habitat orangutan di Kalimantan Tengah. Wisata klotok menyusuri Sungai Sekonyer menuju camp rehabilitasi orangutan.",
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
        ProvinceId: 15,
        adultPrice: 275000,
        childPrice: 140000,
      },
      {
        id: 29,
        name: "Taman Laut Bunaken",
        description:
          "Taman laut di Sulawesi Utara dengan dinding terumbu vertikal, keanekaragaman ikan, dan salah satu spot selam terbaik di dunia.",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        ProvinceId: 16,
        adultPrice: 225000,
        childPrice: 110000,
      },
      {
        id: 30,
        name: "Raja Ampat",
        description:
          "Surga biodiversitas laut di Papua Barat. Pulau karst, laguna, dan terumbu karang menjadikan Raja Ampat destinasi diving kelas dunia.",
        image: "https://images.unsplash.com/photo-1703769605314-18648cfc3428?w=800",
        ProvinceId: 18,
        adultPrice: 500000,
        childPrice: 250000,
      },
    ];

    await queryInterface.bulkInsert(
      "Destinations",
      destinationSeeds.map(({ adultPrice, childPrice, ...destination }) => ({
        ...destination,
        createdAt: now,
        updatedAt: now,
      }))
    );

    const tickets = destinationSeeds.flatMap((destination, index) => {
      const adultId = index * 2 + 1;
      const childId = index * 2 + 2;

      return [
        {
          id: adultId,
          name: "Tiket Masuk Dewasa",
          description: `Tiket masuk dewasa untuk ${destination.name}`,
          price: destination.adultPrice,
          stock: 120,
          DestinationId: destination.id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: childId,
          name: "Tiket Masuk Anak",
          description: `Tiket masuk anak untuk ${destination.name}`,
          price: destination.childPrice,
          stock: 80,
          DestinationId: destination.id,
          createdAt: now,
          updatedAt: now,
        },
      ];
    });

    await queryInterface.bulkInsert("Tickets", tickets);

    await queryInterface.bulkInsert("Transactions", [
      {
        quantity: 2,
        totalPrice: 240000,
        status: "paid",
        UserId: 2,
        TicketId: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        quantity: 1,
        totalPrice: 150000,
        status: "paid",
        UserId: 2,
        TicketId: 7,
        createdAt: now,
        updatedAt: now,
      },
      {
        quantity: 3,
        totalPrice: 225000,
        status: "pending",
        UserId: 3,
        TicketId: 21,
        createdAt: now,
        updatedAt: now,
      },
      {
        quantity: 1,
        totalPrice: 350000,
        status: "paid",
        UserId: 3,
        TicketId: 33,
        createdAt: now,
        updatedAt: now,
      },
      {
        quantity: 2,
        totalPrice: 1000000,
        status: "cancel",
        UserId: 2,
        TicketId: 59,
        createdAt: now,
        updatedAt: now,
      },
      {
        quantity: 1,
        totalPrice: 175000,
        status: "cancel",
        UserId: 3,
        TicketId: 47,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.sequelize.query(`
      SELECT setval('"Users_id_seq"', (SELECT MAX(id) FROM "Users"));
      SELECT setval('"Provinces_id_seq"', (SELECT MAX(id) FROM "Provinces"));
      SELECT setval('"Destinations_id_seq"', (SELECT MAX(id) FROM "Destinations"));
      SELECT setval('"Tickets_id_seq"', (SELECT MAX(id) FROM "Tickets"));
      SELECT setval('"Transactions_id_seq"', (SELECT MAX(id) FROM "Transactions"));
    `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Transactions", null, {});
    await queryInterface.bulkDelete("Tickets", null, {});
    await queryInterface.bulkDelete("Destinations", null, {});
    await queryInterface.bulkDelete("Provinces", null, {});
    await queryInterface.bulkDelete("Profiles", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
