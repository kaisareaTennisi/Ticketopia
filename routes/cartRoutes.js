const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isLoggedIn } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");

router.get("/cart", isLoggedIn, asyncHandler(cartController.showCart));
router.post("/cart/checkout", isLoggedIn, asyncHandler(cartController.checkoutCart));

router.get("/api/cart/summary", isLoggedIn, asyncHandler(cartController.getCartSummary));
router.post("/api/cart/add", isLoggedIn, asyncHandler(cartController.addToCart));
router.patch("/api/cart/items/:ticketId", isLoggedIn, asyncHandler(cartController.updateCartItem));
router.delete("/api/cart/items/:ticketId", isLoggedIn, asyncHandler(cartController.removeFromCart));

module.exports = router;
