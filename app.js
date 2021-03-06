/*
COOOKIES -- live in the browser
  -- session writes info to the cookie!
  -- whatever we write to the cookie is attached to req.session

SESSIONS -- Live in the SERVER
   -- Any kind of in-memory storage
   -- Can be used to store user info
   -- Way of remembering info from page to page
   -- stays on the server
   -- sends info to browser as well

   --creates the cookie with all of the necessary info
*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require("./models");
var methodOverride = require("method-override");
var session = require("cookie-session");
var morgan = require("morgan");
var loginMiddleware = require("./middleware/loginHelper"); //refers to name of file
var routeMiddleware = require("./middleware/routeHelper");

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
//server-side logger.  Logs requests to the terminal
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

//ALWAYS create the session BEFORE trying to using ANY MIDDLEWARE that involves req.session
app.use(session({
  maxAge: 3600000,   //milliseconds  (360 seconds/6min) --> life of the cookie
  secret: 'illnevertell', // communication
  name: "chocolate chip" // what we see in the resources tab/cookies --> browser
}));


app.use(loginMiddleware);  // calling the loginhelper on EVERY REQUEST!

/*
Models - User, Post, and Comment
Anyone can visit the root page and see a list of all the posts
Anyone can click on a post to view its comments
Only a logged in user can submit a new post
Only a logged in user can comment on a post
Only the owner/creator of a post can edit that post
Only the owner/creator of a post can delete that post
Only the owner/creator of a comment can edit that comment
Only the owner/creator of a comment can delete that comment
*/

//ROOT  --> anyone can visit the root page and see a list of all the posts
app.get("/", function (req,res){

  db.Post.find({})
  .populate("user")
  .exec(function (err,posts){
    res.render("posts/index",{posts:posts});
  });
});

/*** LOGIN AND SIGN UP ****/

app.get("/signup", routeMiddleware.preventLoginSignup, function (req,res){
  res.render("users/signup");
});

app.post("/signup", function (req,res){
  var newUser = req.body.user;
  db.User.create(newUser, function (err,user){
    console.log(user);
    if(user){
      req.login(user);
      res.redirect("/signup");  // HOME WHERE ALL THE POSTS ARE
    }else{
      console.log(err);
      res.redirect("/");
    }
  }); 
});

app.get("/login", routeMiddleware.preventLoginSignup, function (req,res){
  res.render("users/login");
});

