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

// === 🌌 NEW BACKGROUND PULSE VARIABLES ===
let bgBaseColor;    // darkest tone
let bgPulseColor;   // glowing pulse color
let pulseSpeed = 1; // speed controlled by BPM

function preload() {
  breathingSound = loadSound("assets/Breathing.mp3"); // adjust path if needed
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noFill();
  strokeWeight(1);

  // 🌌 initialize background colors (different red than heart)
  bgBaseColor = color(34,10,10);     // deep violet-black
  bgPulseColor = color(89, 15, 3);   // magenta-red glow (distinct from heart)

  for (let i = 0; i < numPoints; i++) {
    points.push(new Node());
  }

  // --- Serial setup ---
  port = createSerial();
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);
  connectBtn.style('z-index', '100');
}


function draw() {
  // === 🌌 BACKGROUND PULSE CONTROLLED BY BPM ===
  pulseSpeed = map(bpmValue, 50, 150, 0.5, 3.5); // faster BPM → faster pulse
  let bgPulse = (sin(t * pulseSpeed) + 1) / 2;   // oscillates 0-1
  let currentBG = lerpColor(bgBaseColor, bgPulseColor, bgPulse);
  background(currentBG);

  // === SERIAL READING (unchanged) ===
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

  // === HEART SCALING BASED ON BPM ===
  let targetScale = map(bpmValue, 40, 180, 0.8, 2.5);
  targetScale = constrain(targetScale, 0.5, 3.0);
  currentScale = lerp(currentScale, targetScale, 0.1);
  scale(currentScale);

  // === HEART DRAWING (original) ===
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
if (bpmValue > 100) { // You can change threshold here
  if (!isPlayingBreathing) {
    breathingSound.loop(); // gentle loop
    isPlayingBreathing = true;
  }
} else {
  // Calm zone → fade out sound
  if (isPlayingBreathing) {
    breathingSound.stop();
    isPlayingBreathing = false;
  }
}

}


// === HEART POINT NODE CLASS (unchanged) ===
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
    this.pos.x = this.base.x + map(noise(this.offset.x + t * 0.35), 0, 1, -5, 5);
    this.pos.y = this.base.y + map(noise(this.offset.y + t * 0.35), 0, 1, -5, 5);
    this.pos.z = this.base.z + map(noise(this.offset.z + t * 0.35), 0, 1, -8, 8);
  }
}


// === SERIAL BUTTON FUNCTION (unchanged) ===
function connectBtnClick(e) {
  if (!port.opened()) {
    port.open(115200); // must match Arduino baud rate
    e.target.innerHTML = "Disconnect from Arduino";
    e.target.classList.add("connected");
  } else {
    port.close();
    e.target.innerHTML = "Connect to Arduino";
    e.target.classList.remove("connected");
  }
}


// === UTILITIES (unchanged) ===
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    fullscreen(!fullscreen());
  }
}
// -------------------------------------------------------------------------
// // === ORIGINAL HEART & SENSOR VARIABLES ===
// let points = [];
// let numPoints = 220;
// let connectDist = 150;
// let t = 0.015;
// let currentScale = 1;
// let breathingSound;
// let isPlayingBreathing = false;
// let calmAlertSound; // 新增提示音

// // Serial communication variables
// let port;
// let connectBtn;
// let sensorVal = 0; 
// let bpmValue = 60; // Stores valid BPM value, default 60
// let bpmSmooth = 60; // 平滑后的BPM，避免抖动误触发

// // === 🌌 ADVANCED VISUAL & ALERT VARIABLES ===
// // 背景脉冲增强
// let bgBaseColor;
// let bgPulseColor;
// let bgAlertColor; // 警戒色（BPM>120时触发）
// let pulseSpeed = 1;

// // 冷静提示相关
// let calmAlertActive = false;
// let alertFade = 0; // 提示淡入淡出控制
// let breathGuideRadius = 0; // 呼吸引导圈大小
// let breathGuidePhase = 0; // 呼吸引导动画相位（吸气→呼气循环）
// let alertShake = 0; // 屏幕抖动强度

