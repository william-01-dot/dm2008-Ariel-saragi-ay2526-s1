// === 核心变量 ===
let points = [];
let numPoints = 180;
let connectDist = 120;
let t = 0;
let bpmValue = null;
let hasRealData = false;
let currentPulse = 1.0;
let jitterTime = 0;

// 点击粒子系统
let clickParticles = [];

// 音频相关
let breathingSound;
let universeSound;
let isPlayingBreathing = false;
let calmPromptAlpha = 0;
const HIGH_BPM_THRESHOLD = 100;

// 粒子系统变量
let breathRingScale = 1.2;
const BREATH_RING_BASE_SIZE = 330;
const BREATH_RING_EXPAND = 0.8;
const PARTICLE_SPAN = 0.28;
let breathParticleCount = 650;
let breathParticles = [];
let particleDistortion = 0;
const ROTATION_SPEED = 1.2;
const PARTICLE_SPEED_FACTOR = 0.7;
let highBpmParticleDecay = 0;
const HIGH_BPM_DECAY_RATE = 0.003;

// BPM平滑处理
let smoothedBpm = 80;
const BPM_SMOOTH_FACTOR = 0.1;

// 串口和UI变量
let port;
let connectBtn;
let bpmDisplay;
let calmPrompt;

// 背景星星
let stars = [];
let starCount = 1000;

// === 添加Google Fonts ===
function addGoogleFonts() {
  let link1 = createElement('link');
  link1.attribute('rel', 'preconnect');
  link1.attribute('href', 'https://fonts.googleapis.com');
  
  let link2 = createElement('link');
  link2.attribute('rel', 'preconnect');
  link2.attribute('href', 'https://fonts.gstatic.com');
  link2.attribute('crossorigin', '');
  
  let link3 = createElement('link');
  link3.attribute('rel', 'stylesheet');
  link3.attribute('href', 'https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&family=Orbitron:wght@400..900&display=swap');
  
  document.head.appendChild(link1.elt);
  document.head.appendChild(link2.elt);
  document.head.appendChild(link3.elt);
}

// === 预加载 ===
function preload() {
  breathingSound = loadSound("assets/Breathing.mp3");
  universeSound = loadSound("assets/universe.mp3");
  addGoogleFonts();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noFill();
  strokeWeight(1);
  colorMode(RGB, 255);

  // 初始化心脏节点
  for (let i = 0; i < numPoints; i++) points.push(new Node());

  // 初始化呼吸环粒子
  for (let i = 0; i < breathParticleCount; i++) {
    const hueOffset = random(-30, 20);
    const radiusVariation = 1 + random(-PARTICLE_SPAN, PARTICLE_SPAN);
    
    breathParticles.push({
      angle: map(i, 0, breathParticleCount, 0, TWO_PI),
      offset: random(TWO_PI),
      size: random(1.0, 2.0),
      hue: hueOffset,
      brightness: random(0.8, 1.2),
      radiusFactor: radiusVariation,
      vx: 0,
      vy: 0,
      vz: 0,
      originalAngle: map(i, 0, breathParticleCount, 0, TWO_PI),
      originalRadiusFactor: radiusVariation
    });
  }

  // 初始化星星
  for (let i = 0; i < starCount; i++) {
    stars.push({
      pos: createVector(random(-width, width), random(-height, height), random(-1000, 1000)),
      size: random(0.1, 1),
      color: color(random(180, 255), random(150, 255), random(220, 255)),
      pulseRate: random(1, 5),
      pulseStrength: random(0.3, 1.2),
      phase: random(TWO_PI)
    });
  }

  // 串口按钮
  port = createSerial();
  connectBtn = createButton("Connect to Monitor");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);
  connectBtn.style('z-index', '100');
  connectBtn.style('padding', '10px 15px');
  connectBtn.style('font-size', '16px');
  connectBtn.style('font-family', 'Orbitron, sans-serif');
  connectBtn.style('background-color', '#4CAF50');
  connectBtn.style('color', 'white');
  connectBtn.style('border', 'none');
  connectBtn.style('border-radius', '4px');
  connectBtn.style('cursor', 'pointer');

  // 创建BPM显示面板
  createBpmDisplay();

  // 创建平静提示文字
  calmPrompt = createDiv();
  calmPrompt.id('calmPrompt');
  calmPrompt.style('position', 'absolute');
  calmPrompt.style('top', '20%');
  calmPrompt.style('left', '50%');
  calmPrompt.style('transform', 'translate(-50%, -50%)');
  calmPrompt.style('color', 'white');
  calmPrompt.style('font-family', 'Elms Sans, sans-serif');
  calmPrompt.style('text-align', 'center');
  calmPrompt.style('z-index', '200');
  calmPrompt.style('opacity', '0');
  calmPrompt.style('transition', 'opacity 0.5s ease');
  calmPrompt.html(`
    <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">Breathe with Your Heart</div>
    <div style="font-size: 20px;">Follow the rhythm of the rings</div>
  `);

  // 播放宇宙背景音
  if (universeSound.isLoaded()) {
    universeSound.loop();
    universeSound.setVolume(0.7);
  }
}

