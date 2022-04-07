require('dotenv').config()
const express= require("express");
const ejs= require("ejs");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app=express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public',express.static('public'));
app.set('view engine', 'ejs');


mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = mongoose.Schema({ 
    email: "string", 
    password: "string"
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']  });

const User = new mongoose.model('User', userSchema);

app.get("/login",function(req,res){
    res.render('login');
})

app.get("/register",function(req,res){
    res.render('register');
})

app.get("/",function(req,res){
    res.render('home');
})

app.post("/register", function(req,res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({ 
            email: req.body.userName,
            password: hash
         });
         console.log(req.body.email);
        newUser.save(function (err) {
        if (err) console.log(err);
        else {
            console.log("New User Registerd");
            res.render("login");
        }
        });
    });
})

app.post("/login", function(req,res){
    const cemail=req.body.usernName;
    const cpassword=req.body.password;

    User.findOne({email:cemail},function(err,foundUser){
        if(err){
            console.log("user not registered");
        }else {
            if(foundUser){
                bcrypt.compare(cpassword, foundUser.password, function(err, result) {
                    // result == true
                    if(result===true){
                        console.log("Matched");
                        res.render("secrets");
                    }else {
                        console.log("wrong password"+foundUser.email)
                        console.log(foundUser);
                    };
                });
            }
        }
    })
    
})

app.listen(3000,function(req,res){
    console.log("Connection to server successfull");
})