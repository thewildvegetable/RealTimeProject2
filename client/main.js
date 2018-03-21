let canvas;
let ctx;
let socket; 
let hash;
let animationFrame;

let squares = {}; //list of users

//handle for key down events
//code taken from the inclass physics example and edited to remove updown movement
const keyDownHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = true;
  }
};

//handler for key up events
//code taken from the inclass physics example and edited to remove updown movement
const keyUpHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = false;
  }
  //Space key was lifted
    //only jump if upVelocity is 0
  else if(keyPressed === 32 && square.upVelocity === 0) {
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