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

//OLD EMAIL CHECKER
const emailChecker = function() {
  //if user, return user
  //else return false
  for (let user in users) {
    if (user.email) {
      return user
    }
  }    
  return false
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

//OLD POST ROUTE
app.post('/register', (req, res) => {
  const {email, password} = req.body
  users.user = {
    id: generateRandomString(),
    email,
    password
  }
  //error handling
  if (!email || !password) {
    res.render("Please enter email and password.")
  } else if (emailChecker()){
    res.render("Email already exists. Pleases try again.")
  } else {
    // const user_id = req.body.id
    // res.cookie("User ID", user_id)
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
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
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



app.get('/register', (req, res) => {
  res.render("urls_register");
})

app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase, username};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(longURL)
  if (shortURL === undefined || longURL === undefined) {
    return res.redirect("/*");
  }
  const username = req.cookies["username"];
  const templateVars = {shortURL, longURL: longURL, username};
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