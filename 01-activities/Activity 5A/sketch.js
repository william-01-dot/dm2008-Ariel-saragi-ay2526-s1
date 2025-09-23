// DM2008 – Activity 5a
// Colliding Circles (30 min)

let balls = [];

function setup() {
  createCanvas(400, 400);

  // Step 1: create two Ball objects
  balls.push(new Ball(200, 200));
  balls.push(new Ball(300, 200));
}

function draw() {
  background('#F0DB9F');

  // Step 2: update and display each ball
  for (let i = 0; i < balls.length; i++) {
    let b = balls[i];
    b.move();
    b.show();
  }

  // Step 3: check collisions between all pairs
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      balls[i].checkCollision(balls[j]);
    }
  }
}

class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 30;
    this.vel = createVector(random(-5, 12), random(-3, 6));
    this.col = color(100, 180, 220);
  }

  move() {
    this.pos.add(this.vel);

    // Bounce off edges
    if (this.pos.x - this.r < 0 || this.pos.x + this.r > width) {
      this.vel.x *= -1;
    }
    if (this.pos.y - this.r < 0 || this.pos.y + this.r > height) {
      this.vel.y *= -1;
    }
  }

  show() {
    fill(this.col);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }

  // Step 4: collision detection + response
  checkCollision(other) {
    let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
    if (d < this.r + other.r) {
      // Collision detected → change colors
      this.col = color(random(255),random(255),random(255));
      other.col = color(random(255),random(255),random(255));
       this.vel = createVector(random(-5, 12), random(-3, 6));

      // Simple bounce: reverse velocity
      this.vel.mult(-1);
      other.vel.mult(-1);
    } else {
    // this.col = color('#A17349');
    //   other.col = color ('#94794A');
    }
  }
}
