const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    videoId:{type:Schema.Types.ObjectId, ref:'videos'},
    userId:{type:Schema.Types.ObjectId, ref:'users'},
    text:{type:String, required:true}
  },
  { timestamps: true }
);

module.exports = mongoose.model("comments", CommentSchema);
