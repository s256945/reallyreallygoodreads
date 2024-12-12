const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/", reviewController.addReview);

router.get("/", reviewController.getAllReviews);

router.get("/my-reviews", reviewController.getUserReviews);

router.post("/edit", reviewController.editReview);

router.delete("/delete/:reviewId", reviewController.deleteReview);

router.get("/featured", reviewController.getFeaturedReviews);

module.exports = router;