app.post("/login", function (req,res){
  console.log("LOGGIN IN??");
  db.User.authenticate(req.body.user,
    function (err,user){
      console.log("THE USER: " + user);
      if(!err && user !== null){
        req.login(user);
        res.redirect("/");  //HOME
      }else{
        res.redirect("/users");
      }
    });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


/*****USERS****/

//SHOW
app.get("/users/:id", function (req,res){
  db.User.findById(req.params.id, function (err,user){
    res.render("users/show", {user:user});
  });
});

//EDIT
app.get("/users/:id/edit", function (req,res){
  db.User.findById(req.params.id, function (err, user){
    res.render("users/edit", {user:user});
  });
});

//CREATE
app.post("/users", function (req,res){
  db.User.create(req.body, function (err, user){
    if(err){
      console.log(err);
      res.render("./404");
    }else{
      res.redirect("/users");
    }
  });
});

//UPDATE
app.put("/users/:id", function (req,res){
  db.User.findByIdAndUpdate(req.params.id, req.body, function (err, user){
    if(err){
      console.log(err);
      res.render("./404");
    }else{
      res.redirect("/users");
    }
  });
});

//DESTROY
app.delete("/users/:id", function (req,res){
  db.User.findById(req.params.id,
    function (err, user){
      if(err){
        console.log(err);
        res.render("users/show");
      }else{
        user.remove();
        res.redirect("/users");
      }
    });
});

//SHALLOW ROUTING:  omit re-used route roots.  Allowed to change edit, show, update and delete.

/***** POSTS ***/

//DON't need any id's in route's bc they are stored in the session id!!

//NEW
app.get("/posts/new", routeMiddleware.ensureLoggedIn, function (req,res){
  res.render("posts/new");
});

//SHOW
app.get("/posts/:id", function (req,res){
    //DON'T NEED THIS.... but keeping it here to be RESTful!!
});

//EDIT
app.get("/posts/:id/edit", routeMiddleware.ensureCorrectUser, function (req,res){
  db.Post.findById(req.params.id, function (err, post){
    res.render("posts/edit",{post:post});
  });
});

//CREATE
app.post("/posts", function (req,res){
  db.Post.create(req.body.post, function (err, post){
    console.log("THE POST: " + post);
    if(err){
      console.log(err);
      res.render("404");
    }else{
      db.User.findById(req.session.id, function (err,user){
        console.log("USER: " + user);
        user.posts.push(post);
        console.log("POSTS ARRAY: " + user.posts);
        post.user = user._id;
        post.save();
        user.save();
        res.redirect("/");
      });
    }
  });
});

//UPDATE
app.put("/posts/:id", function (req,res){
  db.Post.findByIdAndUpdate(req.params.id, req.body.post, function (err, post){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});

//DESTROY
app.delete("/posts/:id", routeMiddleware.ensureCorrectUser, function (req,res){  // Nobody will see the id b/c its a delete route.
  console.log("INSIDE DELETE");
  db.Post.findByIdAndRemove(req.params.id, function (err, post){
    console.log("DELETED:" + post);
    if(err){
      console.log(err);
      res.redirect("/");
    }else{
      res.redirect("/");
    }
  });
});

/** COMMENTS **/

//INDEX
app.get("/posts/:post_id/comments", function (req,res){
  db.Comment.find({post:req.params.post_id}).populate("user").exec(function (err, comments){
    console.log("THESE ARE THE COMMENTS!", comments);
    db.Post.findById(req.params.post_id).populate("comments").exec(function (err, post){
      // console.log("THIS IS THE POST!", post)
      res.render("comments/index",{comments:comments, post:post});
    });
  });
});

//NEW
app.get("/posts/:post_id/comments/new", function (req,res){
  console.log(req.params.post_id);
  db.Post.findById(req.params.post_id, function (err, post){
    console.log("CURRENT USER: ",res.locals.currentUser);
    // console.log("THIS IS THE ERROR", err);
    console.log("THIS IS THE POST", post);
    res.render("comments/new", {post:post});
  });
});

//SHOW
app.get("/comments/:id", function (req,res){
  // DON't NEED THIS!!!! 
});

//EDIT
app.get("/comments/:id/edit", routeMiddleware.ensureCorrectUserForComment, function (req,res){
  db.Comment.findById(req.params.id, function (err, comment){
  console.log("The comment to update:",comment);
    res.render("comments/edit", {comment:comment});
  });
});

//CREATE
app.post("/posts/:post_id/comments", routeMiddleware.ensureLoggedIn, function (req,res){
  var newComment = new db.Comment(req.body.comment);
  newComment.user = req.session.id;
  newComment.save(function (err, comment){
    console.log("The comment: " + comment);
    if(err){
      console.log(err);
      res.render("404");
    }else{
      db.Post.findById(req.params.post_id, function (err, post){
        post.comments.push(comment);
        comment.post = post._id;
        comment.save();
        post.save();
        res.redirect("/posts/" + req.params.post_id + "/comments");
      });
    }
  });
});

//UPDATE
app.put("/comments/:id", function (req,res){
  db.Comment.findByIdAndUpdate(req.params.id, req.body.comment, function (err, comment){
    console.log("The comment being update:",comment);
    if(err){
      console.log(err);
    }else{
      res.redirect("/posts/" + comment.post + "/comments");
    }
  });

});

//DESTROY  
app.delete("/comments/:id", routeMiddleware.ensureCorrectUserForComment,  function (req,res){
  db.Comment.findByIdAndRemove(req.params.id, req.body, function (err, comment){
    console.log(req.params.id);
    console.log("The comment is: ", comment);
    if(err){
      console.log(err);
    }else{
      res.redirect("/posts/" + comment.post + "/comments");
    }
  });
});

app.get('*', function(req,res){
  res.render('404');
});

app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});