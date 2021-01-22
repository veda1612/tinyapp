const express = require("express");
const app = express();
const PORT = 3050; // default port 3050
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
//onst { getUserByEmail, generateRandomString, generateRandomUserId, lookupEmail, urlsForUser, addUser, addURL} = require("./helperFuncs");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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
  }
}






// Function to lookup for existing email
function lookupEmail (email) {
  for (let key in users) {
    if (email === users[key].email){
      return users[key];
    }
  }
  return false;
}
// Function to generate random string - a shortURL from longURL
function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,5);
}

// Function to generate random string - a shortURL from longURL
function generateRandomUserId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

// Function to filter URLS as per logged in user
function urlsForUser(id) {
  let filteredUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredUrls[url] = urlDatabase[url]
    }
  }
  return filteredUrls;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});
/* initial for urldatabase
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});*/
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// URLS-POST
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you are trying to access does not correspond with a long URL at this time.");
  }
});
// URLS-POST
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to a valid account to create short URLs.");
  }
});

//URLS/:SHORTURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL:"card-title" };
  res.render("urls_show", templateVars);  
  });
// /URLS/:SHORTURL/DELETE
app.post("/urls/:shortURL/delete", (req,res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase); 
  if (userId && userId in users) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to delete this short URL.");
  }
}); 
// LOGIN
app.get("/login", (req, res) => {
  let templateVars = { email: req.body.login, password: req.body.password };
  res.render("urls_login", templateVars);  
});
//POST/LOGIN-RECTORED
app.post("/login", (req, res) => {
  const enteredEmail = req.body.login
  const enteredPassword =  req.body.password
  let existingUser;
  for (let userId in users) {
    let user = users[userId];
      if (user.email === enteredEmail) {
        existingUser = user;
      }
  }
  if (existingUser  === undefined) {
    res.status(400).send('User doesnt exist in database, Register now');
  // } else if (existingUser .password !== enteredPswd) {
  } else if (!bcrypt.compareSync(enteredPassword, existingUser.password)) {
    res.status(400).send('Incorrect Password, try again!');          
    }
    else {
      req.session.user_id = existingUser .id;  
      res.redirect('/urls');
    }

});

//GET/REGISTER
app.get("/register", (req, res) => {
  let templateVars = {};
  res.render("urls_register", templateVars);  
});
//POST/REGISTER
app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email or password is empty");
  }
  else if (lookupEmail(req.body.email)){
    res.status(400).send("Email is already registered. Try another.");
  }
  else {
    let id = generateRandomUserId();
    let email = req.body.email;
    let password = req.body.password;
    //let password = bcrypt.hashSync(req.body.password, 10);  
      users[id] = { 
          id: id, 
          email: email, 
          password: password
        }
  //res.cookie("user_id", id);
  req.session.user_id = id;
  res.redirect("/urls");
  }

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
/*bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false
*/