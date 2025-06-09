const express = require("express");
const {
  signin,
  signup,
  logout,
  verify2FA,
  deactivateUser,
  reactivateUser,
  forgotPassword,
  resetPassword,
} = require("../controller/auth.controller.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/logout", logout);

router.post("/verify-email", verify2FA);

router.patch("/deactivate", auth, deactivateUser);

router.patch("/reactivate", auth, reactivateUser);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from the /hello route!' });
});


router.get("/protected",auth,  (req, res) => {
  res.send({ message: "This is protected content", user: req.user });
});


// router.get("/me", auth, (req, res) => {
//   const user = req.user.toObject();
//   delete user.password;
//   res.status(200).json({ user });
// });

module.exports = router;
