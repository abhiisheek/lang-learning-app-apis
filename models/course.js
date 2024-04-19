const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
  },
  langId: { type: Number, required: true },
  contents: {
    youtubeVideoSrcId: { type: String },
    audioSrc: { type: String },
    textContent: { type: String },
  },
});

module.exports = mongoose.model("Course", courseSchema);
