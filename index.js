// Import required modules and dependencies
const express = require("express");
const authRouter = require("./routes/authRoute");
const urlRouter = require("./routes/urlRoute");
const { connectToMongoDB } = require("./dbconfig");
const shorturlModel = require("./models/shorturlModel");
require("dotenv").config();

// Create an instance of the express application
const app = express();

// Connect to MongoDB
connectToMongoDB(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Set the port number
const PORT = process.env.PORT || 8080;

// Use JSON and URL-encoded bodies for incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle requests to short URLs
app.get("/:shortId", async function (req, res) {
  try {
    const { shortId } = req.params;
    const url = await shorturlModel.findOne({ url: shortId });
    if (!url) {
      return res.json({ message: "No matching URL found." });
    }
    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Define routes for auth and URL APIs
app.use("/api/auth", authRouter);
app.use("/api/url", urlRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}.`);
});
