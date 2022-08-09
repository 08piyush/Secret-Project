//jshint esversion:6
require('dotenv').config(); 
const express = require('express');
const bodyParser =require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const ejs = require("ejs");

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10 ;

// console.log(process.env.API_KEY); //it will print the content of our env var
// console.log(md5(123456));
app.use(express.static("PUBLIC"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "our little secret . ",
    resave: false,
    saveUninitialized: false

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDatabase", {useNewUrlParser: true });
// mongoose.set("useCreateIndex", true);
// const userSchema = {
//     email: String,
//     password: String
// };

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    googleId : String, 
    secret: String
});

userSchema.plugin(passportLocalMongoose);

// const secret = "thisis our little secret "; // this is my personal secret encyption package 
// userSchema.plugin(encrypt, {secret: process.env.SECRET , encryptedFields: ["password"]});//adding encrypt as a plugin , youcan add multiple strings here putting , after password in [] and writing name of field  


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function(req,res){
    res.render("home");
    // console.log(req); // it displays data requested in format in console 
});

app.get("/login", function(req,res){
    res.render("login");
    // console.log(req); // it displays data requested in format in console 
});

app.get("/register", function(req,res){
    res.render("register");
    // console.log(req); // it displays data requested in format in console 
   

});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err){ console.log(err);}
        res.redirect("/");
    });
  
});



app.get("/secrets", function(req,res){
    // if(req.isAuthenticated()){
    //     res.render("secrets");
    // }else {
    //      res.redirect("/login");
    // }

    User.find({"secret": {$ne: null}}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{ 
            if(foundUser){
                res.render("secrets", {userWithSecrets: foundUser});

            }
        }
    });

});
//deletes cookies on every restart of the server

app.get("/submit", function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }else {
         res.redirect("/login");
    }
});

app.post("/submit", function(req,res){
    const submittedSecret = req.body.secret;

    console.log(req.user);

    User.findById(req.user.id , function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                foundUser.secret = submittedSecret;
                foundUser.save(function(){
                    res.redirect("/secrets");
                });

            }
        }
    }); 

});


app.post("/register", function(req,res){
  

    //     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //         // Store hash in your password DB.
    //         const newUser = new User({
    //             email: req.body.username,
    //             password: hash
    //     });

    //     newUser.save(function(err){ //encrypt here 
    //         if(err){
    //             console.log(err);
    //         }
    //         else {
    //             res.render("secrets");
    //         }
    //     });
    // });

   
    User.register({username: req.body.username} , req.body.password, function(err, user){
        if(err)
{   console.log(err);
    res.redirect("/register");
}
    else{
        passport.authenticate("local")(req,res, function(){
            res.redirect("/secrets");
        });
    }
});

});

app.post("/login", function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password

    });

    req.login(user, function(err){
       if(err){ console.log(err);
       }else{
        passport.authenticate("local")(req,res, function(){
            res.redirect("/secrets");
        });
       }
    });
});


    // const username = req.body.username;
    // // const password = md5(req.body.password);
    // const password = req.body.password;


    // User.findOne({email: username }, function(err, foundUser){
    //     if(err){ //decrypt here 
    //         console.log(err);
    //     }
    //     else{
    //         if(foundUser){
    //             bcrypt.compare(password, foundUser.password, function(err, result) {
    //                 // result == true
    //                 if(result === true){
    //                     res.render("secrets");
    //                 }
    //             });
    //             // if(foundUser.password === password){
                   
    //             // }
    //         }
    //     }
    // });


// app.get("/contact", function(req, res){
//     res.send("contact me at : piyushpancholi.in")
// });

// app.get("/about", function(req,res){
//     res.send("hello this is from the dives of an enginner")
// });
// app.get("/hobbies", function(req,res){
//     res.send("dancing ...")
// });
  
app.listen(3000, function() {
    console.log("server started on port 3000.")
});
//this is server




//mongoose-encryption
// npm  install dotenv
//npm i md5