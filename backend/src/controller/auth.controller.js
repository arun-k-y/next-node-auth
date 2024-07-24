const User = require("../model/user.modal.js");

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for required fields
    if (!username || !email || !password) {
      return res.status(400).send({
        code: "MISSING_FIELDS",
        message: "All fields are required",
      });
    }

    // Create and save the new user
    const user = new User({ username, email, password });
    await user.save();
    return res.status(201).send({ user });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).send({
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      return res.status(400).send({
        code: "DUPLICATE_KEY_ERROR",
        message: `Duplicate key error: ${duplicateKey} already exists`,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue,
      });
    }

    // Log unexpected errors
    console.error("Signup error:", error);

    // Return generic error response
    return res.status(500).send({
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).send({
        code: "INVALID_PASSWORD",
        message: "Invalid password",
      });
    }

    const token = user.generateAuthToken();
    res.send({ token });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).send({
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};

const logout = (req, res) => {
  res.send("Logout route");
};

module.exports = { signin, signup, logout };
