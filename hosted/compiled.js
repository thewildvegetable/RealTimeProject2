const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
const redraw = time => {
  //update positions
  updatePosition();

  ctx.clearRect(0, 0, 700, 500);

  const keys = Object.keys(squares);

  for (let i = 0; i < keys.length; i++) {
    const square = squares[keys[i]];

    if (square.alpha < 1) square.alpha += 0.05;

    //filter other characters so we can tell which multicolored square is ours
    if (square.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

    //lerp
    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    //draw
    //make our square draw black to be distinguished
    if (square.hash === hash) {
      ctx.fillStyle = "black";
    } else {
      ctx.fillStyle = square.color;
    }
    ctx.fillRect(square.x, square.y, square.width, square.height);
  }

  animationFrame = requestAnimationFrame(redraw);
};
let canvas;
let ctx;
let socket;
let hash;
let animationFrame;

let squares = {}; //list of users

//handle for key down events
//code taken from the inclass physics example and edited to remove updown movement
const keyDownHandler = e => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.moveRight = true;
    }
};

//handler for key up events
//code taken from the inclass physics example and edited to remove updown movement
const keyUpHandler = e => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.moveRight = false;
    }
    //Space key was lifted
    //only jump if upVelocity is 0
    else if (keyPressed === 32 && square.upVelocity === 0) {
        square.upVelocity = 10;
      }
};

const init = () => {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser);
  socket.on('updatedMovement', update);
  socket.on('left', removeUser);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
//update a player
const update = data => {
  //if we dont have this player, add them
  if (!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  //dont update ourself on the x axis
  if (data.hash === hash) {
    //ignore old messages
    if (squares[data.hash].lastUpdate >= data.lastUpdate) {
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
  if (squares[data.hash].lastUpdate >= data.lastUpdate) {
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
const removeUser = data => {
  if (squares[data.hash]) {
    delete squares[data.hash];
  }
};

//update our data
const setUser = data => {
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
  if (square.moveLeft && square.destX > 0) {
    square.destX -= 2;
  }
  if (square.moveRight && square.destX < 600) {
    square.destX += 2;
  }

  //reset alpha
  square.alpha = 0.05;

  //send updated movement to server
  socket.emit('movementUpdate', square);
};
