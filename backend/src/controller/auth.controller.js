const User = require("../model/user.modal.js");
const sendEmail = require("../utils/sendEmail.js");

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
    const userObj = user.toObject();
    delete userObj?.password;
    return res.status(201).send({ user: userObj });
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
      return res
        .status(401)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ code: "INVALID_PASSWORD", message: "Invalid password" });
    }

    // Generate 6-digit 2FA code
    const twoFACode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.twoFACode = twoFACode;
    user.twoFACodeExpiry = expiry;
    await user.save();

    await sendEmail(
      email,
      "Giantogram Verification Code",
      `Hello,

We received a request to sign in to your account. Please use the verification code below to continue:

Verification Code: ${twoFACode}

This code will expire in 5 minutes. If you didn’t request this, you can safely ignore this email.

Thanks,
Giantogram`
    );

    res.status(200).json({
      code: 200,
      message:
        "A verification code has been sent to your email. Please enter it to continue.",
    });
  } catch (error) {
    console.error("Signin error:", error);
    res
      .status(500)
      .json({ code: "UNKNOWN_ERROR", message: "An unexpected error occurred" });
  }
};

const logout = (req, res) => {
  res.send("Logout route");
};

const verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    if (user.twoFACode !== otp) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid or expired code" });
    }

    if (user.twoFACodeExpiry < new Date()) {
      return res.status(400).json({ code: 400, message: "Code expired" });
    }

    // Clear 2FA fields after successful verification
    user.twoFACode = null;
    user.twoFACodeExpiry = null;
    await user.save();

    const userObj = user.toObject();
    delete userObj?.password;

    const token = user.generateAuthToken();
    res
      .status(200)
      .json({ code: 200, message: "Login successful", token, user: userObj });
  } catch (error) {
    console.error("2FA verification error:", error);
    res
      .status(500)
      .json({ code: "UNKNOWN_ERROR", message: "An unexpected error occurred" });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { email } = req.body; // or use req.params.id if using user ID

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    if (user.isDeactivated) {
      return res.status(400).json({
        code: "ALREADY_DEACTIVATED",
        message: "User already deactivated",
      });
    }

    user.isDeactivated = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj?.password;

    res.status(200).json({
      code: 200,
      message: "User successfully deactivated",
      user: userObj,
    });
  } catch (error) {
    console.error("Deactivate error:", error);
    res
      .status(500)
      .json({ code: "UNKNOWN_ERROR", message: "An unexpected error occurred" });
  }
};

const reactivateUser = async (req, res) => {
  try {
    const { email } = req.body; // or use req.params.id if reactivating by ID

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    if (!user.isDeactivated) {
      return res
        .status(400)
        .json({ code: "NOT_DEACTIVATED", message: "User is already active" });
    }

    user.isDeactivated = false;
    await user.save();

    const userObj = user.toObject();
    delete userObj?.password;

    res.status(200).json({
      code: 200,
      message: "User successfully reactivated",
      user: userObj,
    });
  } catch (error) {
    console.error("Reactivate error:", error);
    res
      .status(500)
      .json({ code: "UNKNOWN_ERROR", message: "An unexpected error occurred" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: "MISSING_EMAIL",
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        code: 200,
        message:
          "If an account with that email exists, a password reset code has been sent.",
      });
    }

    // Check if user is deactivated
    // if (user.isDeactivated) {
    //   return res.status(400).json({
    //     code: "ACCOUNT_DEACTIVATED",
    //     message: "Account is deactivated. Please contact support.",
    //   });
    // }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetCode = resetCode;
    user.passwordResetExpiry = expiry;
    await user.save();

    await sendEmail(
      email,
      "Giantogram Password Reset Code",
      `Hello,

We received a request to reset your password. Please use the reset code below to create a new password:

Reset Code: ${resetCode}

This code will expire in 15 minutes. If you didn't request a password reset, you can safely ignore this email.

Thanks,
Giantogram`
    );

    res.status(200).json({
      code: 200,
      message:
        "If an account with that email exists, a password reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ code: "UNKNOWN_ERROR", message: "An unexpected error occurred" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        code: "MISSING_FIELDS",
        message: "Email, reset code, and new password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        code: "INVALID_RESET",
        message: "Invalid reset code or email",
      });
    }

    if (user.passwordResetCode !== resetCode) {
      return res.status(400).json({
        code: "INVALID_RESET_CODE",
        message: "Invalid reset code",
      });
    }

    if (user.passwordResetExpiry < new Date()) {
      return res.status(400).json({
        code: "RESET_CODE_EXPIRED",
        message: "Reset code has expired. Please request a new one.",
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpiry = null;

    // Clear any existing 2FA codes for security
    user.twoFACode = null;
    user.twoFACodeExpiry = null;

    await user.save();

    // Send confirmation email
    await sendEmail(
      email,
      "Giantogram Password Changed",
      `Hello,

Your password has been successfully changed. If you didn't make this change, please contact our support team immediately.

Thanks,
Giantogram`
    );

    res.status(200).json({
      code: 200,
      message: "Password has been successfully reset",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ code: "UNKNOWN_ERROR", message: "An unexpected error occurred" });
  }
};

module.exports = {
  signin,
  signup,
  logout,
  verify2FA,
  deactivateUser,
  reactivateUser,
  forgotPassword,
  resetPassword,
};