// // 心形破碎效果（BPM过高时）
// let fractureIntensity = 0; // 破碎强度（0-1）
// let maxFracture = 0.6; // 最大破碎程度

// // 粒子警示效果
// let alertParticles = []; // 额外的警示粒子
// let spawnAlertParticle = false;

// function preload() {
//   breathingSound = loadSound("assets/Breathing.mp3");
//   calmAlertSound = loadSound("assets/alert-tone.mp3"); // 提示音
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight, WEBGL);
//   noFill();
//   strokeWeight(1);

//   // 颜色系统升级：区分正常/警戒状态
//   bgBaseColor = color(34, 10, 10);       // 正常深色背景
//   bgPulseColor = color(89, 15, 3);       // 正常脉冲色（暗红）
//   bgAlertColor = color(200, 0, 50);      // 警戒背景色（亮红）

//   // 创建心形粒子
//   for (let i = 0; i < numPoints; i++) {
//     points.push(new Node());
//   }

//   // 串口设置（优化样式）
//   port = createSerial();
//   connectBtn = createButton("Connect to Arduino");
//   connectBtn.position(20, 20);
//   connectBtn.mousePressed(connectBtnClick);
//   connectBtn.style('z-index', '100');
//   connectBtn.style('padding', '8px 12px');
//   connectBtn.style('font-size', '14px');
//   connectBtn.style('background', '#333');
//   connectBtn.style('color', 'white');
//   connectBtn.style('border', 'none');
//   connectBtn.style('border-radius', '4px');
//   connectBtn.style('cursor', 'pointer');

//   // 初始化警示粒子池
//   for (let i = 0; i < 30; i++) {
//     alertParticles.push(new AlertParticle());
//   }
// }

// function draw() {
//   // === 1. BPM数据处理（平滑化，避免抖动） ===
//   bpmSmooth = lerp(bpmSmooth, bpmValue, 0.08);
//   bpmSmooth = constrain(bpmSmooth, 40, 200);

//   // === 2. 状态判断：是否触发冷静提示（BPM>120） ===
//   const prevAlertState = calmAlertActive;
//   calmAlertActive = bpmSmooth > 120;
  
//   // 首次触发时播放提示音
//   if (calmAlertActive && !prevAlertState) {
//     calmAlertSound.play();
//     calmAlertSound.setVolume(0.5);
//   }

//   // 破碎强度映射：BPM 120→0，BPM 160→maxFracture
//   fractureIntensity = map(bpmSmooth, 120, 160, 0, maxFracture);
//   fractureIntensity = constrain(fractureIntensity, 0, maxFracture);

//   // === 3. 背景效果（正常/警戒切换） ===
//   pulseSpeed = map(bpmSmooth, 50, 150, 0.5, 4); // BPM越高，脉冲越快
//   let bgPulse = (sin(t * pulseSpeed) + 1) / 2;
  
//   // 正常/警戒背景混合
//   let currentBG;
//   if (calmAlertActive) {
//     // 警戒状态：背景脉冲+警戒色叠加，添加抖动
//     alertFade = lerp(alertFade, 1, 0.05);
//     alertShake = map(bpmSmooth, 120, 160, 0, 8); // BPM越高抖动越剧烈
//     currentBG = lerpColor(bgBaseColor, bgAlertColor, bgPulse * 0.8 + alertFade * 0.4);
//   } else {
//     // 正常状态：淡入正常背景
//     alertFade = lerp(alertFade, 0, 0.03);
//     alertShake = lerp(alertShake, 0, 0.1);
//     currentBG = lerpColor(bgBaseColor, bgPulseColor, bgPulse);
//   }
  
//   // 应用背景和抖动
//   background(currentBG);
//   translate(random(-alertShake, alertShake), random(-alertShake, alertShake), 0);

//   // === 4. 串口数据读取 ===
//   if (port && port.opened()) {
//     let data = port.readUntil("\n").trim();
//     if (data && data.includes("BPM: ")) {
//       let bpmStr = data.replace("BPM: ", "").trim();
//       let bpm = parseFloat(bpmStr);
//       if (!isNaN(bpm)) {
//         bpmValue = bpm;
//         spawnAlertParticle = calmAlertActive; // BPM>120时触发粒子生成
//       }
//     }
//   }

