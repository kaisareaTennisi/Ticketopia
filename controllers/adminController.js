const { Destination, Transaction, User } = require("../models");

const ADMIN_DASHBOARD_TRANSACTIONS_PER_PAGE = 10;

async function dashboard(req, res) {
  const limit = ADMIN_DASHBOARD_TRANSACTIONS_PER_PAGE;
  const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (requestedPage - 1) * limit;

  const [
    totalDestinations,
    totalTransactions,
    totalUsers,
    revenueResult,
    { count: transactionCount, rows: recentTransactions },
  ] = await Promise.all([
    Destination.count(),
    Transaction.count({ where: { status: "paid" } }),
    User.count({ where: { role: "user" } }),
    Transaction.sum("totalPrice", { where: { status: "paid" } }),
    Transaction.findAndCountAll({
      where: { status: "paid" },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["username"] }],
      distinct: true,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(transactionCount / limit));
  const page = Math.min(requestedPage, totalPages);

  if (requestedPage !== page) {
    return res.redirect(`/admin/dashboard?page=${page}`);
  }

  res.render("admin/dashboard", {
    title: "Dashboard Admin",
    stats: {
      totalDestinations,
      totalTransactions,
      totalUsers,
      revenue: revenueResult || 0,
    },
    recentTransactions,
    pagination: {
      page,
      totalPages,
      totalItems: transactionCount,
      perPage: limit,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    },
  });
}

module.exports = { dashboard };
