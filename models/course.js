const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  level: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  language: { type: String, required: true },
  contents: { type: String, required: true },
});

module.exports = mongoose.model("Course", courseSchema);
