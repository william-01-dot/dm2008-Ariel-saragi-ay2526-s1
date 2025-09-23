let x; 
let y;
let size = 80;
let bgColor;
let ellipseColor;
let direction = 1; 
let speed = 5;
let state = 0; // 0: top, 1: right, 2: bottom, 3: left
let linecolor;

function setup() {
  createCanvas(400, 400);
           
  x = size / 2;
  y = size / 2;
  bgColor = color('#F1E472');
  ellipseColor = color(50, 150, 200);
  linecolor = ('red');
  
  }

function draw() {
   background(bgColor);
            
   // guide line
   noFill();
   stroke(linecolor);
   strokeWeight(1);
   rect(size/2, size/2, width - size, height - size);
            
     // ellipse
     fill(ellipseColor);
     noStroke();
     ellipse(x, y, size);
            
            
   //position based on state
   if (direction === 1) {
                
   if (state === 0) {
       x += speed;
       if (x >= width - size/2) {
       x = width - size/2;
       state = 1;
       }
    } 
     
     else if (state === 1) {
       y += speed;
       if (y >= height - size/2) {
       y = height - size/2;
       state = 2;
       }
     } 
     
     else if (state === 2) {
       x -= speed;
       if (x <= size/2) {
       x = size/2;
       state = 3;
       }
     } 
     
     else if (state === 3) {
       y -= speed;
       if (y <= size/2) {
       y = size/2;
       state = 0;
      }
    }
  }  
}         
            
function keyPressed() {
  switch (key) {
      
    case '1':
      bgColor = color('rgb(230,125,125)'); 
      ellipseColor = color('rgb(162,36,36)');
      linecolor = ('rgb(233,203,203)');
      break;
      
    case '2':
      bgColor = color('#CDDC39'); 
      ellipseColor = color('#136416');
      linecolor = ('#4CAF50');
      break;
      
    case '3':
      bgColor = color('#03A9F4'); 
      ellipseColor = color('#184263');
      linecolor = ('#C3E4F3');
      break;
      
    default:
      bgColor = color('#FFC107'); 
      ellipseColor = color('#B8AA35');
      linecolor = ('#FFEB3B');  
  }
} 