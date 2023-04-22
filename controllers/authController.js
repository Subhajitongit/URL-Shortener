// Import required modules and models
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Handle user signup
module.exports.signup = async function signup(req, res) {
  try {
    // Destructure the request body to get the name, password, and email
    let { name, password, email } = req.body;
    // Create a new user in the database with the provided information
    let user = await userModel.create({
      name: name,
      password: password,
      email: email,
    });

    // Generate a JWT token using the user ID and the secret key
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    // Send a JSON response with a success message, the new user data, and the token
    res.status(200).json({
      message: "Succesfully Signed Up",
      data: user,
      token: token,
    });
  } catch (err) {
    // If an error occurs, send a JSON response with the error message
    res.status(400).json({
      message: err.message,
    });
  }
};

// Handle user signin
module.exports.signin = async function signin(req, res) {
  try {
    // Destructure the request body to get the password and email
    let { password, email } = req.body;
    // Find a user with the provided email in the database
    const user = await userModel.findOne({ email });

    // If no user is found, throw an error
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify the provided password by comparing it with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // If the password is invalid, throw an error
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate a JWT token using the user ID and the secret key
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    // Send a JSON response with a success message, the user data, and the token
    res.status(200).json({
      message: "Succesfully Signed In",
      data: user,
      token: token,
    });
  } catch (err) {
    // If an error occurs, send a JSON response with the error message
    res.status(400).json({
      message: err.message,
    });
  }
};

// Handle user logout
module.exports.logout = async function logout(req, res) {
  try {
    // Clear the JWT token from the client's cookies
    const bearerHeader = req.headers["authorization"];
    const token = bearerHeader.split(" ")[1];

    // Send a JSON response with a success message
    res.json({
      message: "Successfully Logged Out",
    });

    // Set the JWT token to an expired state by setting the expiry time to a past date
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        throw new Error(err.message);
      }
      decodedToken.exp = Math.floor(Date.now() / 1000) - 30; // set expiry time to 30 seconds ago
      const newToken = jwt.sign(decodedToken, process.env.JWT_SECRET);
    });
  } catch (err) {
    // If an error occurs, send a JSON response with the error message
    res.json({
      message: err.message,
    });
  }
};
