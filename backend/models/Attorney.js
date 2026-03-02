const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const attorneySchema = new mongoose.Schema({
  // Authentication fields
  attorneyName: {
    type: String,
    required: true
  },
  attorneyEmail: {
    type: String,
    required: true,
    unique: true
  },
  attorneyPassword: {
    type: String,
    required: true
  },
  attorneyPhone: {
    type: String,
    default: ""
  },
  attorneyGender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    default: ""
  },
  attorneyAddress: {
    type: String,
    default: ""
  },
  attorneyDOB: {
    type: Date,
    default: null
  },
  
  // Professional details
  specialization: {
    type: String,
    default: ""
  },
  qualification: {
    type: String,
    default: ""
  },
  experience: {
    type: Number,
    default: 0
  },
  fees: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Pre-save hook to hash password
attorneySchema.pre("save", async function (next) {
  if (!this.isModified("attorneyPassword")) return next();
  console.log("🔍 Hashing attorney password for:", this.attorneyEmail);
  console.log("🔍 Original password length:", this.attorneyPassword.length);
  const salt = await bcrypt.genSalt(10);
  this.attorneyPassword = await bcrypt.hash(this.attorneyPassword, salt);
  console.log("🔍 Hashed password length:", this.attorneyPassword.length);
  next();
});

const Attorney = mongoose.model("Attorney", attorneySchema);
module.exports = Attorney;

