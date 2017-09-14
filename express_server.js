const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser"); //middleware
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: "junkfood-junkie"
  }
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
  };


app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined){
    res.redirect(404, "/urls/new"); 
  }else {
  let longURL = urlDatabase[req.params.shortURL];
  res.status(302)
  res.redirect(longURL);
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  while (urlDatabase[shortURL] !== undefined){ 
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL]=req.body.longURL; //add to short and long URL key pair to database
  res.status(302);
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],  
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined){
    res.redirect(404, "/urls/new"); //redirect to an error page with status code//
  }else {  
  let templateVars = {
    username: req.cookies["username"], 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let currKey = req.params.id;
  delete urlDatabase[currKey]; //add to short and long URL key pair to database
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  let currKey = req.params.id;
  let newlongURL = req.body.longURL;
  urlDatabase[currKey]= newlongURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let user = req.body.username;
  res.cookie('username',user);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  let user = req.body.username;
  res.clearCookie('username',user);
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],  
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let randID = generateRandomString();
  users[randID] = {
    id: randID,
    email: userEmail,
    password: userPassword,
  }
  console.log(users);
  res.cookie('user_id',users[randID]);
  res.redirect('/urls');
});


// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//     res.json(urlDatabase);
//   });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});