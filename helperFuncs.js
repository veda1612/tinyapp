const bcrypt = require('bcrypt');

// Function to generate random string - a shortURL from longURL
function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,5);
}

// Function to generate random string - a shortURL from longURL
function generateRandomUserId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

// Return the user object which match the email address
const getUserByEmail = (email, database) => {
  return Object.values(database).find(user => user.email === email);
};

// Return an object of URLs with same userID as the user
const urlsForUser = (id, db) => {
  let filtered = {};
  for (let urlID of Object.keys(db)) {
    if (db[urlID].userID === id) {
      filtered[urlID] = db[urlID];
    }
  }
  return filtered;
};

// Add a user to the users database
const addUser = (email, password, db) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  db[id] = {
    id,
    email,
    password: hashedPassword
  };
  return id;
};

// Add a URL to the urls database
const addURL = (longURL, userID, db) => {
  const dateCreation = new Date();
  const visitCount = 0;
  const visitHistory = [];
  const uVisitCount = 0;
  const visitorIDList = [];
  const shortURL = generateRandomString();
  db[shortURL] = { userID, longURL, dateCreation, visitCount, visitHistory, visitorIDList, uVisitCount };
  return shortURL;
};
// Function to lookup for existing email
function lookupEmail (email) {
  for (let key in users) {
    if (email === users[key].email){
      return users[key];
    }
  }
  return false;
}

module.exports = { getUserByEmail, generateRandomString, generateRandomUserId, lookupEmail, urlsForUser, addUser, addURL };