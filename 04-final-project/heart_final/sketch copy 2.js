// === ORIGINAL HEART & SENSOR VARIABLES ===
let points = [];
let numPoints = 220;
let connectDist = 150;
let t = 0.015;
let currentScale = 1;
let breathingSound;
let isPlayingBreathing = false;

// Serial communication variables
let port;
let connectBtn;

let sensorVal = 0; 
let bpmValue = 60; // Stores valid BPM value, default 60

// === 3D BACKGROUND VARIABLES ===
let stars = [];
let starCount = 500;
let bgRotationX = 0;
let bgRotationY = 0;
let mouseXPrev = 0;
let mouseYPrev = 0;
let rotationSensitivity = 0.005;
let bgColor;
let starBaseSize = 1;

function preload() {
  breathingSound = loadSound("assets/Breathing.mp3"); // adjust path if needed
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noFill();
  strokeWeight(1);
  
  // Initialize 3D stars
  for (let i = 0; i < starCount; i++) {
    stars.push({
      pos: createVector(
        random(-width, width),
        random(-height, height),
        random(-1000, 1000)
      ),
      size: random(0.5, 2),
      color: color(random(150, 255), random(100, 200), random(200, 255)),
      pulseRate: random(0.5, 2)
    });
  }

  // Initialize heart points
  for (let i = 0; i < numPoints; i++) {
    points.push(new Node());
  }

  // --- Serial setup ---
  port = createSerial();
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);
  connectBtn.style('z-index', '100');
  connectBtn.style('background-color', '#333');
  connectBtn.style('color', 'white');
  connectBtn.style('padding', '8px 12px');
  connectBtn.style('border', 'none');
  connectBtn.style('border-radius', '4px');
  connectBtn.style('cursor', 'pointer');
}

