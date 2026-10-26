function isAuthExemptPath(path) {
  if (!path || typeof path !== "string") return false;
  const pathname = path.split("?")[0];
  return pathname === "/" || pathname === "/login" || pathname === "/register";
}

function isPublicPath(path) {
  if (!path || typeof path !== "string") return false;
  const pathname = path.split("?")[0];
  if (isAuthExemptPath(pathname)) return true;
  if (pathname === "/destinations" || pathname.startsWith("/destinations/")) return true;
  return false;
}

function shouldRememberRedirect(path) {
  if (!path || !path.startsWith("/")) return false;
  const pathname = path.split("?")[0];
  if (isAuthExemptPath(pathname)) return false;
  if (/^\/(css|js|images?|fonts|uploads|api)\//i.test(pathname)) return false;
  if (/\.(css|js|map|png|jpe?g|gif|svg|ico|woff2?|ttf|eot)$/i.test(pathname)) {
    return false;
  }
  return true;
}

function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  if (shouldRememberRedirect(req.originalUrl)) {
    req.session.redirectTo = req.originalUrl;
    return req.session.save((err) => {
      if (err) console.error(err);
      req.flash("error", "Silakan login terlebih dahulu untuk melanjutkan.");
      return res.redirect("/login");
    });
  }
  req.flash("error", "Silakan login terlebih dahulu untuk melanjutkan.");
  return res.redirect("/login");
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }
  req.flash("error", "Halaman ini hanya bisa diakses oleh admin.");
  return res.redirect("/");
}

function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    const user = req.session.user;
    return res.redirect(user.role === "admin" ? "/admin" : "/user/my-orders");
  }
  return next();
}

const { getCart, getCartCount } = require("../controllers/cartController");

function injectLocals(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.cartCount = req.session.user ? getCartCount(getCart(req.session)) : 0;
  next();
}

module.exports = { isLoggedIn, isAdmin, isGuest, injectLocals, isPublicPath, isAuthExemptPath };
