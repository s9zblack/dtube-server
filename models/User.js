const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: { type: String, required:true },
    password: { type: String, required :true},
    phoneNumber: { type: String },
    role: { type: Number, required:true, default: 1 },
    follows:{type:[String]},
    videos:{type:[String]}
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", UserSchema);
