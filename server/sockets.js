const xxh = require('xxhashjs');
// custom class for the player
const Player = require('./Messages/Player.js');
// custom class for messages
const Message = require('./Messages/Message.js');
// custom class for the score pickups
const PickUp = require('./Messages/PickUp.js');
// child process to hold physics
const child = require('child_process');

// object of user users
const users = {};

// object of score pickups
const pickups = {};

// our socketio instance
let io;

const newPickUp = (num) => {
  pickups[num] = new PickUp(num);
};

// start child process
const physics = child.fork('./server/physics.js');

// when we get a message from physics, process it
physics.on('message', (m) => {
  // since we are using a custom message object with a type
  // we know we can check the type field to see what type of
  // message we are receiving
  switch (m.type) {
    // if the message type is 'collisionUpdate'
    case 'collisionUpdate': {
      // update our users object
      users[m.data.hash] = m.data;

      // send the new data
      io.sockets.in('room1').emit('updatedMovement', users[m.data.hash]);
      break;
    }
    case 'pointScored': {
      // update our users object
      users[m.data.player.hash] = m.data.player;

      // get new score object
      newPickUp(m.data.pickup.num);

      // send physics the pickups list
      physics.send(new Message('pickupList', pickups));

      // send the new data
      io.sockets.in('room1').emit('pointScored', users[m.data.player.hash]);
      io.sockets.in('room1').emit('pickUpRefill', pickups);
      break;
    }
    // assume we do not recongize the message type
    default: {
      console.log('Received unclear type from physics');
    }
  }
});

// when we receive an error from our physics process
physics.on('error', (error) => {
  console.dir(error);
});

// when our physics process closes
physics.on('close', (code, signal) => {
  console.log(`Child closed with ${code} ${signal}`);
});

// when our physics process exits
physics.on('exit', (code, signal) => {
  console.log(`Child exited with ${code} ${signal}`);
});

// send the character list to physics
physics.send(new Message('userList', users));

// function to setup our socket server
const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;

  // fill pickups list
  for (let i = 0; i < 3; i++) {
    newPickUp(i);
  }

  // send physics the pickups list
  physics.send(new Message('pickupList', pickups));

  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1'); // join user to our socket room

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xDadBadAF).toString(16);

    // create a new user and store it by its unique id
    users[hash] = new Player(hash);

    // add the id to the user's socket object for quick reference
    socket.hash = hash;


    // emit a refill event to the user and send them the pickups
    socket.emit('pickUpRefill', pickups);

    // let the player set a name
    socket.on('nameChange', (data) => {
      // set player name
      users[socket.hash].name = data.name;
      users[socket.hash].lastUpdate = new Date().getTime();

      // emit a joined event to the user and send them their user
      socket.emit('joined', users[socket.hash]);
    });

    // user has moved
    socket.on('movementUpdate', (data) => {
      // update the user's info
      users[socket.hash] = data;
      users[socket.hash].lastUpdate = new Date().getTime();

      // update physics simulation
      physics.send(new Message('userList', users));

      // tell everyone someone has moved
      io.sockets.in('room1').emit('updatedMovement', users[socket.hash]);
    });


    // when the user disconnects
    socket.on('disconnect', () => {
      // let everyone know this user left
      io.sockets.in('room1').emit('left', users[socket.hash]);
      // remove this user from our object
      delete users[socket.hash];
      // update the user list in our physics calculations
      physics.send(new Message('userList', users));

      // remove this user from the socket room
      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
