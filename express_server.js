const express = require("express");
const app = express();
const PORT = 3050; // default port 3050
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

/*
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL:"card-title" };
  res.render("urls_show", templateVars);
});*/

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// /U/:SHORTURL => access the actual link (longURL)
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const dateVisit = new Date();
  if (!urlDatabase[shortURL]) {
    let templateVars = {
      status: 404,
      message: 'This TinyURL does not exist',
      user: users[req.session.user_id]
    }
    res.status(404);
    res.render("urls_error", templateVars);
  } else if (!req.session.user_id) { 
    req.session.user_id = generateRandomString();
    urlDatabase[shortURL].visitHistory.push([dateVisit,req.session.user_id]);
    urlDatabase[shortURL].visitCount++;
    urlDatabase[shortURL].visitorIDList.push(req.session.user_id);
    urlDatabase[shortURL].uVisitCount++;
  } else {
    const visitorId = urlDatabase[shortURL].visitorIDList;
    urlDatabase[shortURL].visitHistory.push([dateVisit,req.session.user_id]);
    urlDatabase[shortURL].visitCount++;
    if (!visitorId.includes(req.session.user_id)) {
      visitorId.push(req.session.user_id);
      urlDatabase[shortURL].uVisitCount++;
    }
  }
  if (longURL.startsWith("http://")) {
    res.redirect(longURL);
  } else {
    res.redirect(`http://${longURL}`);
  }
});

/*
app.get("/set", (req, res) => {
    const a = 1;
    res.send(`a = ${a}`);
});
   
   app.get("/fetch", (req, res) => {
    res.send(`a = ${a}`);
});*/


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});