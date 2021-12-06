const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const getUserByEmail = require("./helper");

app.use(cookieSession({
  name: 'session',
  keys: ["secret-key1"],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


//STRING GENERATOR FUNCTION
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
    characters.length));
  }
  return result;
}

//GET URLS FOR A USER FUNCTION
const urlsForUser = function(userID) {
  const userUrls = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

//ALL DATABASES
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "1@1.com", 
    password: "1"
  },
 "abcde": {
    id: "abcde", 
    email: "2@2.com", 
    password: "2"
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: 
  "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: 
  "userRandomID" }
};


//ALL POST ROUTES
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  console.log(userID);
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const id = generateRandomString();
   if (!email || !password) {
    res.status(400);
    res.send("Please enter email and password.")
  } else if (getUserByEmail(email, users)){
    res.status(400);
    res.send("Email already exists. Pleases try again.")
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id,
      email,
      password: hashedPassword
    }
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect username or password, please try again.");
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect("/urls");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  if (userID) { 
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});


//ALL GET ROUTES
app.get('/login', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_login", templateVars);
})

app.get('/register', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (user != null) {
    return res.redirect("/urls");
  }
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_register", templateVars);
})

app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const userUrls = urlsForUser(userID);
  const user = users[userID];
  const templateVars = { urls: userUrls, user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  if (userID == null) {
    return res.redirect("/login");
  }
  const user = users[userID];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (shortURL === undefined || longURL === undefined) {
    return res.redirect("/*");
  }
  res.redirect(longURL);
})

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  if (userID !== undefined) { 
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    if (shortURL === undefined || longURL === undefined) {
    return res.redirect("/*");
    }
    const user = users[userID];
    const templateVars = {shortURL, longURL: longURL, user};
    res.render("urls_shows", templateVars);
  } else {
    return res.redirect("/*");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//ERROR REDIRECT
app.use("/*", (req, res) => {
  res.status(404).send("Sorry page not found, please enter valid url.");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});