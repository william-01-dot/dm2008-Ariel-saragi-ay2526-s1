// === 核心变量 ===
let points = [];
let numPoints = 200;
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
let breathRingScale = 1.2;  // 呼吸粒子缩放因子（共享给土星环）
const BREATH_RING_BASE_SIZE = 330;
const BREATH_RING_EXPAND = 0.8;
const PARTICLE_SPAN = 0.28;
let breathParticleCount = 650;
let breathParticles = [];
let particleDistortion = 0;
const ROTATION_SPEED = 0.6;
const PARTICLE_SPEED_FACTOR = 0.9;
let highBpmParticleDecay = 0;
const HIGH_BPM_DECAY_RATE = 0.003;

// 颜色定义
const SATURN_RING_INNER_COLOR_RGB = [70, 190, 255];   // 内环基准色（蓝）
const SATURN_RING_OUTER_COLOR_RGB = [200, 50, 50];    // 外环基准色（红）
let SATURN_RING_INNER_COLOR, SATURN_RING_OUTER_COLOR;

// 共享颜色变量
let sharedR, sharedG, sharedB;

// 土星环变量
const SATURN_RING_INNER_RADIUS = 400;
const SATURN_RING_OUTER_RADIUS = 520;
const SATURN_RING_LAYER_COUNT = 6;
const SATURN_RING_LINE_COUNT = 8;
const SATURN_RING_BRIGHTNESS = 0.7;
const SATURN_RING_ROTATION_SPEED = 0.04;
const SATURN_RING_THICKNESS = 320;
const SATURN_RING_SCALE_FACTOR = 0.5;
const SATURN_RING_IRREGULARITY = 0.15;
const SATURN_RING_GAP_VARIATION = 0.5;
const SATURN_RING_RADIUS_JITTER = 40;
const SATURN_RING_SEGMENT_OFFSET = 0.3;

// BPM平滑处理 - 新增最大最小值限制
let smoothedBpm = 80;
const BPM_SMOOTH_FACTOR = 0.1;
const MIN_SAFE_BPM = 40;    // 最低安全BPM值
const MAX_SAFE_BPM = 140;   // 最高安全BPM值，防止过高导致崩溃

// 串口和UI变量
let port;
let connectBtn;
let bpmDisplay;
let calmPrompt;

