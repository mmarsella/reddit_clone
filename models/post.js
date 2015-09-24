var mongoose = require("mongoose");
var Comment = require("./comment");

/*** POST SCHEMA **/
var postSchema = new mongoose.Schema({
  title:String,
  url:String,
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  comments:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Comment"
  }],
});

/** HOOKS **/
postSchema.pre("remove", function(next){
  //remove every comment for this post
  Comment.remove({post: this._id}).exec();
  next(); // THEN remove the POST
});

/** EXPORTS **/
var Post = mongoose.model("Post", postSchema);
module.exports = Post;