// DDM2008
// Activity 1a

// Run the sketch, then click on the preview to enable keyboard
// Use the 'Option' ('Alt' on Windows) key to view or hide the grid
// Use the 'Shift' key to change overlays between black & white
// Write the code for your creature in the space provided

function setup() {

  createCanvas(800,800);
}

function draw() {

  background('lightblue');
    fill('rgb(223,118,41)')
   ellipse(600,500,300);
      fill('lightblue')
   ellipse(550,500,200);
  
    fill('orange')
 ellipse(500,500,200);
    fill('rgb(250,249,246)')
  ellipse(500,500,170);
    fill('rgb(223,118,41)')
 triangle(500,475,400,400,600,400);
    fill('orange')
 triangle(400,400,600,400,500,300);
     fill('rgb(223,118,41)')
  triangle(425,375,475,325,425,275);
    fill('rgb(223,118,41)')
  triangle(575,375,575,275,525,325);
    fill('rgb(248,247,247)')
  triangle(490,375,425,400,500,465); 
    fill('rgb(248,247,247)') 
  triangle(510,375,575,400,500,465);
     fill('rgb(10,10,10)')  
  circle(500,465,20)
     fill('rgb(10,10,10)')  
  circle(475,400,20)
     fill('rgb(10,10,10)')  
  circle(525,400,20)
     fill('rgb(223,118,41)')  
  triangle(450,450,415,500,500,550);
     fill('rgb(223,118,41)')  
  triangle(550,450,585,500,500,550);
  
  
  helperGrid(); // do not edit or remove this line
}
