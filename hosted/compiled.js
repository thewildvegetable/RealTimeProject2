const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
const redraw = time => {
  //update positions
  updatePosition();

  //clear screen
  ctx.clearRect(0, 0, 700, 500);

  const keys = Object.keys(circles);

  for (let i = 0; i < keys.length; i++) {
    const circle = circles[keys[i]];

    if (circle.alpha < 1) circle.alpha += 0.05;

    //lerp
    circle.x = lerp(circle.prevX, circle.destX, circle.alpha);
    circle.y = lerp(circle.prevY, circle.destY, circle.alpha);

    //draw
    //make our circle draw black to be distinguished
    if (circle.hash === hash) {
      ctx.fillStyle = "black";
    } else {
      ctx.fillStyle = circle.color;
    }
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  animationFrame = requestAnimationFrame(redraw);
};
let canvas;
let ctx;
let socket;
let hash;
let animationFrame;

let circles = {}; //list of users

//handle for key down events
//code taken from the inclass physics example
const keyDownHandler = e => {
  var keyPressed = e.which;
  const circle = circles[hash];

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    circle.moveUp = true;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      circle.moveLeft = true;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        circle.moveDown = true;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          circle.moveRight = true;
        }
};

//handler for key up events
//code taken from the inclass physics example
const keyUpHandler = e => {
  var keyPressed = e.which;
  const circle = circles[hash];

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    circle.moveUp = false;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      circle.moveLeft = false;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        circle.moveDown = false;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          circle.moveRight = false;
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
  if (!circles[data.hash]) {
    circles[data.hash] = data;
    return;
  }

  //dont update ourself on the x axis
  if (data.hash === hash) {
    //ignore old messages
    if (circles[data.hash].lastUpdate >= data.lastUpdate) {
      return;
    }
    const circle = circles[data.hash];

    //update y info
    circle.prevY = data.prevY;
    circle.destY = data.destY;
    circle.vertVelocity = data.vertVelocity;
    circle.horizVelocity = data.horizVelocity;
    circle.alpha = 0.05;
    return;
  }

  //ignore old messages
  if (circles[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  //take the player
  const circle = circles[data.hash];

  //update x y info
  circle.prevX = data.prevX;
  circle.prevY = data.prevY;
  circle.destX = data.destX;
  circle.destY = data.destY;
  circle.vertVelocity = data.vertVelocity;
  circle.horizVelocity = data.horizVelocity;
  circle.alpha = 0.05;
};

//remove disconnected users
const removeUser = data => {
  if (circles[data.hash]) {
    delete circles[data.hash];
  }
};

//update our data
const setUser = data => {
  //store our hash data and circle
  hash = data.hash;
  circles[hash] = data;

  //start to draw
  requestAnimationFrame(redraw);
};

//update our position
const updatePosition = () => {
  const circle = circles[hash];

  //store new previous position
  circle.prevX = circle.x;
  circle.prevY = circle.y;

  //shrink velocities
  circle.vertVelocity *= .8;
  circle.horizVelocity *= .8;

  //set velocity to 0 if small enough
  if (Math.abs(circle.vertVelocity) <= .01) {
    circle.vertVelocity = 0;
  }
  if (Math.abs(circle.horizVelocity) <= .01) {
    circle.horizVelocity = 0;
  }

  //increment velocity
  if (circle.moveLeft) {
    circle.horizVelocity -= 2;
  }
  if (circle.moveRight) {
    circle.horizVelocity += 2;
  }
  if (circle.moveUp) {
    circle.vertVelocity -= 2;
  }
  if (circle.moveDown) {
    circle.vertVelocity += 2;
  }

  //cap velocity
  if (circle.vertVelocity >= 6) {
    circle.vertVelocity = 6;
  } else if (circle.vertVelocity <= -6) {
    circle.vertVelocity = -6;
  }
  if (circle.horizVelocity >= 6) {
    circle.horizVelocity = 6;
  } else if (circle.horizVelocity <= -6) {
    circle.horizVelocity = -6;
  }

  //move
  circle.destX += circle.horizVelocity * circle.speed;
  circle.destY += circle.vertVelocity * circle.speed;

  //if destination is against the walls, stop additional movement in that direction
  if (circle.destY < 0) {
    circle.moveUp = false;
  }
  if (circle.destY > 500) {
    circle.moveDown = false;
  }
  if (circle.destX < 0) {
    circle.moveLeft = false;
  }
  if (circle.destX > 700) {
    circle.moveRight = false;
  }
  //if against the walls, bounce
  if (circle.y <= 0) {
    console.dir(circle);
    //reset destination and previous
    circle.destY = 0;
    circle.prevY = 0;
    //inverse velocity
    circle.vertVelocity *= -1;
    //move again
    circle.alpha = .5;
    circle.destY += 30 * circle.speed;
    circle.y = lerp(circle.prevY, circle.destY, circle.alpha);
  }
  if (circle.y >= 500) {
    console.dir("up" + circle);
    //reset destination and previous
    circle.destY = 500;
    circle.prevY = 500;
    //inverse velocity
    circle.vertVelocity *= -1;
    //move again
    circle.alpha = 0.5;
    circle.destY -= 30 * circle.speed;
    circle.y = lerp(circle.prevY, circle.destY, circle.alpha);
  }
  if (circle.x <= 0) {
    //reset destination and previous
    circle.destX = 0;
    circle.prevX = 0;
    //inverse velocity
    circle.horizVelocity *= -1;
    //move again
    circle.alpha = 0.5;
    circle.destX += 30 * circle.speed;
    circle.x = lerp(circle.prevX, circle.destX, circle.alpha);
  }
  if (circle.x >= 700) {
    //reset destination and previous
    circle.destX = 700;
    circle.prevX = 700;
    //inverse velocity
    circle.horizVelocity *= -1;
    //move again
    circle.alpha = 0.5;
    circle.destX -= 30 * circle.speed;
    circle.x = lerp(circle.prevX, circle.destX, circle.alpha);
  }

  //reset alpha
  circle.alpha = 0.05;

  //send updated movement to server
  socket.emit('movementUpdate', circle);
};
