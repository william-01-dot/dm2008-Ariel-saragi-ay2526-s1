let colorBtn, sizeSlider, shapeSelect;
let shapeColor;
let colorLoop = false;
let hueValue = 0;
let pulse = 0;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textFont("Helvetica, Arial, sans-serif");
  colorMode(HSB, 360, 100, 100);

  // --- Control Panel ---
  let panel = createDiv();
  panel.position(24, 24);
  panel.style("background", "rgba(255, 255, 255, 0.1)");
  panel.style("padding", "20px");
  panel.style("border-radius", "16px");
  panel.style("box-shadow", "0 8px 25px rgba(0,0,0,0.25)");
  panel.style("backdrop-filter", "blur(12px)");
  panel.style("border", "1px solid rgba(255,255,255,0.3)");
  panel.style("width", "260px");
  panel.style("color", "#fff");

  let title = createP("✨Shape Controller");
  title.parent(panel);
  title.style("margin", "0 0 12px 0");
  title.style("font-size", "18px");
  title.style("font-weight", "600");

  colorBtn = createButton("🌈Toggle Color Loop");
  colorBtn.parent(panel);
  styleButton(colorBtn);
  colorBtn.mousePressed(toggleColorLoop);

  createP("Size").parent(panel).style("margin", "14px 0 4px 0");
  sizeSlider = createSlider(20, 500, 120, 1);
  sizeSlider.parent(panel);
  styleSlider(sizeSlider);

  createP("Shape").parent(panel).style("margin", "14px 0 4px 0");
  shapeSelect = createSelect();
  shapeSelect.parent(panel);
  shapeSelect.option("ellipse");
  shapeSelect.option("rect");
  shapeSelect.option("triangle");
  shapeSelect.style("padding", "6px 10px");
  shapeSelect.style("border-radius", "8px");
  shapeSelect.style("border", "1px solid rgba(255,255,255,0.4)");
  shapeSelect.style("font-size", "14px");
  shapeSelect.style("background", "rgba(255,255,255,0.2)");
  shapeSelect.style("color", "#fff");
  shapeSelect.style("cursor", "pointer");

  shapeColor = color(random(360), 80, 100);
}

function draw() {
  //SMOOTH BACKDROP
  drawSmoothGradient();

  //Shape Logic
  if (colorLoop) {
    hueValue = (hueValue + 1.5) % 360;
    shapeColor = color(hueValue, 90, 100);
  }

  pulse += 0.04;
  let s = sizeSlider.value();
  let choice = shapeSelect.value();

  push();
  translate(width * 0.65, height * 0.5);

  // Halo follows shape type
  let haloColor = color(hue(shapeColor), 80, 100, 0.25);
  fill(haloColor);
  noStroke();
  let haloSize = s * 1.3 + sin(pulse) * 10;

  if (choice === "ellipse") {
    ellipse(0, 0, haloSize);
  } else if (choice === "rect") {
    rectMode(CENTER);
    rect(0, 0, haloSize, haloSize, 30);
  } else if (choice === "triangle") {
    push();
    scale(haloSize / s);
    triangle(-s * 0.5, s * 0.4, 0, -s * 0.6, s * 0.5, s * 0.4);
    pop();
  }

  // Main shape
  fill(shapeColor);
  noStroke();
  if (choice === "ellipse") {
    ellipse(0, 0, s);
  } else if (choice === "rect") {
    rectMode(CENTER);
    rect(0, 0, s, s, 20);
  } else if (choice === "triangle") {
    triangle(-s * 0.5, s * 0.4, 0, -s * 0.6, s * 0.5, s * 0.4);
  }
  pop();

  t += 0.003; // subtle gradient movement
}

function drawSmoothGradient() {
  let c1 = color((t * 200) % 360, 60, 90);
  let c2 = color(((t * 200) + 120) % 360, 60, 40);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function toggleColorLoop() {
  colorLoop = !colorLoop;
  if (!colorLoop) {
    shapeColor = color(random(360), 80, 100);
  }
}

function styleButton(btn) {
  btn.style("padding", "10px 16px");
  btn.style("background", "linear-gradient(90deg, #ff0080, #7928ca)");
  btn.style("color", "white");
  btn.style("border", "none");
  btn.style("border-radius", "10px");
  btn.style("font-size", "14px");
  btn.style("cursor", "pointer");
  btn.style("transition", "all 0.2s ease");
  btn.style("font-weight", "500");
  btn.elt.addEventListener("mouseenter", () => {
    btn.style("transform", "scale(1.05)");
    btn.style("box-shadow", "0 0 15px rgba(255, 0, 128, 0.6)");
  });
  btn.elt.addEventListener("mouseleave", () => {
    btn.style("transform", "scale(1)");
    btn.style("box-shadow", "none");
  });
}

function styleSlider(slider) {
  slider.style("width", "100%");
  slider.elt.style.cursor = "pointer";
  slider.elt.style.height = "6px";
  slider.elt.style.borderRadius = "6px";
  slider.elt.style.background = "linear-gradient(90deg, #00c6ff, #0072ff)";
  slider.elt.style.outline = "none";
}
