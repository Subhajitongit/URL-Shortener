// Import necessary modules
const shortid = require("shortid");
const shorturlModel = require("../models/shorturlModel");
const userModel = require("../models/userModel");
const { createClient } = require("redis");

// Create a Redis client instance
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Connect to Redis
client.connect((err) => {
  if (err) {
    console.error("Error connecting to Redis", err);
    return;
  }
  console.log("Connected to Redis");
});

// Handle Redis client errors
client.on("error", (err) => {
  console.error("Redis error: ", err);
});

// Define a function to create a short URL
module.exports.createShortUrl = async function createShortUrl(req, res) {
  try {
    // Get the URL from the request body
    let { url } = req.body;
    // Generate a short ID using the shortid module
    const shortId = shortid.generate();

    // Check if the URL is already shortened in Redis cache
    const cachedShortUrl = await client.get(url);
    if (cachedShortUrl) {
      const cachedData = JSON.parse(cachedShortUrl);
      const { fUrl, check } = cachedData;
      // Check if the user has already shortened this URL
      if (check === null) {
        // If the user has not already shortened this URL, add it to their list of shortened URLs
        await userModel.findByIdAndUpdate(req.user, {
          $push: { urls: fUrl },
        });
      }

      // Return the short URL and user information
      return res.json({
        message: "Successfully created!",
        user: req.user,
        shortUrl: `localhost:8080/${fUrl.url}`,
      });
    }

    // Check if the URL is already shortened
    if (await shorturlModel.findOne({ originalUrl: url })) {
      // If the URL is already shortened, get the short URL from the database
      const fUrl = await shorturlModel.findOne({ originalUrl: url });

      // Check if the user has already shortened this URL
      const check = await userModel.findOne({ urls: { $in: [fUrl] } });
      if (check === null) {
        // If the user has not already shortened this URL, add it to their list of shortened URLs
        await userModel.findByIdAndUpdate(req.user, {
          $push: { urls: fUrl },
        });
      }

      // Add the short URL data to Redis cache for future use
      await client.set(url, JSON.stringify({ fUrl, check }));

      // Return the short URL and user information
      return res.json({
        message: "Succesfully created!",
        user: req.user,
        shortUrl: `localhost:8080/${fUrl.url}`,
      });
    }

    // If the URL is not already shortened, create a new short URL
    let shortUrl = await shorturlModel.create({
      url: shortId,
      originalUrl: url,
      created_at: Date.now(),
    });

    // Add the new short URL to Redis cache for future use
    await client.set(url, JSON.stringify({ fUrl: shortUrl, check: null }));

    // Add the new short URL to the user's list of shortened URLs
    await userModel.findByIdAndUpdate(req.user, {
      $push: { urls: shortUrl },
    });

    // Return the new short URL and user information
    res.json({
      message: "Succesfully created!",
      user: req.user,
      shortUrl: `localhost:8080/${shortId}`,
    });
  } catch (err) {
    // If there is an error, return an error message
    res.json({
      message: err.message,
    });
  }
};
