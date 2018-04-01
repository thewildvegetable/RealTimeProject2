let canvas;
let ctx;
let socket; 
let hash;
let animationFrame;

let gameDiv;        //div containing the game
let setUpDiv;       //div containing the setup section
let scoreHolder;    //location of the scoreboard
let startButton;    //click to start the game

let circles = {}; //list of users
let pickups = {}; //list of pickups
let scores = {};  //list of users who scored a point

//handle for key down events
//code taken from the inclass physics example
const keyDownHandler = (e) => {
  var keyPressed = e.which;
  const circle = circles[hash];

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    circle.moveUp = true;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    circle.moveLeft = true;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    circle.moveDown = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    circle.moveRight = true;
  }
};

//handler for key up events
//code taken from the inclass physics example
const keyUpHandler = (e) => {
  var keyPressed = e.which;
  const circle = circles[hash];

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    circle.moveUp = false;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    circle.moveLeft = false;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    circle.moveDown = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    circle.moveRight = false;
  }
};

//join the game room
const connect = () => {
    let name = document.querySelector("#username").value;
            
    if(!name) {
        name = 'unknown';
    }
    
    //connect
    socket = io.connect();

    //send join message
    socket.emit('nameChange', { "name": name });
    
    //set up listeners
    socket.on('joined', setUser);
    socket.on('updatedMovement', update);
    socket.on('left', removeUser);
    socket.on('pickUpRefill', (data) =>{
        pickups = data;
    });
    socket.on('pointScored', (data) => {
        //change to an update scoreboard method in update
        circles[data.hash].score = data.score;
        circles[data.hash].radius = data.radius;
        scores[data.hash] = data;
        updateScores();
    });
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
            
    //hide the difficulty selection screen
    setUpDiv.style.display = "none";
            
    //show the game
    gameDiv.style.display = "inline";
};

const init = () => {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');
    
  //get the containers
  gameDiv = document.querySelector('#game');
  setUpDiv = document.querySelector('#setUp');
  scoreHolder = document.querySelector('#score');

  //get the button
  startButton = document.querySelector('#startButton');

  //set up button event
  startButton.onclick = connect;
};

window.onload = init;