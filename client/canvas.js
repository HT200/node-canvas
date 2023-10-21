let colorUIRadius = 60;
let colorUISelectedStrokeWeight = 3;
let colorUIDistance;
let isHover;
let isInCanvas;
let isDrawing = false;
let currentHover = -1;
let currentColor = 0;
let colors = ['black', 'white', 'red', 'green', 'blue', 'brown'];
let strokes = [];
let lines = [];
let redos = [];
let sw;
let smouseX, smouseY;
let minLength = 1;
let slider;
let buttons = [];
let sButton, gButton;
let canvas;
let isGallery = false;
let isCtxLoaded = false;
let currentPage = 0;
let ctxs;
let pageCount = 0;


function setup() {
	canvas = createCanvas(600, 600);
	colorUIDistance = 500 / colors.length;

  // Create width slider
	slider = createSlider(1, 10, 5, 1);
	slider.position(window.innerWidth / 2 + 209, window.innerHeight/2 + 200 + colorUIRadius);
	slider.style('width', '80px');

  // Create UI buttons
  buttons.push(createDOMButton('Undo', 210, -270, 80, 40, 27, undoButton));
	buttons.push(createDOMButton('Redo', 210, -210, 80, 40, 27, redoButton));
	buttons.push(createDOMButton('Reset', 210, -150, 80, 40, 25, resetButton));

  // Create p5.js graphics
  resetGraphics();

  const nameForm = document.querySelector("#nameForm");
  gButton = document.querySelector('.gallery');
  
  // Post drawing event
  const addDrawing = (e) => {
    e.preventDefault();
    sendPost(nameForm);
    return false;
  }

  const getDrawing = (e) => {
    // Update gallery button and UI
    if (!isGallery){
      buttons.forEach(b => b.obj.hide());
      slider.hide();
      gButton.innerHTML = 'Back to Drawing';
      currentPage = 0;
      isCtxLoaded = false;

      // Get drawing event
      e.preventDefault();
      requestUpdate();
    }
    else {
      isGallery = false;
      buttons.forEach(b => b.obj.show());
      slider.show();
      gButton.innerHTML = 'Gallery';
    }

    return false;
  }

  nameForm.addEventListener('submit', addDrawing);
  gButton.onclick = (e) => getDrawing(e);
	sButton = document.querySelector('.submit');
}

function draw() {
  clear();
	isGallery ? drawGallery() : drawCanvas();
}

const drawCanvas = () => {
  isHover = false;
	isInCanvas = (mouseX > 0) && (mouseX < 500) && (mouseY > 0) && (mouseY < 500);
	drawRect(0, 0, 500, 500, 'white');
	
	// Draw all the lines and strokes
	if (strokes.length > 0) for (let i = 0; i < strokes.length; i++) drawStroke(strokes[i]);
	if (lines.length > 0) drawStroke(lines);
	
	// Draw UI
	drawUI();
	currentHover = isHover ? currentHover : -1;
	getCursor();
	sw = slider.value();
	
	// If the user is drawing, check for new line
	if (isDrawing && mouseIsPressed) checkLine();
  sButton.disabled = !(strokes.length > 0);
}

const drawGallery = () => {
  push();
  fill('maroon');
  rect(0, 0, 600, 600);
  if (!isCtxLoaded){
    resetGraphics();
    let keys = Object.keys(drawings);
    let fp = pageCount * 4;
    let picCount = min(galleryCount - fp, 4);
    for (let i = fp; i < fp + picCount; i++){
      let cStrokes = drawings[keys[i]].drawing;
      for (let j = 0; j < cStrokes.length; j++) {
        for (let k = 0; k < cStrokes[j].length; k++){
          let s = cStrokes[j];
          let cLine = s[k];
          console.log(cLine);
          if (cLine != undefined){
            ctxs[i - fp].strokeWeight(cLine.width);
            ctxs[i - fp].stroke(cLine.color);
            ctxs[i - fp].line(cLine.p1.x, cLine.p1.y, cLine.p2.x, cLine.p2.y);
          }
        }
      }
      //drawStrokeCtx(cStrokes[j], ctxs[i - fp]);
    }
    isCtxLoaded = true;
  }

  image(ctxs[0], 50, 50, 225, 225);
  image(ctxs[1], 50, 325, 225, 225);
  image(ctxs[2], 325, 50, 225, 225);
  image(ctxs[3], 325, 325, 225, 225);
  pop();
}

// Check if the mouse in the canvas; if it is, start drawing when the mouse is pressed
function mousePressed(){
	if (currentHover != -1) currentColor = currentHover;
	if (isInCanvas) {
		smouseX = mouseX;
		smouseY = mouseY;
		isDrawing = true;
	}
}

// Stop drawing if the user was drawing
function mouseReleased() {
	if (isDrawing){
		if (lines.length > 0) strokes.push(lines);
		lines = [];
		isDrawing = false;
	}
}

