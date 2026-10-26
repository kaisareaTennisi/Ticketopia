const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const destinationController = require("../controllers/destinationController");
const commentController = require("../controllers/commentController");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");

router.use(isLoggedIn, isAdmin);

router.get("/admin", (req, res) => res.redirect("/admin/dashboard"));
router.get("/admin/dashboard", asyncHandler(adminController.dashboard));

router.get("/admin/destinations", asyncHandler(destinationController.adminListDestinations));
router.get("/admin/destinations/new", destinationController.showCreateForm);
router.post("/admin/destinations", asyncHandler(destinationController.createDestination));
router.get("/admin/destinations/:id/edit", asyncHandler(destinationController.showEditForm));
router.put("/admin/destinations/:id", asyncHandler(destinationController.updateDestination));
router.delete("/admin/destinations/:id", asyncHandler(destinationController.deleteDestination));

router.get("/admin/comments", asyncHandler(commentController.adminListComments));

module.exports = router;
