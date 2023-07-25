const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  task: String,
  author: String,
});

module.exports = mongoose.model("Task", taskSchema);
