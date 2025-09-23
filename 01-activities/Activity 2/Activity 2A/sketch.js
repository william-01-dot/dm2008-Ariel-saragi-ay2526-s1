// DM2008
// Activity 1b (Georg Nees)

let x;
let y;
let w;



function setup() {
  createCanvas(800, 800)
      background(255);



}

function draw() {
  x = random(width);
  y = random(height);
  w = random(30, 400);
  
  // background(240,40);
  
  stroke('rgb(87,4,4)');
  strokeWeight(random(1,20));
  rect(x, y, w, w);
  
  text()
}

function keyPressed() {
    saveCanvas("activity1b-image", "jpg");
}