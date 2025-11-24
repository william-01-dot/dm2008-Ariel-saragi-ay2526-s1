let port; 
let connectBtn;

let sensorVal = 0;
let circleSize = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Serial port
  port = createSerial();

  // Connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);
}

function draw() {
  // === BACKGROUND (Blue Range) ===
  // soft blue gradient style background
  let c1 = color(20, 60, 150);
  let c2 = color(90, 140, 255);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }

  noStroke();
  fill(255, 230, 0); // Yellow circle

  ellipse(width / 2, height / 2, circleSize);

  // === SERIAL READ ===
  if (port.opened()) {
    let val = port.readUntil("\n");

    // update only if not empty
    if (val && val.trim() !== "") {
      sensorVal = float(val);
      circleSize = sensorVal; // direct mapping
    }
  }
}

// Required function
function connectBtnClick() {
  if (!port.opened()) {
    let usedPorts = usedSerialPorts();
    if (usedPorts.length > 0) {
      port.open(usedPorts[0], 9600);
    } else {
      port.open(9600);
    }
  } else {
    port.close();
  }
}
