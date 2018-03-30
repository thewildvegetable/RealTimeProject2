// pickup class
class PickUp {
  constructor(num) {
    this.num = num;
    this.lastUpdate = new Date().getTime();
    this.x = Math.floor((Math.random() * 600) + 1); // x location on screen
    this.y = Math.floor((Math.random() * 400) + 1); // y location on screen
    this.height = 50;
    this.width = 50;
    this.color = `rgb(${15},${186},${3})`;
  }
}

module.exports = PickUp;
