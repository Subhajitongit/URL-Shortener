// Import the jsonwebtoken library
const jwt = require("jsonwebtoken");

// Export a function that verifies a token
module.exports.verifyToken = async function verifyToken(req, res, next) {
  try {
    // Extract the bearer token from the Authorization header in the request
    const bearerHeader = req.headers["authorization"];

    // Check if the bearer token is undefined
    if (typeof bearerHeader !== undefined) {
      // Split the bearer token into an array
      const bearer = bearerHeader.split(" ");

      // Extract the actual token from the array
      const token = bearer[1];

      // Add the token to the request object for future use
      req.token = token;

      // Verify the token using the JWT_SECRET value from the environment variables
      jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            // Handle expired token
            return res.status(401).json({ error: "Token expired" });
          } else {
            // Handle other errors
            return res.status(401).json({ error: "Invalid token" });
          }
        } else {
          // If the token is valid, add the userId from the decoded token to the request object
          req.user = data.userId;

          // Call the next middleware function
          next();
        }
      });
    } else {
      // If the bearer token is undefined, return a JSON response indicating so
      res.json({
        msg: "Please login to your account!",
        success: false,
      });
    }
  } catch {
    // If an exception is caught, return a JSON response indicating that the user should log in
    return res.json({
      message: "Please login to your account!",
    });
  }
};
