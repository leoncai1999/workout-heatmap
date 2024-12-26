const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  athlete_id: Number,
  username: String,
  profile: String,
  heartRateZones: [{
    idx: Number,
    min: Number,
    max: Number,
  }],
})

module.exports = mongoose.model("User", userSchema, "users")
