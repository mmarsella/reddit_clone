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

//ROOT
app.get("/", function (req,res){
  res.redirect("/users");
});

/*****USERS****/

//INDEX
app.get("/users", function (req,res){
  res.render("index");
});

//NEW
app.get("/users/new", function (req,res){
});

//SHOW
app.get("/users/:id", function (req,res){
});

//EDIT
app.get("/users/:id/edit", function (req,res){
});

//CREATE
app.post("/users", function (req,res){
});

//UPDATE
app.put("/users/:id", function (req,res){
});

//DESTROY
app.delete("/users/:id", function (req,res){
});


//SHALLOW ROUTING:  omit re-used route roots.  Allowed to change edit, show, update and delete.

/***** POSTS ***/

//INDEX
app.get("/users/:user_id/posts", function (req,res){
});

//NEW
app.get("/users/:user_id/posts/new", function (req,res){
});

//SHOW
app.get("/posts/:id", function (req,res){
});

//EDIT
app.get("/posts/:id/edit", function (req,res){
});

//CREATE
app.post("/users/:user_id/posts", function (req,res){
});

//UPDATE
app.put("/posts/:id", function (req,res){
});

//DESTROY
app.delete("/posts/:id", function (req,res){
});

/** COMMENTS **/

//INDEX
app.get("/users/:user_id/posts/:post_id/comments", function (req,res){
});

//NEW
app.get("/users/:user_id/posts/:post_id/comments/new", function (req,res){
});

//SHOW
app.get("/comments/:id", function (req,res){
});

//EDIT
app.get("/comments/:id/edit", function (req,res){
});

//CREATE
app.post("/users/:user_id/posts/:post_id/comments", function (req,res){
});

//UPDATE
app.put("/comments/:id", function (req,res){
});

//DESTROY
app.delete("/comments/:id", function (req,res){
});


app.get('*', function(req,res){
  res.render('errors/404');
});

app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});