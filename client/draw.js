const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
const redraw = (time) => {
  //update positions
  updatePosition();
    
    //clear screen
  ctx.clearRect(0, 0, 700, 500);

  const keys = Object.keys(circles);

  for(let i = 0; i < keys.length; i++) {
    const circle = circles[keys[i]];

    if(circle.alpha < 1) circle.alpha += 0.05;

    //lerp
    circle.x = lerp(circle.prevX, circle.destX, circle.alpha);
    circle.y = lerp(circle.prevY, circle.destY, circle.alpha);

    //draw
    //make our circle draw black to be distinguished
    if(circle.hash === hash) {
      ctx.fillStyle = "black";
    }
    else {
      ctx.fillStyle = circle.color;
    }
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius,0,2*Math.PI);
    ctx.fill();
    ctx.closePath();
  }
  
  animationFrame = requestAnimationFrame(redraw);
};