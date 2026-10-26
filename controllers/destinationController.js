const {
  Destination,
  Province,
  Ticket,
  Comment,
  User,
} = require("../models");
const { hasPaidTransactionForDestination } = require("./commentController");

async function showHome(req, res) {
  const destinations = await Destination.findAll({
    include: [
      { model: Province },
      { model: Ticket },
      { model: Comment, attributes: ["rating"] },
    ],
    limit: 8,
    order: [["createdAt", "DESC"]],
  });

  destinations.forEach((d) => {
    const comments = d.Comments || [];
    d.avgRating =
      comments.length > 0
        ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
        : null;
    d.reviewCount = comments.length;
  });

  const provinces = await Province.findAll({
    include: [{ model: Destination, attributes: ["id"] }],
    order: [["name", "ASC"]],
  });

  res.render("index", {
    title: "Beranda",
    destinations,
    provinces,
  });
}

const DESTINATION_SORTS = ["name", "name_desc", "newest", "price_asc", "price_desc"];

async function listDestinations(req, res) {
  const { province, q, sort } = req.query;
  const selectedSort = DESTINATION_SORTS.includes(sort) ? sort : "name";

  const destinations = await Destination.searchAndSort({
    q,
    province,
    sort: selectedSort,
  });
  const provinces = await Province.findAll({ order: [["name", "ASC"]] });

  res.render("destinations/list", {
    title: "Destinasi Wisata",
    destinations,
    provinces,
    selectedProvince: province || "",
    query: q || "",
    selectedSort,
  });
}

async function showDetail(req, res) {
  const destination = await Destination.findByPk(req.params.id, {
    include: [
      { model: Province },
      { model: Ticket },
      {
        model: Comment,
        include: [{ model: User, attributes: ["id", "username"] }],
      },
    ],
    order: [[{ model: Comment }, "createdAt", "DESC"]],
  });

  if (!destination) {
    req.flash("error", "Destinasi tidak ditemukan.");
    return res.redirect("/destinations");
  }

  const comments = destination.Comments || [];
  const avgRating =
    comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : null;

  let canComment = false;
  let hasPurchased = false;
  if (req.session.user) {
    hasPurchased = await hasPaidTransactionForDestination(
      req.session.user.id,
      destination.id
    );
    const alreadyReviewed = comments.some((c) => c.UserId === req.session.user.id);
    canComment = hasPurchased && !alreadyReviewed;
  }

  res.render("destinations/detail", {
    title: destination.name,
    destination,
    comments,
    avgRating,
    canComment,
    hasPurchased,
  });
}

function showCreateForm(req, res) {
  res.render("admin/destinationForm", {
    title: "Tambah Destinasi",
    destination: null,
    formAction: "/admin/destinations",
    formMethod: "POST",
  });
}

async function createDestination(req, res) {
  try {
    const {
      name,
      description,
      provinceName,
      image,
      ticketName,
      ticketDescription,
      ticketPrice,
      ticketStock,
    } = req.body;

    let province = await Province.findOne({ where: { name: provinceName } });
    if (!province) {
      province = await Province.create({ name: provinceName });
    }

    const destination = await Destination.create({
      name,
      description,
      ProvinceId: province.id,
      image,
    });

    if (ticketName && ticketPrice) {
      await Ticket.create({
        name: ticketName,
        description: ticketDescription || "",
        price: ticketPrice,
        stock: ticketStock || 100,
        DestinationId: destination.id,
      });
    }

    req.flash("success", "Destinasi wisata berhasil ditambahkan.");
    res.redirect("/admin/destinations");
  } catch (err) {
    console.error(err);
    req.flash("error", "Gagal menambahkan destinasi.");
    res.redirect("/admin/destinations/new");
  }
}

async function showEditForm(req, res) {
  const destination = await Destination.findByPk(req.params.id, {
    include: [{ model: Province }, { model: Ticket }],
  });
  if (!destination) {
    req.flash("error", "Destinasi tidak ditemukan.");
    return res.redirect("/admin/destinations");
  }
  res.render("admin/destinationForm", {
    title: "Edit Destinasi",
    destination,
    formAction: `/admin/destinations/${destination.id}?_method=PUT`,
    formMethod: "POST",
  });
}

async function updateDestination(req, res) {
  try {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) {
      req.flash("error", "Destinasi tidak ditemukan.");
      return res.redirect("/admin/destinations");
    }

    const { name, description, provinceName, image } = req.body;

    let ProvinceId = destination.ProvinceId;
    if (provinceName) {
      let province = await Province.findOne({ where: { name: provinceName } });
      if (!province) province = await Province.create({ name: provinceName });
      ProvinceId = province.id;
    }

    await destination.update({
      name,
      description,
      ProvinceId,
      image,
    });

    req.flash("success", "Destinasi wisata berhasil diperbarui.");
    res.redirect("/admin/destinations");
  } catch (err) {
    console.error(err);
    req.flash("error", "Gagal memperbarui destinasi.");
    res.redirect(`/admin/destinations/${req.params.id}/edit`);
  }
}

function deleteDestination(req, res) {
  return Destination.findByPk(req.params.id)
    .then((destination) => {
      if (!destination) {
        throw new Error("Destinasi tidak ditemukan.");
      }
      return destination.destroy();
    })
    .then(() => {
      req.flash("success", "Destinasi berhasil dihapus.");
      res.redirect("/admin/destinations");
    })
    .catch((err) => {
      console.error(err);
      req.flash(
        "error",
        err.message === "Destinasi tidak ditemukan."
          ? err.message
          : "Gagal menghapus destinasi."
      );
      res.redirect("/admin/destinations");
    });
}

const ADMIN_DESTINATIONS_PER_PAGE = 10;

async function adminListDestinations(req, res) {
  const limit = ADMIN_DESTINATIONS_PER_PAGE;
  const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (requestedPage - 1) * limit;

  const { count, rows: destinations } = await Destination.findAndCountAll({
    include: [{ model: Province }, { model: Ticket }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const page = Math.min(requestedPage, totalPages);

  if (requestedPage !== page) {
    return res.redirect(`/admin/destinations?page=${page}`);
  }

  res.render("admin/destinations", {
    title: "Kelola Destinasi",
    destinations,
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
  showHome,
  listDestinations,
  showDetail,
  showCreateForm,
  createDestination,
  showEditForm,
  updateDestination,
  deleteDestination,
  adminListDestinations,
};
