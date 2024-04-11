const mongoose = require("mongoose");

const heartRateZoneSchema = new mongoose.Schema({
  idx: Number,
  min: Number,
  max: Number
})

module.exports = mongoose.model("HeartRateZone", heartRateZoneSchema, "heartratezones")
