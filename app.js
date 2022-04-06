require('dotenv').config()
const express= require("express");
const ejs= require("ejs");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
var md5 = require('md5');


const app=express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public',express.static('public'));
app.set('view engine', 'ejs');


mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({ 
    email: String, 
    password: String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']  });

const user = new mongoose.model('user', userSchema);

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
    const cemail=req.body.email;
    const cpassword=req.body.password;

    const newUser = new user({ 
        email: cemail,
        password: cpassword
     });
    newUser.save(function (err) {
    if (err) console.log(err);
    else {
        console.log("New User Registerd");
        res.render("login");
    }
    });
})

app.post("/login", function(req,res){
    const cemail=req.body.email;
    const cpassword=md5(req.body.password);

    user.find({"email":cemail},function(err,foundUser){
        if(err){
            console.log("user not registered");
        }else if(foundUser){
            if(md5(req.body.password)===cpassword){
                console.log("Matched");
                res.render("secrets");
            }
        }
    })
    
})

app.listen(3000,function(req,res){
    console.log("Connection to server successfull");
})