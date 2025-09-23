// DM2008 — Activity 3a
// (Array Sampler, 25 min)

// 1. Create an array of colors (or other values)
//    You can make more than one array if you'd like
let palette = ["#FFDAD3", "#F5837A", "#F44336", "#EB1B0C"];

// 2. A variable to track the current index
// let currentIndex = 0;

function setup() {
  createCanvas(400, 400);
   
  noStroke();
}

function draw() {
 // background(220);

  const spacingy = height / (palette.length + 0.3);
  
  for (let i = 0; i < palette.length; i++) {
    // fill(palette[i]);      
    
  const spacingx = width / (palette.length + 1);
  
  for (let a = 0; a < palette.length; a++) {
    fill(palette[a]);      
    
      // fill(palette[currentIndex]);
    // use the i-th color
    
    const y = (i + 1) * spacingy;  
    const x = (a + 1) * spacingx;  
    const d = (i + 20) + spacingy - y ; 
   
    
      ellipse(x, y, d);
    // position from the loop index
  }
  // 3. Use the array value at currentIndex
  } 

}

// 4. Change the index when a key is pressed
function keyPressed() {
  if (key == 'a' || key == 'A') {
    // Add a new random color to the end
    palette.push(color(random(255), random(255), random(255)));
  }
  if (key == 'r' || key == 'R' ) {
    // Remove the last color (if any)
    if (palette.length > 0) {
      palette.splice(palette.length - 1, 1);
    }
  }
}
// function keyPressed() 
// {if (key == 'r' || key == 'R' )
  // currentIndex++;
  // Reset to 0 when we reach the end
  // if (currentIndex >= palette.length)
  {
    // currentIndex = 0;
  
  // Log in the console to check
  // console.log("Current index:", currentIndex, "→", palette[currentIndex]);
}

function mousePressed() {
    // Add a new random color to the end
{palette.push(color(random(150,255), random(1,100), random(1,60)));
  }
  background(color(random(255), random(255), random(255)));
  
}



// TODOs for students:
// 1. Replace colors with your own data (positions, text, sizes, etc).
// 2. Try mousePressed() instead of keyPressed().
// 3. Use push() to add new items, or splice() to remove them, then check how the sketch adapts.
// 4. Try looping through an array to visualize all the items within it instead of accessing one item at a time.
