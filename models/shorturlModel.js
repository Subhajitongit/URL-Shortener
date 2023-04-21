// Import the Mongoose library
const mongoose = require("mongoose");

// Define a new schema for the ShortURL model
const shorturlSchema = mongoose.Schema({
  url: {
    type: String,
    unique: true,
    required: true, // The URL field is required
  },
  originalUrl: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

// Create a new model for the ShortURL schema and export it
const shorturlModel = mongoose.model("shorturls", shorturlSchema);
module.exports = shorturlModel;
