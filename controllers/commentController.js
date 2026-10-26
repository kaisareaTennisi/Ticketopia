const { Comment, Transaction, Ticket, User, Destination } = require("../models");

async function hasPaidTransactionForDestination(userId, destinationId) {
  const purchase = await Transaction.findOne({
    where: { UserId: userId, status: "paid" },
    include: [
      {
        model: Ticket,
        where: { DestinationId: destinationId },
        required: true,
      },
    ],
  });
  return Boolean(purchase);
}

async function createComment(req, res) {
  const destinationId = req.params.id;
  const { content, rating } = req.body;
  const userId = req.session.user.id;

  const canReview = await hasPaidTransactionForDestination(userId, destinationId);
  if (!canReview) {
    req.flash(
      "error",
      "Anda hanya bisa memberi ulasan untuk destinasi yang sudah pernah Anda beli tiketnya (status LUNAS)."
    );
    return res.redirect(`/destinations/${destinationId}`);
  }

  const existing = await Comment.findOne({
    where: { UserId: userId, DestinationId: destinationId },
  });
  if (existing) {
    req.flash("error", "Anda sudah memberi ulasan untuk destinasi ini.");
    return res.redirect(`/destinations/${destinationId}#ulasan`);
  }

  if (!content || content.trim().length === 0) {
    req.flash("error", "Ulasan tidak boleh kosong.");
    return res.redirect(`/destinations/${destinationId}#ulasan`);
  }

  await Comment.create({
    UserId: userId,
    DestinationId: destinationId,
    content: content.trim(),
    rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
  });

  req.flash("success", "Ulasan berhasil ditambahkan.");
  res.redirect(`/destinations/${destinationId}#ulasan`);
}

async function updateComment(req, res) {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    req.flash("error", "Ulasan tidak ditemukan.");
    return res.redirect("back");
  }
  if (comment.UserId !== req.session.user.id) {
    req.flash("error", "Anda hanya bisa mengedit ulasan milik Anda sendiri.");
    return res.redirect("back");
  }

  const { content, rating } = req.body;
  await comment.update({
    content: content?.trim() || comment.content,
    rating: rating
      ? Math.min(5, Math.max(1, parseInt(rating, 10)))
      : comment.rating,
  });

  req.flash("success", "Ulasan berhasil diperbarui.");
  res.redirect(`/destinations/${comment.DestinationId}#ulasan`);
}

function deleteComment(req, res) {
  return Comment.findByPk(req.params.id)
    .then((comment) => {
      if (!comment) {
        throw new Error("Ulasan tidak ditemukan.");
      }

      const isOwner = comment.UserId === req.session.user.id;
      const isAdmin = req.session.user.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new Error("Anda tidak berhak menghapus ulasan ini.");
      }

      return comment.destroy().then(() => ({
        destinationId: comment.DestinationId,
        isOwner,
        isAdmin,
      }));
    })
    .then(({ destinationId, isOwner, isAdmin }) => {
      req.flash("success", "Ulasan berhasil dihapus.");
      if (isAdmin && !isOwner) {
        res.redirect("/admin/comments");
        return;
      }
      res.redirect(`/destinations/${destinationId}#ulasan`);
    })
    .catch((err) => {
      console.error(err);
      const knownMessages = [
        "Ulasan tidak ditemukan.",
        "Anda tidak berhak menghapus ulasan ini.",
      ];
      req.flash(
        "error",
        knownMessages.includes(err.message) ? err.message : "Gagal menghapus ulasan."
      );
      res.redirect("back");
    });
}

const ADMIN_COMMENTS_PER_PAGE = 10;

async function adminListComments(req, res) {
  const limit = ADMIN_COMMENTS_PER_PAGE;
  const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (requestedPage - 1) * limit;

  const { count, rows: comments } = await Comment.findAndCountAll({
    include: [
      { model: User, attributes: ["id", "username"] },
      { model: Destination, attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const page = Math.min(requestedPage, totalPages);

  if (requestedPage !== page) {
    return res.redirect(`/admin/comments?page=${page}`);
  }

  res.render("admin/comments", {
    title: "Kelola Ulasan",
    comments,
    pagination: {
      page,
      totalPages,
      totalItems: count,
      perPage: limit,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    },
  });
}

module.exports = {
  hasPaidTransactionForDestination,
  createComment,
  updateComment,
  deleteComment,
  adminListComments,
};
