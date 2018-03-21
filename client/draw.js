const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
const redraw = (time) => {
  //update positions
  updatePosition();

  ctx.clearRect(0, 0, 700, 500);

  const keys = Object.keys(squares);

  for(let i = 0; i < keys.length; i++) {
    const square = squares[keys[i]];

    if(square.alpha < 1) square.alpha += 0.05;

    //filter other characters so we can tell which multicolored square is ours
    if(square.hash === hash) {
      ctx.filter = "none"
    }
    else {
      ctx.filter = "hue-rotate(40deg)";
    }

    //lerp
    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    //draw
    //make our square draw black to be distinguished
    if(square.hash === hash) {
      ctx.fillStyle = "black";
    }
    else {
      ctx.fillStyle = square.color;
    }
    ctx.fillRect(square.x, square.y, square.width, square.height);
  }
  
  animationFrame = requestAnimationFrame(redraw);
};