//HELPER FUNCTION
const getUserByEmail = function(email, database) {
  for (let id in database) {
    const user = database[id]
    if (user.email === email) {
      return user
    }
  }    
  return null
}

//GET URLS FOR A USER FUNCTION
const urlsForUser = function(userID, database) {
  const userUrls = {};
  for (let url in database) {
    if (userID === database[url].userID) {
      userUrls[url] = database[url];
    }
  }
  return userUrls;
}

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

module.exports = {getUserByEmail, generateRandomString, urlsForUser}