//   // === 5. 心形控制（大小+破碎效果） ===
//   let targetScale = map(bpmSmooth, 40, 180, 0.8, 2.8);
//   targetScale = constrain(targetScale, 0.5, 3.2);
//   currentScale = lerp(currentScale, targetScale, 0.1);
//   scale(currentScale);

//   // 轻微旋转（增强3D感，警戒时更剧烈）
//   rotateY(t * 0.5 + alertShake * 0.01);
//   rotateX(sin(t * 0.1) * 0.03 + alertShake * 0.005);

//   // 颜色脉冲（警戒时增强对比度）
//   let pulse = abs(sin(t * 2.2)) * 0.9 + abs(sin(t * 1.1)) * 0.6;
//   pulse = calmAlertActive ? pulse * 1.5 : pulse; // 警戒时亮度波动更大
//   pulse = constrain(pulse, 0.35, 1.8);

//   // === 6. 心形粒子更新（添加破碎位移） ===
//   for (let p of points) {
//     p.update(fractureIntensity);
//   }

//   // === 7. 绘制心形连接（破碎时减少连接） ===
//   let dynamicConnectDist = map(fractureIntensity, 0, maxFracture, connectDist, 80);
//   for (let i = 0; i < numPoints; i++) {
//     const a = points[i];
//     for (let j = i + 1; j < numPoints; j++) {
//       const b = points[j];
//       const d = dist(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
//       if (d < dynamicConnectDist) {
//         const alpha = map(d, 0, dynamicConnectDist, 230, 0) * (1 - fractureIntensity * 0.5);
//         // 警戒时颜色更鲜艳（亮红→深红）
//         const bright = calmAlertActive ? color(255, 40, 40, alpha) : color(255 * pulse, 80 * pulse, 80 * pulse, alpha);
//         const deep = calmAlertActive ? color(180, 0, 0, alpha * 0.9) : color(120 * pulse, 0, 0, alpha * 0.9);
//         stroke(lerpColor(bright, deep, d / dynamicConnectDist));
//         const weight = map(d, 0, dynamicConnectDist, 1.4, 0.25) * (1 - fractureIntensity * 0.6);
//         strokeWeight(max(weight, 0.1));
//         line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
//       }
//     }
//   }

//   // 绘制心形粒子（警戒时更亮）
//   const particleAlpha = calmAlertActive ? 150 : 100;
//   stroke(calmAlertActive ? color(255, 60, 60, particleAlpha) : color(200 * pulse, 40 * pulse, 40 * pulse, particleAlpha));
//   strokeWeight(calmAlertActive ? 2.5 : 2);
//   for (let p of points) {
//     point(p.pos.x, p.pos.y, p.pos.z);
//   }

//   // === 8. 警戒状态专属效果（BPM>120） ===
//   if (calmAlertActive) {
//     // 8.1 呼吸引导圈（2D叠加，不影响3D心形）
//     drawBreathGuide();
    
//     // 8.2 冷静提示文字（淡入+抖动）
//     drawCalmDownText();
    
//     // 8.3 警示粒子（从心形边缘扩散）
//     updateAlertParticles();
    
//     // 8.4 心形额外抖动
//     rotateZ(sin(t * 10) * fractureIntensity * 0.1);
//   } else {
//     // 非警戒时重置警示粒子
//     for (let p of alertParticles) {
//       p.reset();
//     }
//   }

//   // === 9. 呼吸音效控制（优化逻辑） ===
//   if (calmAlertActive) {
//     if (!isPlayingBreathing) {
//       breathingSound.loop();
//       breathingSound.setVolume(0.6); // 降低音量避免突兀
//       isPlayingBreathing = true;
//     }
//     // 呼吸引导动画同步音效节奏
//     breathGuidePhase += 0.02;
//   } else {
//     if (isPlayingBreathing) {
//       breathingSound.fade(0, 1); // 1秒淡出
//       isPlayingBreathing = false;
//     }
//   }

//   t += 0.01;
// }

