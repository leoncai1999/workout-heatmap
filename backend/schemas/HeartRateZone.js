const mongoose = require("mongoose");

const heartRateZoneSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idx: Number,
  min: Number,
  max: Number
})

module.exports = mongoose.model("HeartRateZone", heartRateZoneSchema, "heart-rate-zones")
