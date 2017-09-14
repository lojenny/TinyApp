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
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "1234"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: "1234"
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
    user: users[req.cookies['user_id']],  
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
    user: users[req.cookies["user_id"]],  
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined){
    res.redirect(404, "/urls/new"); //redirect to an error page with status code//
  }else {  
  let templateVars = {
    user: users[req.cookies['user_id']],  
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
  let user = findUser(req.body.email, req.body.password);
  if (user === undefined) {
    res.status(403);
    res.send("403: Forbidden");
    return;
  } 
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  let user = findUser(req.body.email, req.body.password);
  res.clearCookie('user_id', user);
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { 
    user: users[req.cookies['user_id']],  
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

// validation functions
function findUser(email, password) {
  for (let user in users) {
    if (users[user].email === email && users[user].password === password){
      return users[user];
    }else {
      return undefined;
    }
  }
}

// function  validateUser(email, password) {
//   return !email || !password || !findbyEmail(email) || !findbyPassword(password);
// }

// function findbyEmail(email){
//   for (let user in users){
//     if (users[user].email === email){
//       return users[user];
//     }
//   }
// }

// function findbyPassword(password){
//   for (let user in users){
//     if (users[user].password === password){
//       return users[user];
//     }
//   }
// }
//valicating functions

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString();

  if (findUser(email, password, id)) {
    res.status(400);
    res.send("400: Bad Request");
    return;
  } 
  users[id] = {
    id: id,
    email: email,
    password: password
  }
  console.log(users);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],  
  };
  res.render("urls_login", templateVars);
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

// function generateId() {

//   let id = generateRandomString();

//   if (findbyID(id)) {
//     generateId();
//   }

//   return id;
// }

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});