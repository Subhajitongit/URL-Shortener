// Import necessary modules
const express = require("express");
const { createShortUrl } = require("../controllers/urlController");
const rateLimit = require("express-rate-limit");

const { verifyToken } = require("../middlewares/verifyToken");

// Create a new router instance
const urlRouter = express.Router();

// Define rate limiting for the createShortUrl endpoint
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Maximum of 10 requests per hour
  message: "Too many urls created, please try again after an hour",
  keyGenerator: function (req) {
    return req.user; // Use the user ID as the key for rate limiting
  },
});

// Define a POST endpoint for creating a new short URL
urlRouter.route("/create").post(verifyToken, limiter, createShortUrl);

// Export the router instance for use in other modules
module.exports = urlRouter;
