const {
  Transaction,
  Ticket,
  Destination,
  User,
  sequelize,
} = require("../models");
const { processPurchase } = require("./cartController");

async function buyTicket(req, res) {
  const t = await sequelize.transaction();
  try {
    const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);

    await User.findByPk(req.session.user.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    await processPurchase({
      userId: req.session.user.id,
      ticketId: req.params.ticketId,
      quantity: qty,
      transaction: t,
      status: "pending",
    });

    await t.commit();

    req.flash("success", "Pesanan berhasil dibuat. Silakan bayar atau batalkan di halaman pesanan.");
    res.redirect("/user/my-orders");
  } catch (err) {
    await t.rollback();
    console.error(err);
    req.flash("error", err.message || "Terjadi kesalahan saat memproses pembelian.");
    res.redirect("back");
  }
}

// POST /user/my-orders/:id/pay - bayar pesanan pending
async function payOrder(req, res) {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.session.user.id, { transaction: t });

    const txn = await Transaction.findOne({
      where: {
        id: req.params.id,
        UserId: user.id,
        status: "pending",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!txn) {
      throw new Error("Pesanan tidak ditemukan atau sudah diproses.");
    }

    txn.status = "paid";
    await txn.save({ transaction: t });
    await t.commit();

    req.flash("success", "Pembayaran berhasil! Tiket Anda tersedia di halaman pesanan.");
    res.redirect("/user/my-orders");
  } catch (err) {
    await t.rollback();
    console.error(err);
    req.flash("error", err.message || "Terjadi kesalahan saat memproses pembayaran.");
    res.redirect("/user/my-orders");
  }
}

// POST /user/my-orders/:id/cancel - batalkan pesanan pending
async function cancelOrder(req, res) {
  const t = await sequelize.transaction();
  try {
    const txn = await Transaction.findOne({
      where: {
        id: req.params.id,
        UserId: req.session.user.id,
        status: "pending",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!txn) {
      throw new Error("Pesanan tidak ditemukan atau sudah diproses.");
    }

    const ticket = await Ticket.findByPk(txn.TicketId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!ticket) {
      throw new Error("Tiket tidak ditemukan.");
    }

    ticket.stock += txn.quantity;
    await ticket.save({ transaction: t });

    txn.status = "cancel";
    await txn.save({ transaction: t });
    await t.commit();

    req.flash("success", "Pesanan berhasil dibatalkan.");
    res.redirect("/user/my-orders");
  } catch (err) {
    await t.rollback();
    console.error(err);
    req.flash("error", err.message || "Terjadi kesalahan saat membatalkan pesanan.");
    res.redirect("/user/my-orders");
  }
}

// GET /user/my-orders - riwayat pesanan user
async function myOrders(req, res) {
  const transactions = await Transaction.findAll({
    where: { UserId: req.session.user.id },
    include: [
      {
        model: Ticket,
        include: [{ model: Destination }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.render("user/orders", { title: "Pesanan Saya", transactions });
}

module.exports = { buyTicket, payOrder, cancelOrder, myOrders };
