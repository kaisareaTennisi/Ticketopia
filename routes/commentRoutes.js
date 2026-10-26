const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { isLoggedIn } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");

router.put("/comments/:id", isLoggedIn, asyncHandler(commentController.updateComment));
router.delete("/comments/:id", isLoggedIn, asyncHandler(commentController.deleteComment));

module.exports = router;
