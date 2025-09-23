// DM2008 — Activity 4b
// Objects in Motion (60 min)

let agents = []; 
const NUM_START = 30;

function setup() {
  createCanvas(600, 400);
  noStroke();
  colorMode(HSB, 360, 100, 100, 255);

  // create agents
  for (let i = 0; i < NUM_START; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(12, 1000);
    let speedX = random(-2, 2);
    let speedY = random(-2, 2);
    agents.push(new Agent(x, y, size, speedX, speedY));
  }
}

function draw() {
  background(230);

  // update & display agents
  for (let i = 0; i < agents.length; i++) {
    agents[i].update();
    agents[i].show();
  }

  // remove dead agents
  for (let i = agents.length - 1; i >= 0; i--) {
    if (agents[i].size <= 1 || agents[i].alpha <= 0) {
      agents.splice(i, 1);
    }
  }
}

function mousePressed() {
  for (let i = 0; i < NUM_START; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(12, 400);
    let speedX = random(-2, 2);
    let speedY = random(-2, 2);
  // agents.push(new Agent(mouseX, mouseY, size, speedX, speedY));
 agents.push(new Agent(mouseX, y, size, speedX, speedY));
}
}

function keyPressed() {
  if (key === "C") {
    agents = [];
  }
}

class Agent {
  constructor(x, y, size, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.dx = speedX;
    this.dy = speedY;
    this.hue = random(360);
    this.alpha = 255;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    // Bounce at edges
    this.bounce();

    // Gradually change properties
    this.hue = (this.hue + 1) % 360; // color cycle
    this.alpha -= 0.5;               // fade out
    this.size *= 0.971;              // shrink slowly
  }

  bounce() {
    if (this.x < 0 || this.x > width) this.dx *= -1;
    if (this.y < 0 || this.y > height) this.dy *= -1;
  }

  show() {
    fill(this.hue, 80, 90, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}

