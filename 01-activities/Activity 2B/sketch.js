let wave = false;
let obColor;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background('#DAF6DC');
 let obColor = ('#CDDC39');

  for (let i = 0; i < width; i += 50) {
    

    let triHeight = (i % 100 == 0) ? 60 : 30;

    let baseY = height / 2;

    if (wave) {
      let wavee = sin(frameCount * 0.1 + i * 0.1) * 20; // amplitude of 20
      baseY += wavee;
    }
       
    let baseZ = height / 2.1;
    
     if (wave) {
      let wavee = sin(frameCount * 0.1 + i * 0.1) * 90; // amplitude of 20
      baseZ += wavee;
    }

    let baseX = height / 2.3;
    
     if (wave) {
      let wavee = sin(frameCount * 0.1 + i * 0.1) * 20; // amplitude of 20
      baseX += wavee;
    }
    
    fill('#92994B');
    triangle( i + 5, baseY+70, i + 35, baseY+70, i + 20, baseY + 70 - triHeight);
    
      fill('#374B27');
    triangle( i + 5, baseZ, i + 35, baseZ, i + 20, baseZ - triHeight);
      fill('#F8FAE0');
    triangle( i + 5, baseX - 60, i + 35, baseX - 60, i + 20, baseX - 60 - triHeight);
    
  }
}


function mousePressed() {
  obColor = ('#673AB7');
  wave = true;
}

function keyPressed() {
  obColor = ('#673AB7');
  wave = false;
}
