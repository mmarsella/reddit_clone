var mongoose = require("mongoose");

/** COMMENT SCHEMA **/

var commentSchema = new mongoose.Schema({
  body:String,
   user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
});

/** NO NEED FOR HOOKS... RIGHT? ***/

/** EXPORT **/

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
