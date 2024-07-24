const express = require("express");
const { signin, signup, logout } = require("../controller/auth.controller.js");

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/logout", logout);

module.exports = router;