// // === 新增：呼吸引导圈（帮助用户冷静） ===
// function drawBreathGuide() {
//   push();
//   resetMatrix(); // 重置3D矩阵，在2D层面绘制
//   translate(width / 2, height / 2);

//   // 呼吸动画：吸气（放大）→ 呼气（缩小），4秒一个循环
//   let breath = sin(breathGuidePhase) * 0.5 + 0.5;
//   breathGuideRadius = map(breath, 0, 1, 80, 200);

//   // 外圈（半透明）
//   stroke(bgAlertColor, 80);
//   strokeWeight(2);
//   noFill();
//   ellipse(0, 0, breathGuideRadius * 2);

//   // 内圈（跟随呼吸）
//   stroke(255, 100);
//   strokeWeight(1);
//   ellipse(0, 0, breathGuideRadius * 1.2);

//   // 呼吸提示文字（同步节奏）
//   fill(255, 200);
//   noStroke();
//   textAlign(CENTER, CENTER);
//   textSize(16);
//   let breathText = breath > 0.8 ? "Exhale" : breath < 0.2 ? "Inhale" : "Hold";
//   text(breathText, 0, breathGuideRadius + 30);

//   pop();
// }

// // === 新增：冷静提示文字（抖动+渐变） ===
// function drawCalmDownText() {
//   push();
//   resetMatrix();
//   translate(width / 2, height / 2 - 200);

//   // 文字抖动效果
//   let shakeX = random(-alertShake * 0.5, alertShake * 0.5);
//   let shakeY = random(-alertShake * 0.5, alertShake * 0.5);
//   translate(shakeX, shakeY);

//   // 渐变文字（外发光效果）
//   fill(255, 50, 50, alertFade * 255);
//   noStroke();
//   textAlign(CENTER, CENTER);
//   textSize(48 + sin(t * 5) * 4); // 轻微大小波动
//   textStyle(BOLD);
//   text("CALM DOWN", 0, 0);

//   // 副标题
//   fill(255, 150 * alertFade);
//   textSize(18);
//   textStyle(NORMAL);
//   text("Follow the breathing guide →", 0, 60);

//   // 显示当前BPM值
//   textSize(22);
//   text(`Current BPM: ${floor(bpmSmooth)}`, 0, 100);

//   pop();
// }

// // === 新增：警示粒子类（BPM过高时扩散） ===
// class AlertParticle {
//   constructor() {
//     this.pos = createVector(0, 0, 0);
//     this.vel = p5.Vector.random3D();
//     this.life = 0;
//     this.maxLife = random(60, 120);
//     this.size = random(2, 4);
//   }

//   update() {
//     if (this.life > 0) {
//       // 从心形边缘向外扩散
//       this.vel.mult(1.02); // 逐渐加速
//       this.pos.add(this.vel);
//       this.life--;
//     } else if (spawnAlertParticle) {
//       // 从心形随机点生成
//       let randomNode = points[floor(random(points.length))];
//       this.pos = randomNode.pos.copy();
//       this.vel = p5.Vector.random3D().mult(random(1, 3));
//       this.life = this.maxLife;
//     }
//   }

//   draw() {
//     if (this.life > 0) {
//       push();
//       translate(this.pos.x, this.pos.y, this.pos.z);
//       let alpha = map(this.life, 0, this.maxLife, 0, 150);
//       stroke(255, 0, 50, alpha);
//       strokeWeight(this.size);
//       point(0, 0);
//       pop();
//     }
//   }

//   reset() {
//     this.life = 0;
//   }
// }

// // === 新增：更新警示粒子 ===
// function updateAlertParticles() {
//   for (let p of alertParticles) {
//     p.update();
//     p.draw();
//   }
//   spawnAlertParticle = false; // 避免重复生成
// }

// // === 心形粒子类（新增破碎效果） ===
// class Node {
//   constructor() {
//     this.offset = createVector(random(1000), random(1000), random(1000));
//     this.base = this.randomHeartPoint();
//     this.pos = this.base.copy();
//     this.fractureDir = p5.Vector.random3D(); // 随机破碎方向
//   }

