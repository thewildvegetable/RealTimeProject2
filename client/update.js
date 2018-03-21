//update a player
const update = (data) => {
  //if we dont have this player, add them
  if(!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  //dont update ourself on the x axis
  if(data.hash === hash) {
      //ignore old messages
      if(squares[data.hash].lastUpdate >= data.lastUpdate) {
        return;
      }
      const square = squares[data.hash];

      //update y info
      square.prevY = data.prevY;
      square.destY = data.destY;
      square.upVelocity = data.upVelocity;
      square.alpha = 0.05;
    return;
  }

  //ignore old messages
  if(squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  //take the player
  const square = squares[data.hash];
  
  //update x y info
  square.prevX = data.prevX;
  square.prevY = data.prevY;
  square.destX = data.destX;
  square.destY = data.destY;
  square.moveLeft = data.moveLeft;
  square.moveRight = data.moveRight;
  square.upVelocity = data.upVelocity;
  square.alpha = 0.05;
};

//remove disconnected users
const removeUser = (data) => {
  if(squares[data.hash]) {
    delete squares[data.hash];
  }
};

//update our data
const setUser = (data) => {
  //store our hash data and square
    hash = data.hash;
  squares[hash] = data;
    
    //start to draw
  requestAnimationFrame(redraw);
};

//update our position
const updatePosition = () => {
  const square = squares[hash];

  //store new previous position
  square.prevX = square.x;
  square.prevY = square.y;

    //move
  if(square.moveLeft && square.destX > 0) {
    square.destX -= 2;
  }
  if(square.moveRight && square.destX < 600) {
    square.destX += 2;
  }

  //reset alpha
  square.alpha = 0.05;

  //send updated movement to server
  socket.emit('movementUpdate', square);
};