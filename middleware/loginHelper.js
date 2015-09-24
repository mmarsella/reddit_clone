//WHY DO WE REQUIRE DB??????
var db = require("../models");

//loginhelpers is afunction that is run on EVERY SINGLE REQUEST!!!!


var loginHelpers = function (req,res,next){

  //every single request, this code will be run
   // check the session.id
//this code will be attached to every response!
if(!req.session){
  // if there is nothing there...move on
  console.log("THERE IS NO SESSION!");
  res.locals.currentUser = undefined;
}
else {
  // if there is something there lets go to the DB and find the user
  db.User.findById(req.session.id,function(err,user){
    console.log("FOUND USER!", user);
    // make sure the user is available in all our views
    res.locals.currentUser = user; 
  });
}

  req.login = function (user){
    req.session.id = user._id;
  };

  req.logout = function (){
    req.session.id = null;
  };

  next();
};

module.exports = loginHelpers;
