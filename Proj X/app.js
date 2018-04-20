// deceleration of relevent modules
var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local").Strategy,
    passLocalMongoose = require("passport-local-mongoose"),
    express_session = require("express-session"),
    bussUser = require("./models/bussUser");

var app = express();
mongoose.connect("mongodb://localhost/projectDB");


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express_session({
    secret: "@Abzs09110",
    resave: false,
    saveUninitialized: false
}));

// initializing passport & its sessions
app.use(passport.initialize());
app.use(passport.session());
//used for reading the data from session and encoding & decoding it.
passport.use(new localStrategy(bussUser.authenticate()));
passport.serializeUser(bussUser.serializeUser());
passport.deserializeUser(bussUser.deserializeUser());

//Start of Routing Logics
//========================

app.get("/", function (req, res) {
    res.render("home");
    console.log(req.bussUser);
});

//signup auth routes
app.post("/signup", function (req, res) {
    var data = new bussUser({ firstName: req.body.firstName, lastName: req.body.lastName, username: req.body.email, rePassword: req.body.rePassword, terms: req.body.terms });
    bussUser.register(data, req.body.password, function (err, returnUser) {
        if (err) {
            console.log("Authentication error");
            console.log(err);
            return res.redirect("/");
        }
        passport.authenticate("local")(req, res, function () {
            console.log(req.bussUser);
            return res.redirect("/dashboard");
        });
    });
    res.render("signup");
});

app.get("/signup", function (req, res) {
    res.redirect("/");
});

//login auth routes
app.get("/login", function (req, res) {
    res.redirect("/dashboard");
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/"
}), function (req, res) {
    //My extra logic for assigning values in page.
});

//dashboard -> opens only when loged in or just now signed up
app.get("/dashboard", isLoggedIn, function (req, res) {
    res.render("dashboard");
});

//logged-in checker
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next;
    }
    res.redirect("/");
}

//logout routing logic
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//extra routes
app.get("/test", function (req, res) {
    res.render("test");
});

//catch all route
app.get("*", function (req, res) {
    res.render("error");
});

//End of Routes Logic

//starting server and starting listener
app.listen(2000, function () {
    console.log("Started listening to the server @ port 2000...");
});