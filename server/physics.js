// custom class for messages
const Message = require('./Messages/Message.js');

// vector class
const Victor = require('victor');

let userList = {}; // list of users
let pickupList = {}; //list of pickups

// circle to circle collision
const circleCollision = (circ1, circ2) => {
  if ((((circ1.x - circ2.x) ** 2) + ((circ1.y - circ2.y) ** 2))
        <= ((circ1.radius + circ2.radius) ** 2)) {
    return true;
  }
  return false;
};

const circleSquareCollision = (circle, square) => {
    if(false){
        return true;
    }
    return false;
}

const copyVelocity = (circ) => {
  const circle = circ;
  circle.vertVelocity = circle.serverVelocity.y;
  circle.horizVelocity = circle.serverVelocity.x;
};

// put elastic collision on the user
const applyCollision = (circle1, circle2) => {
  const user1 = circle1;
  const user2 = circle2;

  user1.serverVelocity = new Victor(user1.horizVelocity, user1.vertVelocity);
  user2.serverVelocity = new Victor(user2.horizVelocity, user2.vertVelocity);

  // turn off the 2 circles movements
  user1.moveLeft = false;
  user1.moveRight = false;
  user1.moveUp = false;
  user1.moveDown = false;
  user2.moveLeft = false;
  user2.moveRight = false;
  user2.moveUp = false;
  user2.moveDown = false;

  // collision code adapted from
  // https://stackoverflow.com/questions/345838/ball-to-ball-collision-detection-and-handling
  // START OF ADAPTED CODE
  // store the needed circle properties as vectors
  const user1Pos = new Victor(user1.x, user1.y);
  const user2Pos = new Victor(user2.x, user2.y);
  const user1InitVelocity = user1.serverVelocity.clone();

  // get the delta between the circles
  const delta = user1Pos.clone().subtract(user2Pos);
  const deltaLength = delta.length();
  // get the minimum translation distance
  const bothRadius = user1.radius + user2.radius; // done to avoid mixed operators
  const mtdMultiplier = (bothRadius - deltaLength) / deltaLength;
  const mtd = delta.multiply(new Victor(mtdMultiplier, mtdMultiplier));

  // push-pull the circles apart. assume mass is 1
  mtd.multiply(new Victor(0.5, 0.5));
  user1Pos.add(mtd);
  user2Pos.subtract(mtd);

  // impact speed
  const impactVelocity = user1InitVelocity.subtract(user2.serverVelocity);
  const normalImpactVelocity = impactVelocity.normalize();

  // if circles are intersecting but moving away from each other already, exit
  if (normalImpactVelocity > 0) return;

  // calculate impulse. assume restitution is 0 for perfectly elastic collision
  let impulse = normalImpactVelocity.invert();
  impulse = mtd.multiply(impulse);

  // change the momentum
  user1.serverVelocity.add(impulse);
  user2.serverVelocity.subtract(impulse);

  // END OF ADAPTED CODE

  // move both circles to reflect the collision
  user1.x = user1Pos.x;
  user1.y = user1Pos.y;
  user2.x = user2Pos.x;
  user2.y = user2Pos.y;
  // reset destX and destY to current position
  user1.destX = user1.x;
  user1.destY = user1.y;
  user2.destX = user2.x;
  user2.destY = user2.y;

  // update destination position
  user1.destX += user1.serverVelocity.x * user1.speed;
  user1.destY += user1.serverVelocity.y * user1.speed;
  user2.destX += user2.serverVelocity.x * user2.speed;
  user2.destY += user2.serverVelocity.y * user2.speed;

  // update clientside velocities
  copyVelocity(user1);
  copyVelocity(user2);

  // update userList
  userList[user1.hash] = user1;
  userList[user2.hash] = user2;

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
    
  //check player to pickup collisions
    for (let i = 0; i < pickupList.length; i++){
        for (let j = 0; j < keys.length; j++){
            if (circleSquareCollision(userList[keys[j]], pickupList[i])){
                let user = userList[keys[j]];
                
                //increment the players score
                user.score++;
                
                //send message to sockets with the updated player and the collided pickup
                process.send(new Message('pointScored', {"player": user, "pickup": pickupList[i]}));
                
                //exit this for loop
                break;
            }
        }
    }

  // dont check collisions if only 1 user
  if (keys.length === 1) {
    return;
  }

  // check collisions between players
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
    case 'pickupList': {
        //update the pickup list with the data provided
        pickupList = messageObject.data;
    }
    // otherwise default
    default: {
      console.log('Type not recognized');
    }
  }
});
