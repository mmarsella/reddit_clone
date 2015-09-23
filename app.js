


/*****USERS****/

//ROOT
app.get("/", function (req,res){
  res.redirect("/users");
});

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

//CREATE
app.post("/users", function (req,res){
});

//EDIT
app.get("/users/:id/edit", function (req,res){
});

//UPDATE
app.put("/users/:id", function (req,res){
});

//DESTROY
app.delete("/users/:id", function (req,res){
});

/***** POSTS ***/

//ROOT
app.get("/", function (req,res){
});

//INDEX
app.get("/users/posts", function (req,res){
});

//NEW
app.get("/users/:user_id/new", function (req,res){
});

//SHOW
app.get("/users/:user_id/posts/:id", function (req,res){
});

//CREATE
app.post("/users/:user_id/posts", function (req,res){
});

//EDIT
app.get("/users/:user_id/posts/:id/edit", function (req,res){
});

//UPDATE
app.put("/users/:user_id/posts/:id", function (req,res){
});

//DESTROY
app.delete("/users/:user_id/posts/:id", function (req,res){
});