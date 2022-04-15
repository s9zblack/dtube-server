const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    video: { type: String, required: true },
    image: { type: String },
    title: { type: String, required: true },
    desc: { type: String },
    type:{type:Schema.Types.ObjectId, ref:'types'},
    likes:{type:[String]},
    dislikes:{type:[String]},
    view:{type:Number,default:0}
  },
  { timestamps: true }
);

module.exports = mongoose.model("videos", VideoSchema);
