const sockets = require('./sockets.js');

let userList = {}; // list of users

const gravityConstant = 2; // the value of gravity that will be applied

// update our entire userlist
const setUserList = (users) => {
  userList = users;
};

// update an individual user
const setUser = (user) => {
  userList[user.hash] = user;
};

// put the effects of gravity on the user
const applyGravity = (player) => {
  const user = player;
  // dont apply gravity if the user is on the ground
  if (user.y === 400) {
    return;
  }
  // update destY based on upwards velocity
  user.destY -= user.upVelocity * user.speed;

  // shrink upwards velocity
  user.upVelocity *= 0.8;
  if (user.upVelocity <= 0.1) {
    user.upVelocity = 0;
  }

  // update destY based on gravity
  user.destY += gravityConstant * user.speed;

  // lock destY onto the screen
  if (user.destY < 0) {
    user.destY = 0;
  }
  if (user.destY > 400) {
    user.destY = 400;
  }

  sockets.sendGravity(user);
};

// applies gravity to all the users in the room
const gravity = () => {
  // make sure there are users
  if (userList.length < 0) {
    return;
  }

  // get all users
  const keys = Object.keys(userList);
  for (let i = 0; i < keys.length; i++) {
    applyGravity(userList[keys[i]]);
  }
};

// apply gravity every 20ms
setInterval(() => {
  gravity();
}, 20);

module.exports.setUserList = setUserList;
module.exports.setUser = setUser;
