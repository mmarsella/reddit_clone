var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();  // need to call this in order to carry on with the operation... in this case pass on the req to the server
    }else {
     res.redirect('/login');
    }
  },

  ensureCorrectUser: function(req, res, next) {
    db.Post.findById(req.params.id, function(err,post){
      //added toString() to ensure specific user can 
      // only delete their own posts.
      if (post.user.toString() !== req.session.id) {
        res.redirect('/');
      }else {
        console.log("GOING TO NEXT");
       return next();
      }
    });
  },

  ensureCorrectUserForComment: function (req,res,next){
    db.Comment.findById(req.params.id).populate("user").exec(
      function (err,comment){
        console.log("Comment in rtHelper: ",comment);
        if(comment.user != undefined && comment.user.id != req.session.id){
          res.redirect("/posts/" + comment.post + "/comments");
        }else{
          return next();
        }
      });
  },
  
  

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/');
    }else {
     return next();
    }
  }
};
module.exports = routeHelpers; // exporting object with methods