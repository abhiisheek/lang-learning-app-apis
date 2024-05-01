const mongoose = require("mongoose");

const trackerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userEmail: { type: String, required: true },
  status: { type: Number, required: true, enum: [1, 2, 3] },
  enrolledTs: { type: Number },
  startedTs: { type: Number },
  completedTs: { type: Number },
});

module.exports = mongoose.model("Tracker", trackerSchema);
