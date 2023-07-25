require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Task = require("./model/task");
const User = require("./model/user");
const authRoutes = require("./routes/auth");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

app.use("/", authRoutes);

app.get("/", async (req, res) => {
  const currentUser = req.session.username;
  const tasks = await Task.find({ author: currentUser });
  res.render("home.ejs", { tasks, currentUser });
});

app.post("/", async (req, res) => {
  const { task } = req.body;

  if (!task) {
    return res.status(400).json({ error: "Task cannot be empty" });
  }

  if (req.session.username !== undefined) {
    const addTask = new Task({ task, author: req.session.username });
    await addTask.save();
  }
  res.redirect("/");
});

app.put("/:id", async (req, res) => {
  const { task } = req.body;
  if (task !== "") {
    const updateTask = await Task.findByIdAndUpdate(req.params.id, {
      task: task,
    });
    await updateTask.save();
  }
  res.redirect("/");
});

app.delete("/:id", async (req, res) => {
  const taskId = req.params.id;
  await Task.findByIdAndRemove(taskId);
  res.redirect("/");
});

app.listen("3000", (req, res) => {
  console.log("Listening on port 3000");
});