// 背景星星
let stars = [];
let starCount = 1200;
const STAR_MIN_SIZE = 0.1;
const STAR_MAX_SIZE = 3.5;
const STAR_FLICKER_SCALE = 1.8;


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

  // 初始化呼吸环粒子 - 添加拖尾数组
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
      originalRadiusFactor: radiusVariation,
      trail: []  // 拖尾点数组
    });
  }

  // 初始化星星
  for (let i = 0; i < starCount; i++) {
    stars.push({
      pos: createVector(random(-width, width), random(-height, height), random(-1000, 1000)),
      size: random(STAR_MIN_SIZE, STAR_MAX_SIZE),
      color: color(random(180, 255), random(150, 255), random(220, 255)),
      pulseRate: random(1, 5),
      pulseStrength: random(0.3, 1.2),
      phase: random(TWO_PI)
    });
  }

  SATURN_RING_INNER_COLOR = color(...SATURN_RING_INNER_COLOR_RGB);
  SATURN_RING_OUTER_COLOR = color(...SATURN_RING_OUTER_COLOR_RGB);

  // 初始化共享颜色
  sharedR = 70;
  sharedG = 190;
  sharedB = 255;

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
  calmPrompt.style('font-family', 'Orbitron, sans-serif');
  calmPrompt.style('text-align', 'center');
  calmPrompt.style('z-index', '200');
  calmPrompt.style('opacity', '0');
  calmPrompt.style('transition', 'opacity 0.5s ease');
  calmPrompt.html(`
    <div style="font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: bold; margin-bottom: 10px;">Breathe with Your Heart</div>
    <div style="font-family: 'Orbitron', sans-serif; font-size: 20px;">Follow the rhythm of the rings</div>
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

  // 处理心跳逻辑 - 添加安全限制
  if (bpmValue !== null) {
    // 限制BPM值在安全范围内，防止极端值导致崩溃
    const clampedBpm = constrain(bpmValue, MIN_SAFE_BPM, MAX_SAFE_BPM);
    smoothedBpm = lerp(smoothedBpm, clampedBpm, BPM_SMOOTH_FACTOR);
    
    const bpmFrequency = smoothedBpm / 600;
    const timeIncrement = deltaTime / 700;
    t += timeIncrement * bpmFrequency;

    // 限制心跳幅度，高心率时也不会过度放大
    const maxBeatAmplitude = 0.15; // 最大幅度限制
    const beatAmplitude = smoothedBpm > HIGH_BPM_THRESHOLD
      ? constrain(map(smoothedBpm, HIGH_BPM_THRESHOLD, MAX_SAFE_BPM, 0.1, maxBeatAmplitude), 0.1, maxBeatAmplitude)
      : map(smoothedBpm, MIN_SAFE_BPM, HIGH_BPM_THRESHOLD, 0.03, 0.1);

    const targetPulse = 1 + beatAmplitude * (sin(t * TWO_PI) ** 2);
    const smoothFactor = constrain(map(smoothedBpm, MIN_SAFE_BPM, MAX_SAFE_BPM, 0.1, 0.25), 0.1, 0.25);
    currentPulse = lerp(currentPulse, targetPulse, smoothFactor * timeIncrement * 60);

    if (smoothedBpm > HIGH_BPM_THRESHOLD) {
      calmPromptAlpha = lerp(calmPromptAlpha, 1, 0.05);
      // 限制粒子扭曲程度，防止过度变形
      particleDistortion = lerp(particleDistortion, 0.6, 0.019); // 从0.8降低到0.6
      highBpmParticleDecay = lerp(highBpmParticleDecay, 1, HIGH_BPM_DECAY_RATE);
      
      if (!isPlayingBreathing && breathingSound.isLoaded()) {
        breathingSound.loop();
        breathingSound.setVolume(0.5);
        isPlayingBreathing = true;
      }
      updateBreathIndicator();
    } else {
      calmPromptAlpha = lerp(calmPromptAlpha, 0, 0.05);
      particleDistortion = lerp(particleDistortion, 0, 0.019);
      highBpmParticleDecay = lerp(highBpmParticleDecay, 0, HIGH_BPM_DECAY_RATE);
      
      if (isPlayingBreathing) {
        breathingSound.stop();
        isPlayingBreathing = false;
      }
      stopBreathMovement();
    }
  } else {
    currentPulse = lerp(currentPulse, 1.0 + 0.01 * sin(t), 0.05);
    t += 0.005;
    calmPromptAlpha = 0;
    particleDistortion = lerp(particleDistortion, 0, 0.019);
    highBpmParticleDecay = lerp(highBpmParticleDecay, 0, HIGH_BPM_DECAY_RATE);
    
    if (isPlayingBreathing) {
      breathingSound.stop();
      isPlayingBreathing = false;
    }
    stopBreathMovement();
  }

  calmPrompt.style('opacity', calmPromptAlpha.toString());
  
  // 绘制顺序：心脏 → 呼吸粒子 → 土星环
  drawHeart();
  drawBreathParticleRing();
  drawSaturnRing();

  // 处理串口数据 - 添加异常值过滤
  if (port && port.opened()) {
    let data = port.readUntil("\n").trim();
    if (data && data.includes("BPM: ")) {
      let bpm = parseFloat(data.replace("BPM: ", "").trim());
      // 过滤异常值和跳变过大的值
      if (!isNaN(bpm) && bpm > MIN_SAFE_BPM - 10 && bpm < MAX_SAFE_BPM + 10) {
        // 限制单次BPM变化幅度，防止突变导致崩溃
        if (bpmValue === null || abs(bpm - bpmValue) < 20) {
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

// 绘制心脏 - 优化稳定性
function drawHeart() {
  push();
  // 限制心脏缩放比例，防止过大或过小
  const safeScale = constrain(currentPulse * 0.9, 0.8, 1.3);
  scale(safeScale);
  
  const heartColor = smoothedBpm > HIGH_BPM_THRESHOLD ? color(255, 50, 50) : color(255, 80, 80);
  for (let p of points) p.update();

  // 绘制连接线 - 添加距离限制优化
  for (let i = 0; i < numPoints; i++) {
    const a = points[i];
    // 只连接附近的点，减少计算量
    for (let j = i + 1; j < min(i + 20, numPoints); j++) { // 限制每次检查的点数
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
}


// 绘制土星环
function drawSaturnRing() {
  push();
  noFill();
  
  const ringScale = 1 + (breathRingScale - 1) * SATURN_RING_SCALE_FACTOR * (1 + highBpmParticleDecay * 0.5);
  scale(ringScale);
  
  const rotation = t * SATURN_RING_ROTATION_SPEED * (1 + highBpmParticleDecay * 0.3);
  
  const pulseIntensity = smoothedBpm > HIGH_BPM_THRESHOLD ? 0.03 : 0.005;
  const pulse = 1 + pulseIntensity * sin(t * 0.5);
  
  for (let layer = 0; layer < SATURN_RING_LAYER_COUNT; layer++) {
    const layerRatio = layer / (SATURN_RING_LAYER_COUNT - 1);
    const layerInnerRadius = SATURN_RING_INNER_RADIUS + layerRatio * (SATURN_RING_OUTER_RADIUS - SATURN_RING_INNER_RADIUS) * 0.8;
    const layerOuterRadius = layerInnerRadius + SATURN_RING_THICKNESS / SATURN_RING_LAYER_COUNT;
    
    const layerInnerColor = lerpColor(
      SATURN_RING_INNER_COLOR, 
      SATURN_RING_OUTER_COLOR, 
      particleDistortion * 0.7
    );
    const layerOuterColor = lerpColor(
      layerInnerColor, 
      SATURN_RING_OUTER_COLOR, 
      0.5
    );
    
    for (let line = 0; line < SATURN_RING_LINE_COUNT; line++) {
      const lineAngleOffset = (line / SATURN_RING_LINE_COUNT) * TWO_PI;
      const lineWidth = 0.8 + (line % 3) * 0.4;
      
      beginShape();
      for (let s = 0; s <= 120; s++) {
        const angle = (s / 120) * TWO_PI + lineAngleOffset + rotation;
        
        let radiusVariation = 1;
        const gapFactor = sin(angle * 4) * 0.5 + 0.5;
        radiusVariation *= 1 + gapFactor * 0.02;
        const noiseFactor = smoothedBpm > HIGH_BPM_THRESHOLD ? 0.06 : 0.01;
        radiusVariation *= 1 + noise(angle * 2, layer * 0.5, t * 0.1) * noiseFactor;
        
        const ringProgress = 0.5 + 0.5 * sin(angle * 2 + t * 0.3);
        const radius = lerp(layerInnerRadius, layerOuterRadius, ringProgress) * radiusVariation * pulse;
        
        const gradientRatio = map(radius, layerInnerRadius, layerOuterRadius, 0, 1);
        const currentColor = lerpColor(layerInnerColor, layerOuterColor, gradientRatio);
        
        const zFactor = smoothedBpm > HIGH_BPM_THRESHOLD ? 12 : 3;
        const z = (noise(angle * 1.5, layer * 0.3, t * 0.2) - 0.5) * zFactor;
        
        const x = cos(angle) * radius;
        const y = sin(angle) * radius;
        
        stroke(
          red(currentColor) * SATURN_RING_BRIGHTNESS,
          green(currentColor) * SATURN_RING_BRIGHTNESS,
          blue(currentColor) * SATURN_RING_BRIGHTNESS,
          180 + (layer % 2) * 40
        );
        strokeWeight(lineWidth);
        vertex(x, y, z);
      }
      endShape(CLOSE);
    }
  }
  
  drawRingInnerEdge();
  
  pop();
}

// 绘制环的内侧边缘
function drawRingInnerEdge() {
  const edgeR = sharedR * 1.1;
  const edgeG = sharedG * 1.1;
  const edgeB = sharedB * 1.1;
  const rotation = t * SATURN_RING_ROTATION_SPEED * 0.8 * (1 + highBpmParticleDecay * 0.3);
  
  stroke(edgeR, edgeG, edgeB, 120);
  strokeWeight(1.5);
  
  beginShape();
  for (let s = 0; s <= 100; s++) {
    const angle = (s / 100) * TWO_PI + rotation;
    const pulse = 1 + (smoothedBpm > HIGH_BPM_THRESHOLD ? 0.015 : 0.002) * sin(t * 0.5 + angle);
    const radius = SATURN_RING_INNER_RADIUS * pulse * (1 + 0.01 * sin(angle * 5 + t));
    const z = sin(angle * 2 + t) * 5;
    const x = cos(angle) * radius;
    const y = sin(angle) * radius;
    vertex(x, y, z + 5);
  }
  endShape(CLOSE);
}

// 处理点击事件
function mousePressed() {
  const x = map(mouseX, 0, width, -width/2, width/2);
  const y = map(mouseY, 0, height, -height/2, height/2);
  
  const particleCount = floor(random(50, 80));
  for (let i = 0; i < particleCount; i++) {
    clickParticles.push({
      pos: createVector(x, y, random(-50, 50)),
      vel: p5.Vector.random3D().mult(random(2, 6)),
      size: random(1, 3),
      alpha: 255,
      life: random(60, 120),
      maxLife: 0,
      trail: []
    });
    clickParticles[clickParticles.length - 1].maxLife = clickParticles[clickParticles.length - 1].life;
  }
}

// 更新点击粒子状态
function updateClickParticles() {
  for (let i = clickParticles.length - 1; i >= 0; i--) {
    const p = clickParticles[i];
    
    p.trail.unshift(createVector(p.pos.x, p.pos.y, p.pos.z));
    if (p.trail.length > 8) {
      p.trail.pop();
    }
    
    p.pos.add(p.vel);
    p.vel.y += 0.03;
    p.vel.mult(0.96);
    p.life--;
    
    p.alpha = map(p.life, 0, p.maxLife, 0, 255);
    
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
    for (let i = 0; i < p.trail.length; i++) {
      const trailPos = p.trail[i];
      const trailAlpha = p.alpha * (1 - i / p.trail.length) * 0.6;
      fill(255, 255, 255, trailAlpha);
      
      push();
      translate(trailPos.x, trailPos.y, trailPos.z);
      sphere(p.size * (1 - i / p.trail.length * 0.8));
      pop();
    }
    
    fill(255, 255, 255, p.alpha);
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(p.size);
    
    fill(255, 255, 255, p.alpha * 0.99);
    sphere(p.size * 0.8);
    pop();
  }
  
  pop();
}

// 呼吸引导动画
function updateBreathIndicator() {
  const breathCycle = 1.8;
  const cyclePhase = (t) % breathCycle;

  if (cyclePhase < breathCycle / 2) {
    breathRingScale = map(cyclePhase, 0, breathCycle / 2, 1.0, 1.0 + BREATH_RING_EXPAND);
  } else {
    breathRingScale = map(cyclePhase, breathCycle / 2, breathCycle, 1.0 + BREATH_RING_EXPAND, 1.0);
  }
}

// 停止呼吸运动
function stopBreathMovement() {
  breathRingScale = lerp(breathRingScale, 1.0 + BREATH_RING_EXPAND * 0.4, 0.1);
}

// 绘制粒子环
function drawBreathParticleRing() {
  push();
  noStroke();
  
  const baseRadius = BREATH_RING_BASE_SIZE * breathRingScale;
  const zOffset = sin(t * 1) * 10;
  
  const activityFactor = 1 - highBpmParticleDecay;
  
  if (breathParticles.length > 0) {
    const p = breathParticles[0];
    const normalBlueR = constrain(70 + p.hue * 2, 50, 120);
    const normalBlueG = constrain(180 + p.hue, 150, 200);
    const normalBlueB = constrain(240 + p.hue * 0.5, 220, 255);
    
    const redBase = 200 + p.hue * 0.5;
    const highBpmR = constrain(redBase + random(-30, 50), 180, 255);
    const highBpmG = constrain(redBase * 0.2, 20, 80);
    const highBpmB = constrain(redBase * 0.1, 10, 50);
    
    sharedR = lerp(normalBlueR, highBpmR, particleDistortion);
    sharedG = lerp(normalBlueG, highBpmG, particleDistortion);
    sharedB = lerp(normalBlueB, highBpmB, particleDistortion);
  }
  
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
    
    p.trail.unshift(createVector(x, y, z));
    const maxTrailLength = smoothedBpm > HIGH_BPM_THRESHOLD ? 8 : 5;
    if (p.trail.length > maxTrailLength) {
      p.trail.pop();
    }
    
    const sizeFactor = smoothedBpm > HIGH_BPM_THRESHOLD 
      ? 1 + (sin(t * 2.4 + p.angle) * 0.2) + (breathRingScale - 1) * 0.8
      : 1.1;
    
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
    
    for (let i = 0; i < p.trail.length; i++) {
      const trailPos = p.trail[i];
      const trailAlpha = alpha * (1 - i / p.trail.length) * 0.4;
      const trailSize = particleSize * (1 - i / p.trail.length * 0.7);
      
      fill(r, g, b, trailAlpha);
      push();
      translate(trailPos.x, trailPos.y, trailPos.z);
      sphere(trailSize);
      pop();
    }
    
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

// 心脏节点类 - 增强稳定性
class Node {
  constructor() {
    this.offset = createVector(random(1000), random(1000), random(1000));
    this.base = this.randomHeartPoint();
    this.pos = this.base.copy();
    // 添加位置限制，防止节点偏离太远
    this.maxJitter = 30;
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
    // 限制心率因子，防止过度抖动
    const heartRateFactor = smoothedBpm > HIGH_BPM_THRESHOLD 
      ? constrain(map(smoothedBpm, HIGH_BPM_THRESHOLD, MAX_SAFE_BPM, 1.2, 1.4), 1.2, 1.4) // 降低最大心率因子
      : 1.0;
    
    // 限制抖动幅度，高心率时也不会过度抖动
    const maxJitter = smoothedBpm > HIGH_BPM_THRESHOLD ? 15 : 10;
    const jitter = constrain(1.0 * (1.1 - currentPulse) * heartRateFactor * (1 - highBpmParticleDecay * 0.7), 0, maxJitter);
    
    // 计算新位置
    let newX = this.base.x + map(noise(this.offset.x + jitterTime), 0, 1, -jitter, jitter);
    let newY = this.base.y + map(noise(this.offset.y + jitterTime + 1000), 0, 1, -jitter, jitter);
    let newZ = this.base.z + map(noise(this.offset.z + jitterTime + 2000), 0, 1, -jitter, jitter);
    
    // 限制位置，防止节点偏离基础位置太远
    newX = constrain(newX, this.base.x - this.maxJitter, this.base.x + this.maxJitter);
    newY = constrain(newY, this.base.y - this.maxJitter, this.base.y + this.maxJitter);
    newZ = constrain(newZ, this.base.z - this.maxJitter/2, this.base.z + this.maxJitter/2);
    
    this.pos.x = newX;
    this.pos.y = newY;
    this.pos.z = newZ;
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

  const starSpeed = bpmValue ? map(smoothedBpm, MIN_SAFE_BPM, MAX_SAFE_BPM, 1, 4) * (1 - highBpmParticleDecay * 0.5) : 2;
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

    const flickerSize = 1 + totalFlicker * (STAR_FLICKER_SCALE - 1);
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
  if (key === 'h') bpmValue = 110;  // 测试高心率状态
  if (key === 'n') bpmValue = 80;   // 测试正常心率状态
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