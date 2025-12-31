const express = require("express");
const authMiddleware = require("../middleware/authentication");
const {registerUser} = require("../controllers/authController")
const router = express.Router();

router.post("/login", (req, res) => {
  res.send("Login call");
});

router.post("/signup", authMiddleware, registerUser);

module.exports = router;
