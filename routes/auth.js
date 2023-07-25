const express = require("express");
const router = express.Router();
const User = require("../model/user");

router.get("/auth", (req, res) => {
  res.render("auth.ejs");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    req.session.username = username;
    return res.redirect("/");
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const newUser = new User({ username, password });

    await newUser.save();

    req.session.username = username;
    return res.redirect("/");
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/logout", (req, res) => {
  req.session.username = undefined;
  res.redirect("/");
});

module.exports = router;
