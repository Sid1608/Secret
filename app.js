//jshint esversion:6
require ('dotenv').config();
const express= require ("express");
const bodyParser= require("body-parser");
const ejs=require("ejs");
const mongoose =require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


/**App setup */
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

/* Setting up session */
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

/* initializing passport */
app.use(passport.initialize());
app.use(passport.session()); 

/**Setting up Connection */
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});
// mongoose.set("useCreateIndex", true);

/**User-Schema */
const userSchema=new mongoose.Schema({
    email: String,
    password:String
});

/*setting up passport-local-mongoose */
userSchema.plugin(passportLocalMongoose);/* to hash and salt the passwords and to save user into mongoDB database */

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**Home Route */
app.get("/",function(req,res){
    res.render("home");
});

/**get route for login page */
app.get("/login",function(req,res){
    res.render("login");
});
/**get route for register page */
app.get("/register",function(req,res){
    res.render("register");
});

/*get route for secrets page */
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

/*get route for logout page */
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});
/**post route for register page */
app.post("/register",function(req,res){
    /*This method comes from passport-local-mongoose package */
    User.register({username:req.body.username}, req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            /*Authenticating user */
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
    
});

/**post route for login page */
app.post("/login",function(req,res){
    const user=new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })
})

/**Server listening on port 3000 */
app.listen(3000,function(){
    console.log("Server started on port 3000.");
})