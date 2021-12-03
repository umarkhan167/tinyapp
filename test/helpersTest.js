const { assert } = require('chai');

const  getUserByEmail = require('../helper.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers.userRandomID;
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if a non-existent email is passed in', function() {
    const user = getUserByEmail("admin2@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  })
});