//   randomHeartPoint() {
//     let x = random(-1.3, 1.3);
//     let y = random(-1.2, 1.5);
//     let f = Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
//     let tries = 0;
//     while (f > 0 && tries < 50) {
//       x = random(-1.3, 1.3);
//       y = random(-1.2, 1.5);
//       f = Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
//       tries++;
//     }
//     const X = x * 250;
//     const Y = -y * 250;
//     const zRange = map(abs(x), 0, 1.3, 80, 40);
//     const Z = random(-zRange, zRange);
//     return createVector(X, Y, Z);
//   }

//   // 新增：破碎位移逻辑
//   update(fracture) {
//     // 基础微动
//     let noiseX = map(noise(this.offset.x + t * 0.35), 0, 1, -5, 5);
//     let noiseY = map(noise(this.offset.y + t * 0.35), 0, 1, -5, 5);
//     let noiseZ = map(noise(this.offset.z + t * 0.35), 0, 1, -8, 8);

//     // 破碎位移：强度越高，粒子偏离基础位置越远
//     let fractureX = this.fractureDir.x * fracture * 120;
//     let fractureY = this.fractureDir.y * fracture * 120;
//     let fractureZ = this.fractureDir.z * fracture * 120;

//     // 最终位置 = 基础位置 + 微动 + 破碎位移
//     this.pos.x = this.base.x + noiseX + fractureX;
//     this.pos.y = this.base.y + noiseY + fractureY;
//     this.pos.z = this.base.z + noiseZ + fractureZ;
//   }
// }

// // === 串口连接按钮事件 ===
// // function connectBtnClick(e) {
// //   if (!port.opened()) {
// //     port.requestPort().then(() => {
// //       port.open(115200).then(() => {
// //         e.target.innerHTML = "Disconnect from Arduino";
// //         e.target.classList.add("connected");
// //         e.target.style.background = "#4CAF50";
// //       }).catch(err => {
// //         console.error("Port open error:", err);
// //         alert("Connection failed: " + err.message);
// //       });
// //     }).catch(err => {
// //       console.error("Port select error:", err);
// //     });
// //   } else {
// //     port.close();
// //     e.target.innerHTML = "Connect to Arduino";
// //     e.target.classList.remove("connected");
// //     e.target.style.background = "#333";
// //   }
// // }
// function connectBtnClick(e) {
//   if (!port.opened()) {
//     port.open(115200); // must match Arduino baud rate
//     e.target.innerHTML = "Disconnect from Arduino";
//     e.target.classList.add("connected");
//   } else {
//     port.close();
//     e.target.innerHTML = "Connect to Arduino";
//     e.target.classList.remove("connected");
//   }
// }

// // === 窗口大小调整 ===
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }

// // === 全屏切换 ===
// function keyPressed() {
//   if (key === 'f' || key === 'F') {
//     fullscreen(!fullscreen());
//   }
// }


// let bpmValue = 100; // ❤️ 心跳速度
// let targetPulse = 0;
// let currentPulse = 0; // 平滑心跳值
// let lastBeatTime = 0;
// let t = 0;
// let smokeLines = [];
// let uiElements = {
//   bpmSlider: null,
//   infoPanel: null,
//   title: null
// };

// let colors = {}; // 延迟在 setup() 里初始化

// // 💨 烟雾波线类
// class SmokeLine {
//   constructor() {
//     this.reset();
//     this.color = random() > 0.5 ? colors.smoke.primary : colors.smoke.secondary;
//   }

//   reset() {
//     this.radius = random(50, 150);
//     this.currentRadius = this.radius;
//     this.angleOffset = random(TWO_PI);
//     this.alpha = random(40, 120);
//     this.currentAlpha = this.alpha;
//     this.noiseSeed = random(1000);
//     this.waveCount = int(random(20, 40));
//     this.offsetX = random(1000);
//     this.offsetY = random(1000);
//     this.expandSpeed = random(0.3, 1.0);
//     this.thickness = random(0.8, 2.2);
//   }

//   update(time, pulse) {
//     let heartEffect = pulse * random(5, 20);
//     let noiseRadius = map(
//       noise(this.offsetX + time * 0.5, this.offsetY + time * 0.5),
//       0,
//       1,
//       -15,
//       15
//     );

