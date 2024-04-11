const mongoose = require("mongoose");

const heartRateZoneSchema = new mongoose.Schema({
  min: Number,
  max: Number
})

module.exports = mongoose.model("HeartRateZone", heartRateZoneSchema, "heartratezones")
