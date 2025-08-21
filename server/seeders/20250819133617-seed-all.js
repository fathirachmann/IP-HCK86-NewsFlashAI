"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const now = new Date();
    await queryInterface.bulkInsert("Users", [
      {
        email: "demo.user1@gmail.com",
        name: "Demo User 1",
        picture: "https://i.pravatar.cc/100?img=11",
        createdAt: now,
        updatedAt: now,
      },
      {
        email: "demo.user2@gmail.com",
        name: "Demo User 2",
        picture: "https://i.pravatar.cc/100?img=22",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const articles = [
      {
        userId: 1,
        sourceId: "reuters",
        url: "https://www.reuters.com/world/example-1",
        title: "Markets edge higher as earnings beat expectations",
        imageUrl: "https://picsum.photos/seed/a1/800/400",
        publishedAt: new Date("2025-08-15T08:00:00Z"),
        summary:
          "• Stocks rise on strong earnings\n• Tech leads gains\n• Investors eye inflation print\n• Bond yields steady\n• Analysts turn cautiously optimistic",
        sentiment: "positive",
        impact: "",
        keywords: "markets,earnings,tech,stocks,inflation",
        tags: "markets,tech",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: 1,
        sourceId: "bbc-news",
        url: "https://www.bbc.com/news/example-2",
        title: "New policy aims to cut emissions in urban areas",
        imageUrl: "https://picsum.photos/seed/a2/800/400",
        publishedAt: new Date("2025-08-14T10:30:00Z"),
        summary: null,
        sentiment: null,
        impact: null,
        keywords: null,
        tags: "policy,environment",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: 2,
        sourceId: "the-verge",
        url: "https://www.theverge.com/example-3",
        title: "Smartphones get satellite connectivity upgrade",
        imageUrl: "https://picsum.photos/seed/a3/800/400",
        publishedAt: new Date("2025-08-13T12:00:00Z"),
        summary: null,
        sentiment: null,
        impact: null,
        keywords: null,
        tags: "mobile,hardware",
        createdAt: now,
        updatedAt: now,
      },
    ];
    await queryInterface.bulkInsert("Articles", articles);
    await queryInterface.bulkInsert("Notes", [
      {
        articleId: 1,
        content: "Highlight: tech earnings jadi driver naik.",
        createdAt: now,
        updatedAt: now,
      },
      {
        articleId: 1,
        content: "Cek laporan CPI minggu depan.",
        createdAt: now,
        updatedAt: now,
      },
      {
        articleId: 2,
        content: "Kebijakan emisi: cek implikasi ke transport publik.",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Notes", null, {});
    await queryInterface.bulkDelete("Articles", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