function draw() {
  background(0);
  orbitControl(2, 2);
  drawStars();

  jitterTime += deltaTime * 0.0003;

  // 处理心跳逻辑
  if (bpmValue !== null) {
    smoothedBpm = lerp(smoothedBpm, bpmValue, BPM_SMOOTH_FACTOR);
    
    const bpmFrequency = smoothedBpm / 600;
    const timeIncrement = deltaTime / 700;
    t += timeIncrement * bpmFrequency;

    const beatAmplitude = smoothedBpm > HIGH_BPM_THRESHOLD
      ? map(smoothedBpm, HIGH_BPM_THRESHOLD, 150, 0.1, 0.18)
      : map(smoothedBpm, 40, HIGH_BPM_THRESHOLD, 0.03, 0.1);

    const targetPulse = 1 + beatAmplitude * (sin(t * TWO_PI) ** 2);
    const smoothFactor = map(smoothedBpm, 40, 150, 0.1, 0.25);
    currentPulse = lerp(currentPulse, targetPulse, smoothFactor * timeIncrement * 60);

    if (smoothedBpm > HIGH_BPM_THRESHOLD) {
      calmPromptAlpha = lerp(calmPromptAlpha, 1, 0.05);
      particleDistortion = lerp(particleDistortion, 0.8, 0.005);
      highBpmParticleDecay = lerp(highBpmParticleDecay, 1, HIGH_BPM_DECAY_RATE);
      
      if (!isPlayingBreathing && breathingSound.isLoaded()) {
        breathingSound.loop();
        breathingSound.setVolume(0.5);
        isPlayingBreathing = true;
      }
      updateBreathIndicator();
    } else {
      calmPromptAlpha = lerp(calmPromptAlpha, 0, 0.05);
      particleDistortion = lerp(particleDistortion, 0, 0.003);
      highBpmParticleDecay = lerp(highBpmParticleDecay, 0, HIGH_BPM_DECAY_RATE);
      
      if (isPlayingBreathing) {
        breathingSound.stop();
        isPlayingBreathing = false;
      }
    }
  } else {
    currentPulse = lerp(currentPulse, 1.0 + 0.01 * sin(t), 0.05);
    t += 0.005;
    calmPromptAlpha = 0;
    particleDistortion = lerp(particleDistortion, 0, 0.005);
    highBpmParticleDecay = lerp(highBpmParticleDecay, 0, HIGH_BPM_DECAY_RATE);
    
    if (isPlayingBreathing) {
      breathingSound.stop();
      isPlayingBreathing = false;
    }
  }

  calmPrompt.style('opacity', calmPromptAlpha.toString());
  drawBreathParticleRing();

  // 绘制心脏
  push();
  scale(currentPulse * 0.9);
  const heartColor = smoothedBpm > HIGH_BPM_THRESHOLD ? color(255, 50, 50) : color(255, 80, 80);
  for (let p of points) p.update();

  // 绘制连接线
  for (let i = 0; i < numPoints; i++) {
    const a = points[i];
    for (let j = i + 1; j < numPoints; j++) {
      const b = points[j];
      const d = dist(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      if (d < connectDist) {
        const alpha = map(d, 0, connectDist, 230, 0);
        const bright = color(red(heartColor) * currentPulse, green(heartColor) * currentPulse, blue(heartColor) * currentPulse, alpha);
        const deep = color(red(heartColor) * 0.6 * currentPulse, green(heartColor) * 0.6 * currentPulse, blue(heartColor) * 0.6 * currentPulse, alpha * 0.9);
        stroke(lerpColor(bright, deep, d / connectDist));
        strokeWeight(map(d, 0, connectDist, 1.2, 0.2));
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }

  // 绘制节点
  stroke(red(heartColor) * 0.8 * currentPulse, green(heartColor) * 0.8 * currentPulse, blue(heartColor) * 0.8 * currentPulse, 100);
  strokeWeight(1.5);
  for (let p of points) point(p.pos.x, p.pos.y, p.pos.z);
  pop();

  // 处理串口数据
  if (port && port.opened()) {
    let data = port.readUntil("\n").trim();
    if (data && data.includes("BPM: ")) {
      let bpm = parseFloat(data.replace("BPM: ", "").trim());
      if (!isNaN(bpm) && bpm > 40 && bpm < 160) {
        if (bpmValue === null || abs(bpm - bpmValue) < 15) {
          bpmValue = bpm;
          hasRealData = true;
        }
      }
    }
  } else if (!hasRealData) {
    bpmValue = null;
  }

  updateBpmDisplay();
  
  // 更新并绘制点击粒子
  updateClickParticles();
  drawClickParticles();
}

// 修正的3D坐标转换函数 - 解决左右反转问题
function get3DPoint(x, y, depth = 0) {
  // 关键修正：同时调整x和y的坐标映射方向
  const nx = 1 - (x / width) * 2;  // 修正x坐标方向（左右反转问题）
  const ny = (y / height) * 2 - 1; // 修正y坐标方向（上下反转问题）
  
  // 获取当前模型视图矩阵和投影矩阵
  const mvMatrix = modelViewMatrix;
  const pMatrix = projectionMatrix;
  
  // 创建逆矩阵（用于从屏幕坐标转换回世界坐标）
  const invMatrix = p5.Matrix.mult(pMatrix, mvMatrix).invert();
  
  // 创建齐次坐标点
  const point = createVector(nx, ny, depth, 1);
  
  // 应用逆矩阵转换
  point.applyMatrix4(invMatrix);
  
  // 透视除法
  if (point.w !== 0) {
    point.div(point.w);
  }
  
  return point;
}

// 处理点击事件，创建白色粒子
function mousePressed() {
  // 使用修正的坐标转换函数
  const clickPoint = get3DPoint(mouseX, mouseY, -0.1);
  
  // 根据BPM值调整粒子数量
  const baseCount = 60;
  const bpmFactor = bpmValue ? map(smoothedBpm, 40, 150, 0.5, 1.5) : 1;
  const particleCount = floor(random(baseCount * 0.8, baseCount * 1.2) * bpmFactor);
  
  // 创建粒子群，从点击位置向外扩散
  for (let i = 0; i < particleCount; i++) {
    const angle = random(TWO_PI);
    const distance = random(5, 30);
    
    const offsetX = cos(angle) * distance;
    const offsetY = sin(angle) * distance;
    const offsetZ = random(-15, 15);
    
    const speed = map(distance, 5, 30, 1, 4) * random(0.8, 1.2);
    
    clickParticles.push({
      pos: createVector(
        clickPoint.x + offsetX, 
        clickPoint.y + offsetY, 
        clickPoint.z + offsetZ
      ),
      vel: createVector(
        cos(angle) * speed, 
        sin(angle) * speed, 
        random(-1, 1) * speed * 0.5
      ),
      size: map(distance, 5, 30, 3, 1.5),
      alpha: 255,
      life: random(80, 150),
      maxLife: 0,
      pulse: random(TWO_PI),
      pulseSpeed: random(0.05, 0.15)
    });
    clickParticles[clickParticles.length - 1].maxLife = clickParticles[clickParticles.length - 1].life;
  }
}

// 更新点击粒子状态
function updateClickParticles() {
  for (let i = clickParticles.length - 1; i >= 0; i--) {
    const p = clickParticles[i];
    
    p.pos.add(p.vel);
    p.vel.y += 0.02;
    p.vel.mult(0.97);
    p.life--;
    
    p.alpha = map(p.life, 0, p.maxLife * 0.7, 0, 255);
    p.alpha = constrain(p.alpha, 0, 255);
    
    p.pulse += p.pulseSpeed;
    
    if (p.life <= 0) {
      clickParticles.splice(i, 1);
    }
  }
}

// 绘制点击粒子
function drawClickParticles() {
  push();
  noStroke();
  
  for (const p of clickParticles) {
    const pulseFactor = 0.8 + 0.2 * sin(p.pulse);
    fill(255, 255, 255, p.alpha * pulseFactor);
    
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(p.size * pulseFactor);
    
    fill(255, 255, 255, p.alpha * 0.15 * pulseFactor);
    sphere(p.size * 3 * pulseFactor);
    pop();
  }
  
  pop();
}

// 呼吸引导动画
function updateBreathIndicator() {
  const breathCycle = 2;
  const cyclePhase = (t) % breathCycle;

  if (cyclePhase < 1) {
    breathRingScale = map(cyclePhase, 0, 1, 1.0, 1.0 + BREATH_RING_EXPAND);
  } else {
    breathRingScale = map(cyclePhase, 1, 2, 1.0 + BREATH_RING_EXPAND, 1.0);
  }
}

// 绘制粒子环
function drawBreathParticleRing() {
  push();
  noStroke();
  
  const baseRadius = BREATH_RING_BASE_SIZE * breathRingScale;
  const zOffset = sin(t * 1) * 10;
  
  const activityFactor = 1 - highBpmParticleDecay;
  
  for (let p of breathParticles) {
    const distortionFactor = particleDistortion;
    
    const angleLerpSpeed = activityFactor * 0.1;
    p.angle = lerp(p.angle, p.originalAngle + p.offset + t * ROTATION_SPEED * PARTICLE_SPEED_FACTOR * activityFactor, angleLerpSpeed);
    
    if (distortionFactor < 0.1) {
      p.radiusFactor = lerp(p.radiusFactor, p.originalRadiusFactor, 0.1);
    } else if (distortionFactor < 0.7) {
      p.radiusFactor = lerp(
        p.radiusFactor, 
        p.originalRadiusFactor + random(-0.3, 0.3) * distortionFactor * PARTICLE_SPEED_FACTOR * activityFactor,
        0.05
      );
      
      p.vx += random(-0.08, 0.08) * distortionFactor * PARTICLE_SPEED_FACTOR * activityFactor;
      p.vy += random(-0.08, 0.08) * distortionFactor * PARTICLE_SPEED_FACTOR * activityFactor;
      p.vz += random(-0.08, 0.08) * distortionFactor * PARTICLE_SPEED_FACTOR * activityFactor;
      
      p.vx *= 0.93;
      p.vy *= 0.93;
      p.vz *= 0.93;
    } else {
      p.vx += random(-0.2, 0.2) * distortionFactor * PARTICLE_SPEED_FACTOR * activityFactor;
      p.vy += random(-0.2, 0.2) * distortionFactor * PARTICLE_SPEED_FACTOR * activityFactor;
      p.vz += random(-0.2, 0.2) * distortionFactor * PARTICLE_SPEED_FACTOR * activityFactor;
      
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.vz *= 0.96;
    }
    
    const particleRadius = baseRadius * p.radiusFactor;
    let x = cos(p.angle) * particleRadius;
    let y = sin(p.angle) * particleRadius;
    let z = zOffset + sin(t * 2 + p.angle) * 8;
    
    x += p.vx * distortionFactor * 3 * PARTICLE_SPEED_FACTOR * activityFactor;
    y += p.vy * distortionFactor * 3 * PARTICLE_SPEED_FACTOR * activityFactor;
    z += p.vz * distortionFactor * 3 * PARTICLE_SPEED_FACTOR * activityFactor;
    
    const sizeFactor = 1 + (sin(t * 2.4 + p.angle) * 0.2) + (breathRingScale - 1) * 0.8;
    const particleSize = p.size * sizeFactor * (1 + distortionFactor * 0.3);
    
    let r, g, b;
    const normalBlueR = constrain(70 + p.hue * 2, 50, 120);
    const normalBlueG = constrain(180 + p.hue, 150, 200);
    const normalBlueB = constrain(240 + p.hue * 0.5, 220, 255);
    
    const redBase = 200 + p.hue * 0.5;
    const highBpmR = constrain(redBase + random(-30, 50), 180, 255);
    const highBpmG = constrain(redBase * 0.2, 20, 80);
    const highBpmB = constrain(redBase * 0.1, 10, 50);
    
    r = lerp(normalBlueR, highBpmR, distortionFactor);
    g = lerp(normalBlueG, highBpmG, distortionFactor);
    b = lerp(normalBlueB, highBpmB, distortionFactor);
    
    const alpha = map(distortionFactor, 0, 1, 200, 180) * p.brightness;
    fill(r, g, b, alpha);
    
    push();
    translate(x, y, z);
    sphere(particleSize);
    pop();
    
    fill(r, g, b, alpha * 0.3);
    push();
    translate(x, y, z);
    sphere(particleSize * 2);
    pop();
  }
  
  pop();
}

// 心脏节点类
class Node {
  constructor() {
    this.offset = createVector(random(1000), random(1000), random(1000));
    this.base = this.randomHeartPoint();
    this.pos = this.base.copy();
  }

  randomHeartPoint() {
    let x, y;
    let tries = 0;
    do {
      x = random(-1.2, 1.2);
      y = random(-1.1, 1.4);
      tries++;
    } while (pow(x * x + y * y - 1, 3) - x * x * pow(y, 3) > 0 && tries < 50);

    const scale = 160;
    const Z = map(abs(x), 0, 1.2, 60, 30);
    return createVector(x * scale, -y * scale, random(-Z, Z));
  }

  update() {
    const jitter = 1.0 * (1.1 - currentPulse) * (1 + particleDistortion * 0.3) * (1 - highBpmParticleDecay * 0.7);
    this.pos.x = this.base.x + map(noise(this.offset.x + jitterTime), 0, 1, -jitter, jitter);
    this.pos.y = this.base.y + map(noise(this.offset.y + jitterTime + 1000), 0, 1, -jitter, jitter);
    this.pos.z = this.base.z + map(noise(this.offset.z + jitterTime + 2000), 0, 1, -jitter, jitter);
  }
}

// BPM显示相关
function createBpmDisplay() {
  bpmDisplay = createDiv();
  bpmDisplay.id('bpmDisplay');
  bpmDisplay.style('position', 'absolute');
  bpmDisplay.style('top', '20px');
  bpmDisplay.style('right', '20px');
  bpmDisplay.style('background', 'rgba(0,0,0,0.7)');
  bpmDisplay.style('color', 'white');
  bpmDisplay.style('padding', '15px 20px');
  bpmDisplay.style('border-radius', '8px');
  bpmDisplay.style('font-family', 'Orbitron, sans-serif');
  bpmDisplay.style('z-index', '100');
}

function updateBpmDisplay() {
  if (bpmValue === null) {
    bpmDisplay.html(`
      <div style="font-size: 18px;">Heart Rate</div>
      <div style="font-size: 36px; font-weight: bold; color: #ccc;">-- BPM</div>
      <div style="font-size: 14px;">Waiting for data...</div>
    `);
  } else {
    let status, color;
    if (smoothedBpm > HIGH_BPM_THRESHOLD) {
      status = "Elevated - Please calm down";
      color = "#FF5252";
    } else if (smoothedBpm <= 50) {
      status = "Slow";
      color = "#4CAF50";
    } else if (smoothedBpm <= 90) {
      status = "Normal";
      color = "#2196F3";
    } else {
      status = "Elevated";
      color = "#FFC107";
    }

    bpmDisplay.html(`
      <div style="font-size: 18px;">Heart Rate</div>
      <div style="font-size: 36px; font-weight: bold; color: ${color};">
        ${nf(smoothedBpm, 3, 0)} BPM
      </div>
      <div style="font-size: 14px;">${status}</div>
    `);
  }
}

// 绘制背景星星
function drawStars() {
  push();
  rotateX(sin(t * 0.1) * 0.1);
  rotateY(cos(t * 0.08) * 0.1);

  const starSpeed = bpmValue ? map(smoothedBpm, 40, 150, 1, 4) * (1 - highBpmParticleDecay * 0.5) : 2;
  const globalTime = frameCount * 0.05;

  for (let star of stars) {
    star.pos.z += starSpeed;
    if (star.pos.z > 1000) {
      star.pos.z = -1000;
      star.pos.x = random(-width, width);
      star.pos.y = random(-height, height);
    }

    const pulseRate = smoothedBpm > HIGH_BPM_THRESHOLD
      ? star.pulseRate * 1.2 * (1 - highBpmParticleDecay * 0.5)
      : star.pulseRate;

    const flicker = 0.5 + 0.5 * sin(globalTime * pulseRate + star.phase);
    const noiseFlicker = noise(star.pos.x * 0.001, star.pos.y * 0.001, globalTime * 0.1);
    const totalFlicker = flicker * noiseFlicker * star.pulseStrength;

    const baseBrightness = map(star.pos.z, -1000, 1000, 500, 250); 
    const flickerBrightness = baseBrightness * (1 + totalFlicker * 0.5);
    const c = color(
      red(star.color) * flickerBrightness / 255,
      green(star.color) * flickerBrightness / 255,
      blue(star.color) * flickerBrightness / 255
    );

    const flickerSize = 1 + totalFlicker * 0.3;
    stroke(c);
    strokeWeight(star.size * flickerSize * (bpmValue ? (0.5 + currentPulse * 0.3) : 1));
    point(star.pos.x, star.pos.y, star.pos.z);
    
    if (totalFlicker > 0.8) {
      stroke(red(c), green(c), blue(c), 100 * (totalFlicker - 0.8) * 1.25);
      strokeWeight(star.size * flickerSize * 2);
      point(star.pos.x, star.pos.y, star.pos.z);
    }
  } 
  pop();
}

// 串口连接按钮
function connectBtnClick() { 
  if (!port.opened()) { 
    port.open(115200); 
    connectBtn.html("Disconnect"); 
    connectBtn.style('background-color', '#f44336'); 
  } else { 
    port.close(); 
    connectBtn.html("Connect to Monitor"); 
    connectBtn.style('background-color', '#4CAF50'); 
  } 
}

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
}

function keyPressed() {
  if (key === 'f') fullscreen(!fullscreen());
  if (key === 'h') bpmValue = 110;
  if (key === 'n') bpmValue = 80;
  if (key === 'm') {
    if (universeSound.isPlaying()) {
      universeSound.setVolume(0);
    } else {
      universeSound.setVolume(0.7);
    }
  }
  if (key === '+') {
    ROTATION_SPEED = min(ROTATION_SPEED + 0.2, 3.0);
    console.log("Rotation speed increased to:", ROTATION_SPEED);
  }
  if (key === '-') {
    ROTATION_SPEED = max(ROTATION_SPEED - 0.2, 0.2);
    console.log("Rotation speed decreased to:", ROTATION_SPEED);
  }
}