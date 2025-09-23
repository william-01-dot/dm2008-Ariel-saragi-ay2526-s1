// DM2008 – Activity 4a
// Bake a Cookie (30 min)

let cookie;
let ChipCol = ['rgb(207,71,71)', 'rgb(55,55,127)', 'pink'];
let taste1 = ChipCol[0]; // 'deeppink'
let taste2 = ChipCol[1]; // 'darkorchid'
let taste3 = ChipCol[2]; // 'magenta'

function setup() {
  createCanvas(400, 400);
  noStroke();
  cookie = new Cookie("chocolate", 80, width / 2, height / 2);
  cookie2 = new Cookie("chocolate", 80, width -100, height - 200);
  cookie3 = new Cookie("chocolate", 80, width -300, height - 200);
}

function draw() {
  background('#FBE7DF');
  cookie.show();
  cookie2.show();
  cookie3.show();
}

// Step 1: define the Cookie class
class Cookie {
  constructor(flavor, size, x, y) {
    this.flavor = flavor;
    this.size = size;
    this.x = x;
    this.y = y;
  }

  // Step 2: display the cookie
  show() {
    if (this.flavor === "chocolate") {
      fill(196, 146, 96); // darker brown
    } else if (this.flavor === "vanilla") {
      fill(255, 230, 180); 
    } else if (this.flavor === "strawberry") {
      fill(255, 180, 200); 
         } else if (this.flavor === "matcha") {
      fill('#BCD5A0'); 
    } else {
      fill(220, 180, 120);
    }
    stroke('#79574B');
    strokeWeight(2);
    ellipse(this.x, this.y, this.size);
    
     // a few "chips" placed relative to size
    const s = this.size * 0.1;
    fill('#85503D');
    ellipse(this.x - this.size*0.22, this.y - this.size*0.15, s);
    ellipse(this.x + this.size*0.18, this.y - this.size*0.10, s);
    ellipse(this.x - this.size*0.05, this.y + this.size*0.12, s);
    // ellipse(this.x + this.size*0.20, this.y + this.size*0.18, s);
    // ellipse(this.x + this.size*0.09, this.y + this.size*0.30, s);
    
  }

  // Step 5: movement
 pindah(direction) {
    let position = 30;
    if (direction === "up") this.y -= position;
    if (direction === "down") this.y += position;
    if (direction === "left") this.x -= position;
    if (direction === "right") this.x += position;
  }

  // Step 6: randomize flavor
  randomizeFlavor() {
    let flavors = ["chocolate", "vanilla", "strawberry", "matcha"];
    this.flavor = random(flavors);
  }
}

// Step 5: keyboard movement
function keyPressed() {
  if (keyCode === UP_ARROW) cookie.pindah("up");
  if (keyCode === UP_ARROW) cookie2.pindah("down");
  if (keyCode === UP_ARROW) cookie3.pindah("down");
  if (keyCode === DOWN_ARROW) cookie.pindah("down");
  if (keyCode === DOWN_ARROW) cookie2.pindah("up");
  if (keyCode === DOWN_ARROW) cookie3.pindah("up");
  if (keyCode === LEFT_ARROW) cookie.pindah("left");
  if (keyCode === LEFT_ARROW) cookie2.pindah("right");
  if (keyCode === LEFT_ARROW) cookie3.pindah("right");
  if (keyCode === RIGHT_ARROW) cookie.pindah("right");
  if (keyCode === RIGHT_ARROW) cookie2.pindah("left");
  if (keyCode === RIGHT_ARROW) cookie3.pindah("left");
}

// Step 6: click to randomize flavor
function mousePressed() {
  cookie.randomizeFlavor();
  cookie2.randomizeFlavor();
  cookie3.randomizeFlavor();
}
