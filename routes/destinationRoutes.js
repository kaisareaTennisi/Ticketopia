const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");
const transactionController = require("../controllers/transactionController");
const commentController = require("../controllers/commentController");
const { isLoggedIn } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");

router.get("/", destinationController.showHome);
router.get("/destinations", destinationController.listDestinations);
router.get("/destinations/:id", destinationController.showDetail);
router.post(
  "/destinations/:id/comments",
  isLoggedIn,
  asyncHandler(commentController.createComment)
);
router.post("/tickets/:ticketId/buy", isLoggedIn, asyncHandler(transactionController.buyTicket));

module.exports = router;
