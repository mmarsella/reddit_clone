var mongoose = require("mongoose");
var Post = require("./post");
var Comment = require("./comment");
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

/** SCHEMA **/

var userSchema = new mongoose.Schema({
  name: {
    type:String,
    lowercase:true,
    required:true
  },
  password:{
    type:String,
    //NEVER LOWERCASE/UPPERCASE USER PASSWORD!!!!
    required:true
  },
  email:String,

  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Post"
  }],
  comments:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Comment"
  }],
});

/** HOOKS **/

//Before removing this user:
userSchema.pre('remove', function(next){
  // remove every post for this user
  Post.remove({user: this._id}).exec();
  next(); // now remove the user!!!
});

// THIS WILL REMOVE ALL COMMENTS MADE BY THIS USER
userSchema.pre('remove', function(next){
  // remove every post for this user
  Comment.remove({user: this._id}).exec();
  next(); // now remove the user!!!
});

userSchema.pre('save', function(next) {
  var user = this;
  // if the password has not been changed, save the user and move on...
  if (!user.isModified('password')) {
    return next();  // insures getting to the next step.
  }

/** HASHIN THE PASSWORD **/

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      // define what the password is for the user
      user.password = hash;
      // everything looks good, let's save this!
      next();
    });
  });
});

/** AUTHENTICATION **/

userSchema.statics.authenticate = function (formData, callback) {
  // this refers to the model!
  this.findOne({
    email: formData.email
  },
  function (err, user) {
    if (user === null){
      callback("Invalid username or password",null);
    }
    else {
      user.checkPassword(formData.password, callback);
    }
  });
};

//PASSWORD MATCHING
userSchema.methods.checkPassword = function(password, callback) {
  var user = this;
  bcrypt.compare(password, user.password, function (err, isMatch) {
    if (isMatch) {
      callback(null, user);
    } else {
      callback(err, null);
    }
  });
};

//EXAMPLES OF STATICS
  //db.User.findById
  //db.user.create
  //db.User.find
  //db.user.update
  //db.User.findByIdAndAllTheThings

//EXAMPLES OF METHODS
  // var user = new db.User
  //user.save

/** MODEL AND EXPORTS **/

var User = mongoose.model("User", userSchema);
module.exports = User;