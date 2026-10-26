const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const profileController = require("../controllers/profileController");
const { isLoggedIn } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");

router.get("/", isLoggedIn, (req, res) => res.redirect("/user/my-orders"));
router.get("/my-orders", isLoggedIn, asyncHandler(transactionController.myOrders));
router.post("/my-orders/:id/pay", isLoggedIn, asyncHandler(transactionController.payOrder));
router.post("/my-orders/:id/cancel", isLoggedIn, asyncHandler(transactionController.cancelOrder));
router.get("/profile", isLoggedIn, asyncHandler(profileController.showProfile));
router.put("/profile", isLoggedIn, asyncHandler(profileController.updateProfile));

module.exports = router;