//     this.currentRadius += this.expandSpeed + heartEffect * 0.1;
//     this.currentRadius += noiseRadius * 0.3;

//     let baseAlpha = map(this.currentRadius, 0, max(width, height), 120, 10);
//     this.currentAlpha = lerp(this.currentAlpha, baseAlpha + pulse * 20, 0.05);

//     if (this.currentRadius > max(width, height) * 0.8) {
//       this.reset();
//     }
//   }

//   display() {
//     stroke(
//       hue(this.color),
//       saturation(this.color),
//       brightness(this.color),
//       this.currentAlpha
//     );
//     strokeWeight(this.thickness + currentPulse * 0.5);
//     strokeCap(ROUND);
//     noFill();

//     beginShape();
//     for (let i = 0; i < this.waveCount; i++) {
//       let a = (TWO_PI / this.waveCount) * i + this.angleOffset;
//       let n = noise(
//         cos(a) + this.noiseSeed,
//         sin(a) + this.noiseSeed,
//         t * 0.5
//       );
//       let r = this.currentRadius + map(n, 0, 1, -20, 20);
//       let x = r * cos(a);
//       let y = r * sin(a);
//       curveVertex(x, y);
//     }
//     endShape(CLOSE);

//     if (this.currentAlpha > 30 && random() > 0.7) {
//       stroke(
//         hue(this.color),
//         saturation(this.color),
//         brightness(this.color),
//         this.currentAlpha * 0.5
//       );
//       strokeWeight(this.thickness * 0.3);
//       beginShape();
//       for (let i = 0; i < this.waveCount; i++) {
//         let a = (TWO_PI / this.waveCount) * i + this.angleOffset + PI / 4;
//         let n = noise(
//           cos(a) + this.noiseSeed + 500,
//           sin(a) + this.noiseSeed + 500,
//           t * 0.5
//         );
//         let r = this.currentRadius * 0.8 + map(n, 0, 1, -15, 15);
//         let x = r * cos(a);
//         let y = r * sin(a);
//         curveVertex(x, y);
//       }
//       endShape(CLOSE);
//     }
//   }
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   colorMode(HSB, 360, 100, 100, 255);
//   noFill();

//   // 初始化颜色
//   colors = {
//     heart: {
//       main: color(0, 90, 100, 255),
//       glow: color(0, 80, 90, 150),
//       highlight: color(350, 100, 100, 200)
//     },
//     smoke: {
//       primary: color(200, 90, 100, 120),
//       secondary: color(260, 80, 80, 80),
//       glow: color(180, 70, 90, 50)
//     },
//     ui: {
//       background: color(0, 0, 10, 200),
//       text: color(360, 0, 100, 255),
//       accent: color(200, 90, 100, 255)
//     }
//   };

//   // 初始化烟雾线
//   for (let i = 0; i < 150; i++) {
//     smokeLines.push(new SmokeLine());
//   }

//   // 创建UI
//   createUI();
// }

// function draw() {
//   background(260, 40, 10, 30);
//   translate(width / 2, height / 2);

//   let beatInterval = (60 / bpmValue) * 1000;
//   let now = millis();
//   if (now - lastBeatTime > beatInterval) {
//     lastBeatTime = now;
//     targetPulse = 1.5;
//     createHeartRipple();
//   }

//   currentPulse = lerp(currentPulse, targetPulse, 0.08);
//   targetPulse *= 0.92;

//   t += 0.01;

//   drawBackgroundGlow();

//   for (let s of smokeLines) {
//     s.update(t, currentPulse);
//     s.display();
//   }

//   drawHeart(currentPulse);
//   updateUI();
// }
// // 创建UI元素
// function createUI() {
//   // BPM控制滑块
//   uiElements.bpmSlider = createSlider(60, 180, 100, 1);
//   uiElements.bpmSlider.position(20, 20);
//   uiElements.bpmSlider.style('width', '200px');
//   uiElements.bpmSlider.style('accent-color', '#64d2ff');
//   uiElements.bpmSlider.input(() => {
//     bpmValue = uiElements.bpmSlider.value();
//   });

