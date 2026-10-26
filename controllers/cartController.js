const {
  Transaction,
  Ticket,
  Destination,
  User,
  sequelize,
} = require("../models");

function getCart(session) {
  if (!session.cart) {
    session.cart = { items: [] };
  }
  return session.cart;
}

function getCartCount(cart) {
  if (!cart?.items?.length) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

function findCartItem(cart, ticketId) {
  return cart.items.find((item) => item.ticketId === Number(ticketId));
}

async function loadCartDetails(cart) {
  if (!cart.items.length) {
    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  const ticketIds = cart.items.map((item) => item.ticketId);
  const tickets = await Ticket.findAll({
    where: { id: ticketIds },
    include: [{ model: Destination }],
  });

  const ticketMap = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  const items = cart.items
    .map((item) => {
      const ticket = ticketMap.get(item.ticketId);
      if (!ticket) return null;

      const subtotal = item.quantity * ticket.price;
      return {
        ticketId: ticket.id,
        ticketName: ticket.name,
        destinationName: ticket.Destination?.name || "-",
        price: ticket.price,
        stock: ticket.stock,
        quantity: item.quantity,
        subtotal,
      };
    })
    .filter(Boolean);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return { items, totalItems, totalPrice };
}

async function processPurchase({ userId, ticketId, quantity, transaction, status = "pending" }) {
  const ticket = await Ticket.findByPk(ticketId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!ticket) {
    throw new Error("Tiket tidak ditemukan.");
  }

  if (ticket.stock < quantity) {
    throw new Error(`Stok tiket "${ticket.name}" tidak mencukupi.`);
  }

  const totalPrice = quantity * ticket.price;

  ticket.stock -= quantity;
  await ticket.save({ transaction });

  const txn = await Transaction.create(
    {
      UserId: userId,
      TicketId: ticket.id,
      quantity,
      totalPrice,
      status,
    },
    { transaction }
  );

  return { transaction: txn, ticket, quantity };
}


async function showCart(req, res) {
  const cart = getCart(req.session);
  const cartData = await loadCartDetails(cart);

  res.render("user/cart", {
    title: "Keranjang",
    cart: cartData,
  });
}

async function getCartSummary(req, res) {
  const cart = getCart(req.session);
  const cartData = await loadCartDetails(cart);

  res.json({
    count: cartData.totalItems,
    totalPrice: cartData.totalPrice,
    items: cartData.items,
  });
}

async function addToCart(req, res) {
  const ticketId = Number(req.body.ticketId);
  const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

  if (!ticketId) {
    return res.status(400).json({ error: "Tiket tidak valid." });
  }

  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Tiket tidak ditemukan." });
  }

  if (ticket.stock < 1) {
    return res.status(400).json({ error: "Stok tiket habis." });
  }

  const cart = getCart(req.session);
  const existing = findCartItem(cart, ticketId);
  const newQty = (existing?.quantity || 0) + quantity;

  if (newQty > ticket.stock) {
    return res.status(400).json({
      error: `Stok tidak mencukupi. Tersedia: ${ticket.stock} tiket.`,
    });
  }

  if (existing) {
    existing.quantity = newQty;
  } else {
    cart.items.push({ ticketId, quantity });
  }

  const cartData = await loadCartDetails(cart);

  res.json({
    message: "Tiket ditambahkan ke keranjang.",
    count: cartData.totalItems,
    totalPrice: cartData.totalPrice,
    item: cartData.items.find((item) => item.ticketId === ticketId),
  });
}

async function updateCartItem(req, res) {
  const ticketId = Number(req.params.ticketId);
  const quantity = parseInt(req.body.quantity, 10);

  if (!Number.isFinite(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Jumlah tiket tidak valid." });
  }

  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Tiket tidak ditemukan." });
  }

  if (quantity > ticket.stock) {
    return res.status(400).json({
      error: `Stok tidak mencukupi. Tersedia: ${ticket.stock} tiket.`,
    });
  }

  const cart = getCart(req.session);
  const existing = findCartItem(cart, ticketId);

  if (!existing) {
    return res.status(404).json({ error: "Item tidak ada di keranjang." });
  }

  existing.quantity = quantity;

  const cartData = await loadCartDetails(cart);

  res.json({
    message: "Keranjang diperbarui.",
    count: cartData.totalItems,
    totalPrice: cartData.totalPrice,
    items: cartData.items,
  });
}

async function removeFromCart(req, res) {
  const ticketId = Number(req.params.ticketId);
  const cart = getCart(req.session);

  cart.items = cart.items.filter((item) => item.ticketId !== ticketId);

  const cartData = await loadCartDetails(cart);

  res.json({
    message: "Item dihapus dari keranjang.",
    count: cartData.totalItems,
    totalPrice: cartData.totalPrice,
    items: cartData.items,
  });
}

async function checkoutCart(req, res) {
  const cart = getCart(req.session);

  if (!cart.items.length) {
    req.flash("error", "Keranjang Anda kosong.");
    return res.redirect("/user/cart");
  }

  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(req.session.user.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const purchases = [];

    for (const item of cart.items) {
      const result = await processPurchase({
        userId: user.id,
        ticketId: item.ticketId,
        quantity: item.quantity,
        transaction: t,
        status: "paid",
      });
      purchases.push(result);
    }

    await t.commit();

    cart.items = [];

    req.flash(
      "success",
      `Pembelian ${purchases.length} tiket berhasil! Tiket Anda tersedia di halaman pesanan.`
    );
    res.redirect("/user/my-orders");
  } catch (err) {
    await t.rollback();
    console.error(err);
    req.flash("error", err.message || "Terjadi kesalahan saat memproses pembelian.");
    res.redirect("/user/cart");
  }
}

module.exports = {
  getCart,
  getCartCount,
  showCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeFromCart,
  checkoutCart,
  processPurchase,
};
