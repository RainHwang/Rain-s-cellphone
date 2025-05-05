let buttons = [];
let dtmfMap;
let osc1, osc2;
let activeButton = null;
let fft;

let dialSequence = '';
let gameTriggered = false;
let gameTimer = 0;

function setup() {
  createCanvas(400, 600);
  textAlign(CENTER, CENTER);
  textSize(24);

  dtmfMap = {
    1: [697, 1209],
    2: [697, 1336],
    3: [697, 1477],
    4: [770, 1209],
    5: [770, 1336],
    6: [770, 1477],
    7: [852, 1209],
    8: [852, 1336],
    9: [852, 1477]
  };

  osc1 = new p5.Oscillator();
  osc2 = new p5.Oscillator();
  osc1.amp(0);
  osc2.amp(0);
  osc1.start();
  osc2.start();

  // 创建 FFT 对象用于频谱分析
  fft = new p5.FFT();

  let btnSize = 80;
  let startX = width / 2 - btnSize - 10;
  let startY = 250;
  let num = 1;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      buttons.push({
        x: startX + col * (btnSize + 20),
        y: startY + row * (btnSize + 20),
        size: btnSize,
        num: num,
        isActive: false
      });
      num++;
    }
  }
}

function draw() {
  setGradient(0, 0, width, height, color(255, 204, 204), color(204, 229, 255), 'Y');

  drawPhoneBody();
  drawHandset();

  for (let btn of buttons) {
    if (btn.isActive) {
      fill('#ff6666');
      strokeWeight(3);
    } else {
      fill('#ffffff');
      strokeWeight(1);
    }
    stroke(0);
    ellipse(btn.x, btn.y, btn.size);
    fill(0);
    noStroke();
    text(btn.num, btn.x, btn.y);
  }

  if (gameTriggered && millis() - gameTimer < 3000) {
    fill(255, 100, 0);
    textSize(20);
    text('🎉 Your call has been made！', width / 2, 160);
  }
  
  drawSpectrum();

  fill(50);
  textSize(20);
}

function mousePressed() {
  for (let btn of buttons) {
    let d = dist(mouseX, mouseY, btn.x, btn.y);
    if (d < btn.size / 2) {
      btn.isActive = true;
      activeButton = btn;
      playDTMF(btn.num);

      dialSequence += btn.num;
      if (dialSequence.length > 10) {
        dialSequence = dialSequence.slice(-10);
      }

      if (dialSequence.includes("123456") && !gameTriggered) {
        gameTriggered = true;
        gameTimer = millis();
      }
    }
  }
}

function mouseReleased() {
  if (activeButton) {
    activeButton.isActive = false;
    activeButton = null;
    stopDTMF();
  }
}

function playDTMF(num) {
  if (!dtmfMap[num]) return;
  let [f1, f2] = dtmfMap[num];
  osc1.freq(f1);
  osc2.freq(f2);
  osc1.amp(0.4, 0.05);
  osc2.amp(0.4, 0.05);
}

function stopDTMF() {
  osc1.amp(0, 0.2);
  osc2.amp(0, 0.2);
}

function drawPhoneBody() {
  fill(250, 100, 100);
  stroke(180, 50, 50);
  strokeWeight(4);
  rect(50, 180, 300, 360, 40);
}

function drawHandset() {
  fill(255, 100, 100);
  noStroke();
  arc(width / 2, 150, 260, 100, PI, TWO_PI, CHORD);
}

function drawSpectrum() {
  let spectrum = fft.analyze();
  noStroke();
  fill(0, 150);
  for (let i = 0; i < spectrum.length; i += 10) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -map(spectrum[i], 0, 255, 0, 100);
    rect(x, height - 20, width / spectrum.length * 10, h);
  }
}

function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();
  if (axis === 'Y') {
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  }
}