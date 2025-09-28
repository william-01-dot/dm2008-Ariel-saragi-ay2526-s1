// DM2008 — Mini Project
// PONG (Starter Scaffold)

// Notes for students:
// 1) Add paddle controls (W/S and ↑/↓) inside handleInput()
// 2) Add scoring + reset when the ball goes past a paddle
// 3) Add win conditions / start + game-over states if you want

/* ----------------- Globals ----------------- */
let leftPaddle, rightPaddle, ball;
let game = 0;

let leftScore = 0;
let rightScore = 0;

let bgsound;
let Pingsound;

/* ----------------- Setup & Draw ----------------- */
function setup() {
  createCanvas(640, 360);
  noStroke();
  
  // paddles: x, y, w, h
  leftPaddle  = new Paddle(30, height/2 - 30, 10, 60);
  rightPaddle = new Paddle(width - 40, height/2 - 30, 10, 60);

  // ball starts center with a gentle push
  ball = new Ball(width/2, height/2, 8);
  score = new Score();
  textSize(22);
  
}

function preload(){
  
  bgsound = loadSound("song/gaming-game-minecraft-background-music-387000.mp3")
   Pingsound = loadSound("song/happy-message-ping-351298.mp3")
  
}

function draw() {
  background('rgb(33,33,109)');
  // 1) read input (students: add paddle movement here)
  handleInput();

  // 2) update world
  leftPaddle.update();
  rightPaddle.update();
  if (game == 1) {
      ball.update();
  }


  // 3) handle collisions
  ball.checkWallBounce();                // top/bottom
  ball.checkPaddleBounce(leftPaddle);
  ball.checkPaddleBounce(rightPaddle);

  // 4) draw everything
  drawCourt();
  leftPaddle.show();
  rightPaddle.show();
  ball.show();
  score.show();

}

/* ----------------- Input ----------------- */
function handleInput() {
  // TODO (students): move paddles
  // Example targets:
  // - W/S to move leftPaddle up/down
  // - UP/DOWN to move rightPaddle up/down
  //
  // Hints:
  // leftPaddle.vy = -5 or 5; rightPaddle.vy = -5 or 5;
  // Make sure to stop paddles when keys are released (see keyReleased)
  if (keyIsPressed){
  if (key == ' ' || key == ' '){
    game = 1;
  }
    if (key == 'w' || key == 'W') {
      leftPaddle.vy = -5
    }
    if (key == 's' || key == 's') {
      leftPaddle.vy = 5
    }
  
    if (key == 'i' || key == 'I') {
      rightPaddle.vy = -5
    }
     if (key == 'k' || key == 'K') {
      rightPaddle.vy = 5
    }
  }
}

function keyReleased() {
  // Stop paddles when keys are released (students: fill this once handleInput is added)
  leftPaddle.vy  = 0;
  rightPaddle.vy = 0;
}

/* ----------------- Classes ----------------- */
class Score {
  
  show(){
    fill(220);
    text(leftScore, 250, 50);
    text(rightScore, 380, 50);  
  }  
}

class Paddle {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.vy = 0; // students will change this via input
    this.speed = 5;
  }

  update() {
    // basic vertical movement; constrained to canvas
    this.pos.y += this.vy;
    this.pos.y = constrain(this.pos.y, 0, height - this.h);
  }

  show() {
    fill(220);
    rect(this.pos.x, this.pos.y, this.w, this.h, 2);
  }
}

class Ball {
  constructor(x, y, r,v) {
    this.pos = createVector(x, y);
    this.r = r;
    // give the ball a starting velocity
    this.vel = createVector(random([-2, 2]) * 3.5, random([-2, 2]) * 2.0);
  }

  update() {
    this.pos.add(this.vel);
  }

 checkWallBounce() {
  // bounce off top/bottom
  if (this.pos.y - this.r <= 0 || this.pos.y + this.r >= height) {
    this.vel.y *= -1;
    this.pos.y = constrain(this.pos.y, this.r, height - this.r);
    Pingsound.play ();
  }

  // check if ball goes past left/right edges
  if (this.pos.x + this.r < 0) {
    // right player scores
    rightScore++;
    this.reset();
  }
  if (this.pos.x - this.r > width) {
    // left player scores
    leftScore++;
    this.reset();
  }
}

  checkPaddleBounce(p) {
    // simple overlap check
    const withinY = this.pos.y > p.pos.y && this.pos.y < p.pos.y + p.h;
    const withinX = this.pos.x + this.r > p.pos.x && this.pos.x - this.r < p.pos.x + p.w;

    if (withinX && withinY) {
      // push ball out so it doesn’t get stuck inside paddle
      if (this.vel.x < 0) {
        this.pos.x = p.pos.x + p.w + this.r;
      } else {
        this.pos.x = p.pos.x - this.r;
      }
      this.vel.x *= -1; // reflect horizontally
    }
  }

  show() {
    fill(255, 170, 70);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }


  reset() {
    // students: call this after a point is scored
    this.pos.set(width/2, height/2);
    this.vel.set(random([-1, 1]) * 3.5, random([-1, 1]) * 2.0);
  
}
}

/* ----------------- UI helpers ----------------- */
function drawCourt() {
  // center line
  stroke('rgb(253,253,253)');
  strokeWeight(2);
  for (let y = 10; y < height; y += 18) {
    line(width/2, y, width/2, y + 8);
  }
  noStroke();
}

function keyPressed (keyIsPressed){
  if (key == ' ' || key == ' '){
    bgsound.loop();
  }
}