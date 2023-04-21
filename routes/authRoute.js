// Import necessary modules
const express = require("express");

const { signup, signin, logout } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/verifyToken");

// Create a new router instance
const authRouter = express.Router();

// Define POST endpoints for user signup, signin and logout
authRouter.route("/signup").post(signup);
authRouter.route("/signin").post(signin);
authRouter.route("/logout").post(verifyToken, logout);

// Export the router instance for use in other modules
module.exports = authRouter;
