const sockets = require('./sockets.js');

let userList = {}; // list of users

// update our entire userlist
const setUserList = (users) => {
  userList = users;
};

// update an individual user
const setUser = (user) => {
  userList[user.hash] = user;
};

// put the effects of gravity on the user
const applyMovement = (player) => {
  const user = player;

  // update destY and destX based on velocity
  user.destY += user.vertVelocity * user.speed;
    user.destX += user.horizVelocity * user.speed;

  // shrink velocities
  user.vertVelocity *= 0.8;
    user.horizVelocity *= 0.8;
  if (user.vertVelocity <= 0.1) {
    user.vertVelocity = 0;
  }
  if (user.horizVelocity <= 0.1) {
    user.horizVelocity = 0;
  }

  // lock destY and destX onto the screen
  if (user.destY < 0) {
    user.destY = 0;
  }
  if (user.destY > 400) {
    user.destY = 400;
  }
  if (user.destX < 0) {
    user.destX = 0;
  }
  if (user.destX > 600) {
    user.destX = 600;
  }

  sockets.sendMovement(user);
};

// moves all the users in the room
const move = () => {
  // make sure there are users
  if (userList.length < 0) {
    return;
  }

  // get all users
  const keys = Object.keys(userList);
  for (let i = 0; i < keys.length; i++) {
    applyMovement(userList[keys[i]]);
  }
};

// move users every 20ms
setInterval(() => {
  move();
}, 20);

module.exports.setUserList = setUserList;
module.exports.setUser = setUser;