function draw() {
  // === SERIAL READING ===
  if (port && port.opened()) {
    let data = port.readUntil("\n").trim();
    if (data && data.includes("BPM: ")) {
      let bpmStr = data.replace("BPM: ", "").trim();
      let bpm = parseFloat(bpmStr);
      if (!isNaN(bpm)) {
        bpmValue = bpm;
        console.log("Valid BPM: ", bpmValue);
      }
    }
  }

  // === BACKGROUND 3D STARS WITH BPM INTERACTION ===
  // Set background color based on BPM (calmer = darker, higher = brighter)
  let bgBrightness = map(bpmValue, 50, 150, 10, 40);
  bgColor = color(bgBrightness, bgBrightness / 3, bgBrightness * 1.2);
  background(bgColor);
  
  // Rotate background based on mouse movement
  orbitControl(2, 2);
  
  // Draw stars with BPM-based animation
  drawStars();

  // === HEART SCALING BASED ON BPM ===
  let targetScale = map(bpmValue, 40, 180, 0.8, 2.5);
  targetScale = constrain(targetScale, 0.5, 3.0);
  currentScale = lerp(currentScale, targetScale, 0.1);
  scale(currentScale);

  // === HEART DRAWING ===
  rotateY(t * 0.5);
  rotateX(sin(t * 0.1) * 0.03);

  let pulse = abs(sin(t * 2.2)) * 0.9 + abs(sin(t * 1.1)) * 0.6;
  pulse = constrain(pulse, 0.35, 1.3);

  for (let p of points) p.update();

  for (let i = 0; i < numPoints; i++) {
    const a = points[i];
    for (let j = i + 1; j < numPoints; j++) {
      const b = points[j];
      const d = dist(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      if (d < connectDist) {
        const alpha = map(d, 0, connectDist, 230, 0);
        const bright = color(255 * pulse, 80 * pulse, 80 * pulse, alpha);
        const deep   = color(120 * pulse, 0,   0,          alpha * 0.9);
        stroke(lerpColor(bright, deep, d / connectDist));
        strokeWeight(map(d, 0, connectDist, 1.4, 0.25));
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }

  stroke(200 * pulse, 40 * pulse, 40 * pulse, 100);
  strokeWeight(2);
  for (let p of points) point(p.pos.x, p.pos.y, p.pos.z);

  t += 0.01;

  // 🌬 SOUND: Play breathing audio when BPM is high (stress)
  if (bpmValue > 100) { 
    if (!isPlayingBreathing) {
      breathingSound.loop();
      isPlayingBreathing = true;
    }
  } else {
    if (isPlayingBreathing) {
      breathingSound.stop();
      isPlayingBreathing = false;
    }
  }
}

// Draw 3D stars with BPM interaction
// Draw 3D stars with BPM interaction
function drawStars() {
  let pulseIntensity = map(bpmValue, 50, 150, 0.2, 1.5);
  let starPulseSpeed = map(bpmValue, 50, 150, 0.5, 3);
  
  push();
  // Rotate the entire star field slightly based on BPM
  rotateX(sin(t * 0.1) * 0.1);
  rotateY(cos(t * 0.08) * 0.1);
  
  for (let star of stars) {
    // Make stars pulse with BPM
    let pulse = (sin(t * starPulseSpeed + star.pos.x) + 1) / 2 * pulseIntensity;
    let size = star.size * starBaseSize * (1 + pulse * 0.5);
    
    // Make stars move based on BPM - higher BPM = faster movement
    let speed = map(bpmValue, 50, 150, 0.5, 3);
    star.pos.z += speed;
    
    // Reset stars that go too far
    if (star.pos.z > 1000) {
      star.pos.z = -1000;
    }
    
    // Adjust brightness based on distance (perspective)
    let brightness = map(star.pos.z, -1000, 1000, 255, 50);
    let c = color(
      red(star.color) * brightness / 255,
      green(star.color) * brightness / 255,
      blue(star.color) * brightness / 255
    );
    
    stroke(c);
    strokeWeight(size);
    
    // Draw star with a slight glow effect
    point(star.pos.x, star.pos.y, star.pos.z);
    
    // Add a subtle glow for brighter stars
    if (size > 1.5) {
      strokeWeight(size * 0.5);
      stroke(red(c), green(c), blue(c), 100);
      point(star.pos.x, star.pos.y, star.pos.z);
    }
  }
  pop();
}

// === HEART POINT NODE CLASS ===
class Node {
  constructor() {
    this.offset = createVector(random(1000), random(1000), random(1000));
    this.base = this.randomHeartPoint();
    this.pos = this.base.copy();
  }

  randomHeartPoint() {
    let x = random(-1.3, 1.3);
    let y = random(-1.2, 1.5);
    let f = Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
    let tries = 0;
    while (f > 0 && tries < 50) {
      x = random(-1.3, 1.3);
      y = random(-1.2, 1.5);
      f = Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
      tries++;
    }

    const X = x * 250;
    const Y = -y * 250;
    const zRange = map(abs(x), 0, 1.3, 80, 40);
    const Z = random(-zRange, zRange);
    return createVector(X, Y, Z);
  }

  update() {
    // Make heart points move more with higher BPM
    let movement = map(bpmValue, 50, 150, 3, 8);
    this.pos.x = this.base.x + map(noise(this.offset.x + t * 0.35), 0, 1, -movement, movement);
    this.pos.y = this.base.y + map(noise(this.offset.y + t * 0.35), 0, 1, -movement, movement);
    this.pos.z = this.base.z + map(noise(this.offset.z + t * 0.35), 0, 1, -movement * 1.5, movement * 1.5);
  }
}

// === SERIAL BUTTON FUNCTION ===
function connectBtnClick(e) {
  if (!port.opened()) {
    port.open(115200); // must match Arduino baud rate
    e.target.innerHTML = "Disconnect from Arduino";
    e.target.style('background-color', '#4CAF50');
  } else {
    port.close();
    e.target.innerHTML = "Connect to Arduino";
    e.target.style('background-color', '#333');
  }
}

// === UTILITIES ===
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    fullscreen(!fullscreen());
  }
}