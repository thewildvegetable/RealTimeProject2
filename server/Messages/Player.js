// vector class
const Victor = require('victor');

// Character class
class Player {
  constructor(hash) {
    this.hash = hash;
    this.lastUpdate = new Date().getTime();
    this.x = Math.floor((Math.random() * 600) + 1); // x location on screen
    this.y = Math.floor((Math.random() * 400) + 1); // y location on screen
    this.prevX = this.x; // last known x location
    this.prevY = this.y; // last known y location
    this.destX = this.x; // destination x location
    this.destY = this.y; // destination y location
    this.vertVelocity = 0; // velocity o nthe y axis
    this.horizVelocity = 0; // velocity on the x axis
    this.serverVelocity = new Victor(0, 0); // victor used for server side vector calculations
    this.speed = 3; // max speed
    this.radius = 20;
    this.alpha = 0; // lerp amount (from prev to dest, 0 to 1)
      this.score = 0;   //player's score
    this.color = `rgb(${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)})`;
    // kept left and right for movement code to avoid setting local variables
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
  }
}

module.exports = Player;
