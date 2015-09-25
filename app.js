/*
COOOKIES -- live in the browser
  -- session writes info to the cookie!
  -- whatever we write to the cookie is attached to req.session

Sessions -- Live in the SERVER
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
  maxAge: 3600000,   //milliseconds  (360 seconds/6min)
  secret: 'illnevertell',
  name: "chocolate chip"
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
app.get("/posts/new", function (req,res){
  res.render("posts/new");
});

//SHOW
app.get("/posts/:id", function (req,res){
    //DON'T NEED THIS.... but keeping it here to be RESTful!!
});

//EDIT
app.get("/posts/:id/edit", function (req,res){
    //DON'T NEED THIS.... but keeping it here to be RESTful!!
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
  //DON'T NEED THIS.... but keeping it here to be RESTful!!
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
  db.Post.findById(req.params.post_id).populate("comments").exec(
    function (err, post){
      db.Comment.find(req.params.post_id).populate("user").exec(
        function (err, comment){
        res.render("comments/index",{post:post, comment:comment});

        });
    });
});

//NEW
app.get("/posts/:post_id/comments/new", function (req,res){
  db.Post.findById(req.params.post_id, function (err, post){
    res.render("comments/new", {post:post});
  });
});

//SHOW
app.get("/comments/:id", function (req,res){
  // DON't NEED THIS!!!! 
});

//EDIT
app.get("/comments/:id/edit", function (req,res){
});

//CREATE
app.post("/posts/:post_id/comments", function (req,res){
  db.Comment.create(req.body.comment, function (err, comment){
    console.log("The comment: " + comment);
    if(err){
      console.log(err);
      res.render("404");
    }else{
      db.Post.findById(req.params.post_id, function (err, post){
        post.comments.push(comment);
        comment.post = comment._id;
        comment.save();
        post.save();
        res.redirect("/posts/:post_id/comments");
      });
    }
  });

});

//UPDATE
app.put("/comments/:id", function (req,res){

});

//DESTROY
app.delete("/comments/:id", function (req,res){
});



/*****  TO DO  *****

3) POST CRUD
*/



app.get('*', function(req,res){
  res.render('errors/404');
});

app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});