require('dotenv').config()
const express= require("express");
const ejs= require("ejs");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const session=require('express-session');
const passport= require('passport');
const passportLocalMongoose= require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require('mongoose-findorcreate')

const app=express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public',express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({ 
    email: String, 
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/login",function(req,res){
    res.render('login');
})

app.get("/register",function(req,res){
    res.render('register');
})

app.get("/",function(req,res){
    res.render('home');
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});

app.get('/secrets',function(req,res){
    if(req.isAuthenticated()){
        res.render('secrets');
    }else{
        console.log("Failed")
    }
})
app.post("/register", function(req,res){
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
         }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets');    
            })
         }
        })
})

app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/')
})

app.post("/login", function(req,res){
    
    const user= new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets');    
            })
        }
    })

})

app.listen(3000,function(req,res){
    console.log("Connection to server successfull");
});