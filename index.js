"use strict"

// include modules
var express = require('express');
var fileUpload = require('express-fileupload');
var bodyParser = require("body-parser");
var session = require("express-session");
var mysql = require("mysql");


// configure the port
var port = "8000";

// create express app object
var app = express();

// configure static dir
app.use(express.static("static"));

/*
Configure middlewares
 */
app.use(session({secret: "ttgfhrwgedgnl7qtcoqtcg2uyaugyuegeuagu111",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 120000}}));
app.set("view-engine", "ejs");
app.set("views", "templates");
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

// configure out database connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: " ",
    database: "project"
    //'GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'password'';
});

// connect to the DB
con.connect( function(err) {
    if (err) {
        console.log("Error: "+err);
    } else {
        con.query("SELECT * FROM users", function (err, results){
            console.log(results);
         if (err) {throw err}
        })
        console.log("Successfully connected to DB");

    }
});


//configure routes
// GET routes
app.get("/", function(req, res) {
    var sessionData;
    if (req.session.data) {
        sessionData = req.session.data;
    }
    res.render("home.ejs", {"user": sessionData});
})

app.get("/login", function(req, res) {
    res.render("login.ejs");
})

// /profile is only accessible for logged in users

/*app.post("/user-home", function(req, res){
    var sessionData = null;
    if (req.session.data) {
        sessionData = req.session.data[0];
        console.log(req.session.data);
    }
    if (sessionData) {
        res.render("user-home.ejs", {"username": sessionData});
    } else {
        console.log("error from app.post")
        res.redirect('/');
    }

})*/

app.post("/login", function(req, res) {
    var found = false;
   /* var sql = `SELECT * FROM users`; */

    var username = req.body.username;
    var password = req.body.password;
    var sessionData = null;
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    //var sessionData = req.session.data;

    var sql = con.query ('SELECT * FROM users WHERE username = ? AND pass = ?', [username, password], function(err, results){
        console.log(err, results);

   /* con.query(sql, function (err, results) {*/
        if (err) {
            res.send("A database error occurred: " + err);
        } else {
            if (results.length > 0) {
                for (var i in results) {
                   if (username == results[i].username && password == results[i].password)
                   // if (req.session.username = req.body.username)
                    { // judge if the username and password that users input are right
                        found = true;
                        console.log("found");
                        req.session.username = username;
                        sessionData = req.session.username;
                    }
                }
                res.render("user-home.ejs", {"user": sessionData});

            }
        }
    })
});

/*app.get("/user-home", function(req, res) {
    res.render("user-home.ejs")
})*/

// /upload is only accessible for logged in users
app.get("/upload", function(req, res) {
    var sessionData= req.session.data;
    // if (req.session.data) {
    //     //sessionData = req.session.data;//[0];
    //     console.log(sessionData)
    // }
    if (sessionData) {
        res.render("upload.ejs", {"user": sessionData});
    } else {
        res.redirect('/');
    }
})

/*// POST routes
// checks if there is a user record in the connected database with the mmatching username and password
app.post("/login", function(req, res) {
    var user = req.body.username;
    var pass = req.body.password;

    var sql = `SELECT * FROM users WHERE username="${username}" and password="${password}"`;

    con.query(sql, function(err, results) {
        if (err) {
            res.send("A database error occurred: "+err);
        } else {
            if (results.length >0) {
                console.log(results);
                req.session.data = results;
                 res.render("user-home.ejs");
            } else {
                console.log("No results returned");
                res.redirect('/');
            }
        }
    });
})*/

app.post("/upload", function(req, res) {
    var file = req.files.myimage;
    file.mv("static/uploads"+file.name);
    res.render("upload.ejs", {"filename": file.name});
});

app.get("/delete", function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

/*
Start the server
 */
app.listen(port);
console.log("Server running on http://localhost:"+port);

