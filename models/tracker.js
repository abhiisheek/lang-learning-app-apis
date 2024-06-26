const mongoose = require("mongoose");

const trackerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userEmail: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
  },
  enrolledTs: { type: Number },
  startedTs: { type: Number },
  completedTs: { type: Number },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
  },
  langId: { type: Number, required: true },
});

module.exports = mongoose.model("Tracker", trackerSchema);
