let angle = 0;       // wave controls
let speed = 0.03;    // normal speed
let fastSpeed = 0.6; // speed when mouse pressed
let slowSpeed = 0.002;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(220);
  
   for (let j = 0; j < 20; j++){
   
   for (let i = 0; i < 20; i++) {
     
     fill('rgb(81,158,183)');
    circle (j*50, i*50, 58);
  }
 }

  // update wave
  if (mouseIsPressed) {
    angle += fastSpeed;
  } else {
    angle += speed;
  }
  
  if (keyIsPressed) {
    angle += slowSpeed;
  } else {
    angle += speed;
  }
    
  

  // draw multiple fox faces in grid
  let spacing = 150;
  for (let j = 1; j < width; j += spacing) {
    for (let i = 1; i < height; i += spacing) {
     let offsety = sin(angle + (i + j) * 0.05) * 20; 
     let offsetx = sin(angle + (i + j) * 0.1) * 20; //change to *0.04 for more tidy movement
      foxFace(j+60 + offsetx, i+ 70 + offsety, 80);
      // foxFace(j+60, i + offsety, 80); //for y axis wave only
    }
  }
}

function foxFace(x, y, size) {
  noStroke();

  // Colors (fixed orange fox color)
  let faceColor = color(240, 150, 100);
  let earColor = faceColor;
  let innerEarColor = color(255, 220, 200);
  
  // Face base
  fill(faceColor);
  ellipse(x, y, size, size);

  // Ears
  fill(earColor);
  triangle(x - size*0.462, y - size*0.2,  x - size*0.15, y - size*0.7,  x - size*0.04, y - size*0.2);
  triangle(x + size*0.462, y - size*0.2,  x + size*0.15, y - size*0.7,  x + size*0.05, y - size*0.2);

  // Inner ears
  fill(innerEarColor);
  triangle(x - size*0.35, y - size*0.25,  x - size*0.15, y - size*0.65,  x - size*0.08, y - size*0.25);
  triangle(x + size*0.35, y - size*0.25,  x + size*0.15, y - size*0.65,  x + size*0.08, y - size*0.25);

  // Eyes
  fill(0);
  circle(x - size*0.15, y - size*0.05, size*0.1);
  circle(x + size*0.15, y - size*0.05, size*0.1);

  // Nose
  fill(50);
  triangle(x - size*0.1, y + size*0.2,  x + size*0.1, y + size*0.2,  x, y + size*0.1);
}