//   // 信息面板
//   uiElements.infoPanel = createDiv('');
//   uiElements.infoPanel.position(20, 60);
//   uiElements.infoPanel.style('background-color', `rgba(${red(colors.ui.background)}, ${green(colors.ui.background)}, ${blue(colors.ui.background)}, 0.8)`);
//   uiElements.infoPanel.style('padding', '10px 15px');
//   uiElements.infoPanel.style('border-radius', '8px');
//   uiElements.infoPanel.style('color', `rgb(${red(colors.ui.text)}, ${green(colors.ui.text)}, ${blue(colors.ui.text)})`);
//   uiElements.infoPanel.style('font-family', 'system-ui, sans-serif');
//   uiElements.infoPanel.style('box-shadow', '0 4px 12px rgba(0,0,0,0.2)');

//   // 标题
//   uiElements.title = createDiv('心率可视化');
//   uiElements.title.position(width - 180, 20);
//   uiElements.title.style('color', `rgb(${red(colors.ui.text)}, ${green(colors.ui.text)}, ${blue(colors.ui.text)})`);
//   uiElements.title.style('font-family', 'system-ui, sans-serif');
//   uiElements.title.style('font-size', '18px');
//   uiElements.title.style('font-weight', 'bold');
//   uiElements.title.style('text-shadow', '0 0 8px rgba(100, 210, 255, 0.6)');
// }

// // 更新UI信息
// function updateUI() {
//   const beatsPerSecond = (bpmValue / 60).toFixed(1);
//   uiElements.infoPanel.html(`
//     <div>心率: <span style="color: rgb(${red(colors.ui.accent)}, ${green(colors.ui.accent)}, ${blue(colors.ui.accent)})">${bpmValue}</span> BPM</div>
//     <div>每秒心跳: ${beatsPerSecond}</div>
//     <div style="font-size: 12px; margin-top: 5px;">拖动滑块调整心率</div>
//   `);
// }

// // 绘制背景光晕
// function drawBackgroundGlow() {
//   push();
//   noStroke();
  
//   // 外层大光晕
//   fill(colors.smoke.glow);
//   ellipse(0, 0, 600 + currentPulse * 50, 600 + currentPulse * 50);
  
//   // 内层光晕
//   fill(colors.heart.glow);
//   ellipse(0, 0, 300 + currentPulse * 100, 300 + currentPulse * 100);
//   pop();
// }

// // 绘制心形波纹
// function createHeartRipple() {
//   push();
//   noFill();
//   stroke(colors.heart.highlight);
//   strokeWeight(2);
  
//   // 动态生成波纹
//   for (let i = 0; i < 3; i++) {
//     let size = 120 + i * 40;
//     ellipse(0, 0, size, size);
//   }
//   pop();
// }

// // ❤️ 心形（增强视觉效果）
// function drawHeart(pulse) {
//   push();
//   const scaleVal = 5 + pulse * 4;
//   scale(scaleVal);
  
//   // 心形光晕
//   strokeWeight(4 + pulse * 3);
//   stroke(colors.heart.glow);
//   beginShape();
//   for (let theta = 0; theta < TWO_PI; theta += 0.05) {
//     let x = 16 * pow(sin(theta), 3);
//     let y = 13 * cos(theta) - 5 * cos(2 * theta) - 2 * cos(3 * theta) - cos(4 * theta);
//     vertex(x, -y);
//   }
//   endShape(CLOSE);
  
//   // 心形主体
//   strokeWeight(2 + pulse * 1.5);
//   stroke(colors.heart.main);
//   beginShape();
//   for (let theta = 0; theta < TWO_PI; theta += 0.05) {
//     let x = 16 * pow(sin(theta), 3);
//     let y = 13 * cos(theta) - 5 * cos(2 * theta) - 2 * cos(3 * theta) - cos(4 * theta);
//     vertex(x, -y);
//   }
//   endShape(CLOSE);
  
