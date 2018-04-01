//update a player
const update = (data) => {
  //if we dont have this player, add them
  if(!circles[data.hash]) {
    circles[data.hash] = data;
    return;
  }

  //dont update ourself on the x axis
  if(data.hash === hash) {
      //ignore old messages
      if(circles[data.hash].lastUpdate >= data.lastUpdate) {
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
  if(circles[data.hash].lastUpdate >= data.lastUpdate) {
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
const removeUser = (data) => {
  if(circles[data.hash]) {
    delete circles[data.hash];
  }
};

//update our data
const setUser = (data) => {
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
    if (Math.abs(circle.vertVelocity) <= .01){
        circle.vertVelocity = 0;
    }
    if (Math.abs(circle.horizVelocity) <= .01){
        circle.horizVelocity = 0;
    }
    

  //increment velocity
  if(circle.moveLeft) {
    circle.horizVelocity -= 2;
  }
  if(circle.moveRight) {
    circle.horizVelocity += 2;
  }
  if(circle.moveUp) {
    circle.vertVelocity -= 2;
  }
  if(circle.moveDown) {
    circle.vertVelocity += 2;
  }
    
    //cap velocity
    if (circle.vertVelocity >= 6){
        circle.vertVelocity = 6;
    }
    else if (circle.vertVelocity <= -6){
        circle.vertVelocity = -6;
    }
    if (circle.horizVelocity >= 6){
        circle.horizVelocity = 6;
    }
    else if (circle.horizVelocity <= -6){
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

//loop through the scores and sort them largest to smallest
const sortScores = (scoreArray) =>{
    let largest = 0;            //position of the largest score
    let temp = scoreArray[0];       //temp variable for position swapping
    
    for (let i = 0; i < scoreArray.length - 1; i++){
        //set the largest for this iteration
        largest = i;
        //loop through the rest of the array, comparing size
        for (let j = i+1; j< scoreArray.length; j++){
            if (scoreArray[largest].score < scoreArray[j].score){
                largest = j;
            }
        }
        //swap i and largest
        if (largest != i){
            temp = scoreArray[i];   //store current number in temp
            scoreArray[i] = scoreArray[largest];    //move largest to pos i
            scoreArray[largest] = temp;     //move i to largest's old position
        }
    }
    
    return scoreArray;
}

//update the scoreboard under the canvas
const updateScores = () => {
    //empty the scoreboard
    scoreHolder.innerHTML = "";
    
    //create scoreArray
    let scoreArray = [];
    
    //fill the array
    let keys = Object.keys(scores);
    for (let i = 0; i < keys.length; i++){
        scoreArray.push(scores[keys[i]]);
    }
    
    //sort the scores
    scoreArray = sortScores(scoreArray);
    console.dir(scoreArray);
            
    //loop through the users and place the scoreboard in       
    for(let i = 0; i < scoreArray.length; i++){
        let player = scoreArray[i];
                
        //create the html element for this player's score
        let p1 = document.createElement("p");
        p1.textContent = player.name + ": " + player.score + " points";
        
        scoreHolder.appendChild(p1);
    }
};