// Readjust DOM object position when window changes size
function windowResized() {
  slider.position(window.innerWidth / 2 + 209, window.innerHeight/2 + 200 + colorUIRadius);
	buttons.forEach(button => button.obj.position(window.innerWidth / 2 + button.x, window.innerHeight/2 + button.y));
}

// Draw a generic rectangle
const drawRect = (x1, y1, x2, y2, c) => {
	push();
	fill(c);
	noStroke();
	rect(x1, y1, x2, y2);
	pop();
}

// Draw out all lines from a stroke
const drawStroke = (s) => {
	if (s.length > 0){
		for (let i = 0; i < s.length; i++){
			push();
			let cLine = s[i];
			strokeWeight(cLine.width);
			stroke(cLine.color);
			line(cLine.p1.x, cLine.p1.y, cLine.p2.x, cLine.p2.y);
			pop();
		}
	}
}

// Draw out all lines from a stroke within a graphic context
const drawStrokeCtx = (s, ctx) => {
	if (s.length > 0){
		for (let i = 0; i < s.length; i++){
			let cLine = s[i];
			ctx.strokeWeight(cLine.width);
			ctx.stroke(cLine.color);
			ctx.line(cLine.p1.x, cLine.p1.y, cLine.p2.x, cLine.p2.y);
		}
	}
}

// Draw UI elements
const drawUI = () => {
	push();
	// Draw UI tray
	drawRect(0, 500, 600, 600, 'maroon');
	drawRect(500, 0, 600, 500, 'maroon');
	
	// Draw all color options
	let offset = colorUIDistance / 2;
	for (let i = 0; i < colors.length; i++){
		drawColorUI(colors[i], offset + colorUIDistance * i, 550, i);	
	}
	
	// Draw width text
	stroke('white');
	strokeWeight(2);
	textSize(30);
	text('width', 515, 550);
	pop();
};

// Get cursor based on where it is
const getCursor = () => {
	isInCanvas ? cursor('crosshair') :
	isHover ? cursor('pointer') : cursor('default');
};

const undoButton = () => { if(strokes.length > 0) redos.push(strokes.pop()); };
const redoButton = () => { if(redos.length > 0) strokes.push(redos.pop()); };
const resetButton = () => {
	if (strokes.length <= 0) return;
	let temp = [];
	
	// Combine all the previous strokes to a stroke, in case the user wants to redo the reset
	while (strokes.length > 0){
		let cs = strokes.pop();
		while (cs.length > 0) temp.push(cs.pop());
	}
	redos.push(temp);
};

// Draw a color option
const drawColorUI = (color, x, y, i) => {
	push();
	let d = dist(mouseX, mouseY, x, y);
	
	// If this color is the current selected color
	if (currentColor == i){
		fill('red');
		noStroke();
		circle(x, y, colorUIRadius * 1.2);
	}
	// If this color is the current hovered color
	else if (d <= colorUIRadius * 1.1 / 2){
		fill('lightgreen');
		noStroke();
		circle(x, y, colorUIRadius * 1.2);
		isHover = true;
		currentHover = i;
	}
	
	// Draw the color circle
	stroke('black');
	fill('white');
	circle(x, y, colorUIRadius * 1.1);
	stroke('black');
	fill(color);
	circle(x, y, colorUIRadius);
	pop();
};

// Check if there is a newly drawn line for the current stroke
const checkLine = () => {
	// If the line is too short, avoid adding it to line array to avoid pushing too many unnecessary lines
	if (dist(mouseX, mouseY, smouseX, smouseY) < minLength) return;
	
	// Clamp the line to the canvas
	let clampedX = clamp(mouseX);
	let clampedY = clamp(mouseY);
	let clampedPX = clamp(smouseX);
	let clampedPY = clamp(smouseY);
	lines.push(Line(clampedPX, clampedPY, clampedX, clampedY, colors[currentColor], sw));
	
	// Reset previous mouse position and redo
	smouseX = mouseX;
	smouseY = mouseY;
	redos = [];
};

// Create a generic button
const createDOMButton = (name, x, y, w, h, fs, f) => {
	let temp = createButton(name);
	temp.position(window.innerWidth / 2 + x, window.innerHeight/2 + y);
	temp.style('width', `${w}px`);
	temp.style('height', `${h}px`);
	temp.style('font-size', `${fs}px`);
	temp.mousePressed(f);
	
	let button = {obj: temp, x: x, y: y};
	return button;
}

const resetGraphics = () => {
  ctxs = [];
  for (let i = 0; i < 4; i++) {
    ctxs.push(createGraphics(500, 500));
    ctxs[i].background('white');
  }
}

const clamp = (num) => Math.min(Math.max(num, 0), 500);
const Line = (x1, y1, x2, y2, color, width) => {return {p1: {x: x1, y: y1}, p2: {x: x2, y: y2}, color: color, width: width}};