//   // 心形高光
//   strokeWeight(1 + pulse);
//   stroke(colors.heart.highlight);
//   beginShape();
//   for (let theta = 0; theta < TWO_PI; theta += 0.05) {
//     let x = 15 * pow(sin(theta), 3); // 稍小一点的高光
//     let y = 12 * cos(theta) - 4 * cos(2 * theta) - 2 * cos(3 * theta) - cos(4 * theta);
//     vertex(x, -y);
//   }
//   endShape(CLOSE);
//   pop();
// }

// // // 💨 烟雾波线类（增强视觉效果）
// // class SmokeLine {
// //   constructor() {
// //     this.reset();
// //     // 随机选择烟雾颜色，增加变化
// //     this.color = random() > 0.5 ? colors.smoke.primary : colors.smoke.secondary;
// //   }

// //   reset() {
// //     this.radius = random(50, 150); // 初始距离心脏
// //     this.currentRadius = this.radius;
// //     this.angleOffset = random(TWO_PI);
// //     this.alpha = random(40, 120);
// //     this.currentAlpha = this.alpha;
// //     this.noiseSeed = random(1000);
// //     this.waveCount = int(random(20, 40));
// //     this.offsetX = random(1000);
// //     this.offsetY = random(1000);
// //     this.expandSpeed = random(0.3, 1.0); // 每条烟雾的扩散速度
// //     this.thickness = random(0.8, 2.2); // 线条粗细变化
// //   }

// //   update(time, pulse) {
// //     // 心跳叠加扩散
// //     let heartEffect = pulse * random(5, 20);

// //     // 噪声产生自然漂浮效果
// //     let noiseRadius = map(
// //       noise(this.offsetX + time * 0.5, this.offsetY + time * 0.5),
// //       0,
// //       1,
// //       -15,
// //       15
// //     );

// //     // 不断扩散
// //     this.currentRadius += this.expandSpeed + heartEffect * 0.1;
// //     this.currentRadius += noiseRadius * 0.3;

// //     // alpha随心跳微幅变化，越远越透明
// //     let baseAlpha = map(this.currentRadius, 0, max(width, height), 120, 10);
// //     this.currentAlpha = lerp(this.currentAlpha, baseAlpha + pulse * 20, 0.05);

// //     // 超出屏幕重置
// //     if (this.currentRadius > max(width, height) * 0.8) {
// //       this.reset();
// //     }
// //   }

// //   display() {
// //     stroke(
// //       hue(this.color), 
// //       saturation(this.color), 
// //       brightness(this.color), 
// //       this.currentAlpha
// //     );
// //     strokeWeight(this.thickness + currentPulse * 0.5);
// //     strokeCap(ROUND);
// //     noFill();

// //     beginShape();
// //     for (let i = 0; i < this.waveCount; i++) {
// //       let a = (TWO_PI / this.waveCount) * i + this.angleOffset;
// //       let n = noise(
// //         cos(a) + this.noiseSeed,
// //         sin(a) + this.noiseSeed,
// //         t * 0.5
// //       );
// //       let r = this.currentRadius + map(n, 0, 1, -20, 20);
// //       let x = r * cos(a);
// //       let y = r * sin(a);
// //       curveVertex(x, y);
// //     }
// //     endShape(CLOSE);

// //     // 烟雾内部细线条，增强层次感
// //     if (this.currentAlpha > 30 && random() > 0.7) {
// //       stroke(
// //         hue(this.color), 
// //         saturation(this.color), 
// //         brightness(this.color), 
// //         this.currentAlpha * 0.5
// //       );
// //       strokeWeight(this.thickness * 0.3);
// //       beginShape();
// //       for (let i = 0; i < this.waveCount; i++) {
// //         let a = (TWO_PI / this.waveCount) * i + this.angleOffset + PI/4;
// //         let n = noise(
// //           cos(a) + this.noiseSeed + 500,
// //           sin(a) + this.noiseSeed + 500,
// //           t * 0.5
// //         );
// //         let r = (this.currentRadius * 0.8) + map(n, 0, 1, -15, 15);
// //         let x = r * cos(a);
// //         let y = r * sin(a);
// //         curveVertex(x, y);
// //       }
// //       endShape(CLOSE);
// //     }
// //   }
// // }

// // 响应窗口大小变化
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   if (uiElements.title) {
//     uiElements.title.position(width - 180, 20);
//   }
// }