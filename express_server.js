const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser"); //middleware
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID"},
  "b2b2b2": { longURL: "https://http.cat/", userID: "user3RandomID"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("1234", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("1234", 10)
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: bcrypt.hashSync("1234", 10)
  }
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["banana"]
}));

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
  };

function findUser(email, password) {
  for (let user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)){
      return users[user];
    }
  }
}

function urlsForUser(id){
  const urls = {};
  for (let shortURL in urlDatabase){
    if (urlDatabase[shortURL].userID === id){
      urls[shortURL]=urlDatabase[shortURL];
    }
  }
  return urls;
}

app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (!user){
    res.redirect(403, "/login");
    return;
  }
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],  
  };
  if (templateVars.user === undefined){
    res.status(403);
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined){
    res.redirect(404, "/urls/new"); 
  }else {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.status(302)
  res.redirect(longURL);
  }
});

app.post("/urls", (req, res) => {
  let user = users[req.session.user_id];
  let shortURL = generateRandomString();
  if (!user){
    res.render("error_401");
  }
  while (urlDatabase[shortURL] !== undefined){ 
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL]= { longURL: req.body.longURL, userID: user.id};
  res.status(302);
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});


app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user){
    res.render("error_401");
  }
  let templateVars = {
    user: user,
    urls: urlsForUser(user.id)
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user){
    res.render("error_401");
  }
  if (urlDatabase[req.params.id] === undefined){
    res.render("error_404"); 
  }
  if (user.id !== urlDatabase[req.params.id].userID){
    res.render("error_403");
  } else {  
  let templateVars = {
    user: users[req.session.user_id],  
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let currKey = req.params.id;
  let user = users[req.session.user_id];
  if (user.id !== urlDatabase[currKey].userID){
    res.send("403: Forbidden");
    return;
  }
  delete urlDatabase[currKey]; //add to short and long URL key pair to database
  res.redirect('/urls');
});


app.post("/urls/:id", (req, res) => {
  let currKey = req.params.id;
  let newlongURL = req.body.longURL;
  let user = users[req.session.user_id];
  if (user.id !== urlDatabase[currKey].userID){
    res.send("403: Forbidden");
    return;
  }
  urlDatabase[currKey].longURL= newlongURL;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  let user = findUser(req.body.email, req.body.password);
  if (user === undefined) {
    res.status(403);
    res.render("error_401");
    return;
  } 
  req.session.user_id = user.id;
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  let user = users[req.session.user_id];
  if (user){
    res.redirect("/urls");
  }
  let templateVars = { 
    user: users[req.session.user_id],  
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);
  let id = generateRandomString();
  if (!email || !password){
    res.render("error_406");
  }
  for (user in users){
    if (users[user].email === email){
      res.render("error_400");
    }
  }
  users[id] = {
    id: id,
    email: email,
    password: password
  }
  req.session.user_id = id;
  res.redirect('/urls');
});


app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],  
  };
  let user = users[req.session.user_id];
  if (user){
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});