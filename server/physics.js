// custom class for messages
const Message = require('./Messages/Message.js');

let userList = {}; // list of users

// circle to circle collision
const circleCollision = (circ1, circ2) => {
  if ((((circ1.x - circ2.x) ** 2) + ((circ1.y - circ2.y) ** 2))
        <= ((circ1.radius + circ2.radius) ** 2)) {
    return true;
  }
  return false;
};

// put elastic collision on the user
const applyCollision = (circle1, circle2) => {
  const user1 = circle1;
  const user2 = circle2;
    
  //turn off the 2 circles movements
    user1.moveLeft = false;
    user1.moveRight = false;
    user1.moveUp = false;
    user1.moveDown = false;
    user2.moveLeft = false;
    user2.moveRight = false;
    user2.moveUp = false;
    user2.moveDown = false;

  console.log(`collision between ${user1} and ${user2}`);

  // lock destY and destX onto the screen
  if (user1.destY < 0) {
    user1.destY = 0;
  }
  if (user1.destY > 500) {
    user1.destY = 500;
  }
  if (user1.destX < 0) {
    user1.destX = 0;
  }
  if (user1.destX > 700) {
    user1.destX = 700;
  }
  if (user2.destY < 0) {
    user2.destY = 0;
  }
  if (user2.destY > 500) {
    user2.destY = 500;
  }
  if (user2.destX < 0) {
    user2.destX = 0;
  }
  if (user2.destX > 700) {
    user2.destX = 700;
  }

  // send the players over to sockets
  process.send(new Message('collisionUpdate', user1));
  process.send(new Message('collisionUpdate', user2));
};

// check if anyone is colliding with anything
const checkCollisions = () => {
  // make sure there are users
  if (userList.length < 0) {
    return;
  }

  // get all users
  const keys = Object.keys(userList);

  // dont check collisions if only 1 user
  if (keys.length === 1) {
    return;
  }
    
    //check collisions between players
  for (let i = 0; i < keys.length - 1; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      if (circleCollision(userList[keys[i]], userList[keys[j]])) {
        // apply collision effects
        applyCollision(userList[keys[i]], userList[keys[j]]);

        // just go to the next circle
        i++;
        j = keys.length;
      }
    }
  }
};

// move users every 20ms
setInterval(() => {
  checkCollisions();
}, 20);

// update based on message
process.on('message', (messageObject) => {
  // check our custom message object for the type
  switch (messageObject.type) {
    // if message type is charList
    case 'userList': {
      // update our character list with the data provided
      userList = messageObject.data;
      break;
    }
    // if message type is char
    case 'user': {
      // update a specific character with the character provided
      const user = messageObject.data;
      userList[user.hash] = user;
      break;
    }
    // otherwise default
    default: {
      console.log('Type not recognized');
    }
  }
});
