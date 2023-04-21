// Import necessary modules
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define a regular expression to validate email addresses
const validateEmail = function (email) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

// Define a password validation function using a regular expression
const passwordValidator = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[a-fA-F\d]).{6,}$/;
  return regex.test(password);
};

// Define a schema for the user collection in the database
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: [3, "Name length must be at least 3 characters"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validateEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      minLength: [6, "Password length must be at least 6 characters"],
      required: true,
      validate: [
        passwordValidator,
        "Please enter a password with 1 lowercase, 1 uppercase, 1 special character",
      ],
    },
    urls: {
      type: [],
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields to documents
);

// Define a pre-save hook to hash the user's password before saving to the database
userSchema.pre("save", async function (next) {
  const user = this;

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Define a model for the user collection using the schema
const userModel = mongoose.model("users", userSchema);

// Export the model for use in other modules
module.exports = userModel;
