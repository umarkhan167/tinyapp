const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
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

//EMAIL CHECKER
const emailChecker = function(email) {
  for (let userID in users) {
    console.log(userID)
    if (users[userID].email === email) {
      return true
    }
  }    
  return false
  //need to fix the emailChecker so it does not allow registrations for emails that are already in users object database.
}

//USER LOGIN CHECKER
const userLoginChecker = function(email, password) {
  let userData = undefined;
  for (let userID in users) {
    if (users[userID].email === email) {
      userData = users[userID];
    }
  }
  if (userData && userData["password"] === password) {
    return userData;
  } else {
    return undefined
  }
}

//Object that stores user data
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "1@1.com", 
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
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
  } else if (emailChecker(email)){
    res.status(400);
    res.send("Email already exists. Pleases try again.")
  } else {
    users[id] = {
      id,
      email,
      password
    }
    //need to fix cookie setting for user id
    // const id = req.body.id
    console.log("This is id:", id);
    res.cookie("user_id", id)
    res.redirect("/urls")
  }
  console.log(users)
});


//Object that stores our urls data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  };

// /u/:shortURL should redirect to the long url page
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);// Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);// Respond with 'Ok' (we will replace this)
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userLoginChecker(email, password);
  if (!user) return res.status(403);
  res.cookie("user_id", user.id)
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL
  res.redirect("/urls");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//GET request for the login page
app.get('/login', (req, res) => {
  res.render("urls_login");
})

//GET request for the register page
app.get('/register', (req, res) => {
  res.render("urls_register");
})

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(longURL)
  if (shortURL === undefined || longURL === undefined) {
    return res.redirect("/*");
  }
  const userID = req.cookies["user_id"];
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