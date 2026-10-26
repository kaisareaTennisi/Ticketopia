const bcrypt = require("bcryptjs");
const { User, Profile } = require("../models");
const { isAuthExemptPath } = require("../middlewares/auth");
const {
  isGoogleOAuthConfigured,
  getClientId,
  createOAuthState,
  verifyAccessToken,
  fetchGoogleProfile,
  findOrCreateGoogleUser,
  getCallbackUrl,
} = require("../config/googleOAuth");

function safeRedirectPath(path, fallback = "/") {
  if (!path || typeof path !== "string") return fallback;

  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;

  const pathname = trimmed.split("?")[0];
  if (/^\/(css|js|images?|fonts|uploads|api)\//i.test(pathname)) return fallback;
  if (/\.(css|js|map|png|jpe?g|gif|svg|ico|woff2?|ttf|eot)$/i.test(pathname)) {
    return fallback;
  }

  return trimmed;
}

function getPostLoginRedirect(user, storedRedirect) {
  const fallback = user.role === "admin" ? "/admin" : "/user/my-orders";
  const path = safeRedirectPath(storedRedirect, fallback);

  if (!storedRedirect || isAuthExemptPath(path)) return fallback;

  if (user.role === "admin") {
    return path.startsWith("/admin") ? path : fallback;
  }

  if (path.startsWith("/admin")) return fallback;
  return path;
}

function showLogin(req, res) {
  let next = null;
  if (req.query.next) {
    next = safeRedirectPath(req.query.next, null);
    if (next && !isAuthExemptPath(next)) req.session.redirectTo = next;
  }
  const googleOAuthEnabled = isGoogleOAuthConfigured();
  let googleOAuthState = null;
  let googleClientId = null;
  let googleRedirectUri = null;

  if (googleOAuthEnabled) {
    googleOAuthState = createOAuthState();
    req.session.googleOAuthState = googleOAuthState;
    googleClientId = getClientId();
    googleRedirectUri = getCallbackUrl();
  }

  res.render("auth/login", {
    title: "Masuk",
    googleOAuthEnabled,
    googleOAuthState,
    googleClientId,
    googleRedirectUri,
    next,
  });
}

function showRegister(req, res) {
  if (req.query.next) {
    const next = safeRedirectPath(req.query.next, null);
    if (next && !isAuthExemptPath(next)) req.session.redirectTo = next;
  }
  res.render("auth/register", { title: "Daftar" });
}

async function register(req, res) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      req.flash("error", "Semua field wajib diisi.");
      return res.redirect("/register");
    }
    if (password !== confirmPassword) {
      req.flash("error", "Konfirmasi password tidak cocok.");
      return res.redirect("/register");
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      req.flash("error", "Email sudah terdaftar. Silakan login.");
      return res.redirect("/login");
    }

    const user = await User.create({
      username,
      email,
      password,
      role: "user",
    });

    await Profile.create({
      fullName: username,
      UserId: user.id,
    });

    req.flash("success", "Registrasi berhasil! Silakan login.");
    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Terjadi kesalahan saat registrasi.");
    return res.redirect("/register");
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      req.flash("error", "Email atau password salah.");
      return res.redirect("/login");
    }

    if (!user.password) {
      req.flash("error", "Akun ini terdaftar via Google. Silakan masuk dengan Google.");
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash("error", "Email atau password salah.");
      return res.redirect("/login");
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const redirectTo = getPostLoginRedirect(user, req.session.redirectTo);
    delete req.session.redirectTo;

    req.flash("success", `Selamat datang kembali, ${user.username}!`);
    return req.session.save((err) => {
      if (err) {
        console.error(err);
        req.flash("error", "Terjadi kesalahan saat login.");
        return res.redirect("/login");
      }
      return res.redirect(redirectTo);
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Terjadi kesalahan saat login.");
    return res.redirect("/login");
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

function showGoogleCallback(req, res) {
  if (!isGoogleOAuthConfigured()) {
    req.flash("error", "Login Google belum dikonfigurasi.");
    return res.redirect("/login");
  }

  res.render("auth/googleCallback", {
    title: "Login Google",
    layout: false,
  });
}

async function googleSession(req, res) {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({ error: "Login Google belum dikonfigurasi." });
  }

  const { access_token: accessToken, state } = req.body || {};

  if (!accessToken || !state) {
    return res.status(400).json({ error: "Data login Google tidak lengkap." });
  }

  if (!req.session.googleOAuthState || state !== req.session.googleOAuthState) {
    return res.status(400).json({ error: "State OAuth tidak valid." });
  }

  delete req.session.googleOAuthState;

  try {
    await verifyAccessToken(accessToken);
    const profile = await fetchGoogleProfile(accessToken);
    const user = await findOrCreateGoogleUser(profile);

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const redirectTo = getPostLoginRedirect(user, req.session.redirectTo);
    delete req.session.redirectTo;

    return req.session.save((saveErr) => {
      if (saveErr) {
        console.error(saveErr);
        return res.status(500).json({ error: "Terjadi kesalahan saat login." });
      }

      return res.json({
        redirectTo,
        message: `Selamat datang, ${user.username}!`,
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({
      error: err.message || "Terjadi kesalahan saat login dengan Google.",
    });
  }
}

module.exports = {
  showLogin,
  showRegister,
  register,
  login,
  logout,
  showGoogleCallback,
  googleSession,
};
