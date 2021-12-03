const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");

// app.use(cookieParser)

app.use(cookieSession({
  name: 'session',
  keys: ["secret-key1"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//STRING GENERATOR FUNCTION----------------------------------

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
    characters.length));
  }
  return result;
}
console.log(generateRandomString())

//STRING GENERATOR FUNCTION----------------------------------

//GET URLS FOR A USER
const urlsForUser = function(userID) {
  const userUrls = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls
}


//EMAIL CHECKER/HELPER FUNCTION
const getUserByEmail = function(email, database) {
  for (let id in database) {
    const user = database[id]
    if (user.email === email) {
      return user
    }
  }    
  return null
}

// //USER LOGIN CHECKER
// const userLoginChecker = function(email, password) {
//   let userData = undefined;
//   for (let userID in users) {
//     if (users[userID].email === email) {
//       userData = users[userID];
//     }
//   }
//   const hashedPassword = bcrypt.hashSync(password, 10);
//   if (userData && bcrypt.compareSync(password, hashedPassword)) {
//     return userData;
//   } else {
//     return undefined
//   }
// }

//Object that stores user data
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


//Post route for register page
app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const id = generateRandomString();
//error handling
   if (!email || !password) {
    res.status(400);
    res.send("Please enter email and password.")
  } else if (getUserByEmail(email)){
    res.status(400);
    res.send("Email already exists. Pleases try again.")
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id,
      email,
      password: hashedPassword
    }
    //need to fix cookie setting for user id
    // const id = req.body.id
    console.log("This is id:", id);
    req.session.user_id = id
    // res.cookie("user_id", id)
    res.redirect("/urls")
  }
  console.log(users)
});


//Object that stores our urls data
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: 
  "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: 
  "userRandomID" }
};

// const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
  // };

// /u/:shortURL should redirect to the long url page
app.post('/urls', (req, res) => {
  const userID = req.session.user_id
  console.log(userID);
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID};
  console.log(urlDatabase);// Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);// Respond with 'Ok' (we will replace this)
});

app.post('/logout', (req, res) => {
  req.session = null;
  // res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  console.log(user)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect username or password, please try again.");
  }
  req.session.user_id = user.id
  // res.cookie("user_id", user.id)
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID};
  // urlDatabase[shortURL] = longURL
  res.redirect("/urls");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  if (userID) { 
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//GET request for the login page
app.get('/login', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_login", templateVars);
})

//GET request for the register page
app.get('/register', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (user != null) {
    return res.redirect("/urls")
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
    return res.redirect("/login")
  }
  const user = users[userID];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  console.log(longURL)
  if (shortURL === undefined || longURL === undefined) {
    return res.redirect("/*");
  }
  const userID = req.session["user_id"];
  const user = users[userID];
  const templateVars = {shortURL, longURL: longURL, user};
  res.render("urls_shows", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello there!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.use("/*", (req, res) => {
  res.status(404).send("Sorry page not found, please enter valid url.")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});