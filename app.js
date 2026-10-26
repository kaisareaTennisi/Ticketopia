require("dotenv").config();
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const { sequelize } = require("./models");
const { injectLocals } = require("./middlewares/auth");

const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// View engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

// Body parsing & static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Session & flash message
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tiketopia_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 hari
  })
);
app.use(flash());
app.use(injectLocals);

// Routes
app.use("/", authRoutes);
app.use("/", destinationRoutes);
app.use("/", commentRoutes);
app.use("/user", userRoutes);
app.use("/user", cartRoutes);
app.use("/", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { title: "Halaman Tidak Ditemukan", layout: "layouts/main" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  req.flash("error", "Terjadi kesalahan pada server.");
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil.");
    await sequelize.sync(); // gunakan migration terpisah untuk produksi
    console.log("Model tersinkronisasi dengan database.");

    app.listen(PORT, () => {
      console.log(`Tiketopia berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Gagal memulai server:", err);
    process.exit(1);
  }
}

start();
