/**  CONNECTING TO DATABASE */
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/reddit_clone");
mongoose.set('debug',true);  // LOGS ALL database actions in the nodemone tab

module.exports.User = require("./user");
module.exports.Post = require("./post"); //post module
module.exports.Comment = require("./comment");