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
let canvas;

function setup() {
	canvas = createCanvas(600, 600);
	background(100);
	colorUIDistance = 500 / colors.length;
	slider = createSlider(1, 10, 5, 1);
	slider.position(window.innerWidth / 2 + 209, window.innerHeight/2 + 200 + colorUIRadius);
	slider.style('width', '80px');
	buttons.push(createDOMButton('undo', 210, -270, 80, 40, 30, undoButton));
	buttons.push(createDOMButton('redo', 210, -210, 80, 40, 30, redoButton));
	buttons.push(createDOMButton('reset', 210, -150, 80, 40, 28, resetButton));
	buttons.push(createDOMButton('save', 210, -90, 80, 40, 30, saveButton));
}

function draw() {
	isHover = false;
	isInCanvas = (mouseX > 0) && (mouseX < 500) && (mouseY > 0) && (mouseY < 500);
	clear();
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
	console.log(strokes);
	if (strokes.length <= 0) return;
	let temp = [];
	
	// Combine all the previous strokes to a stroke, in case the user wants to redo the reset
	while (strokes.length > 0){
		let cs = strokes.pop();
		while (cs.length > 0) temp.push(cs.pop());
	}
	redos.push(temp);
	console.log(redos);
};

// Download drawing to user's device
let saveButton = () => {
	let savedImg = canvas.get(0, 0, 500, 500);
	savedImg.save('my-painting', 'png');
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

const clamp = (num) => Math.min(Math.max(num, 0), 500);
const Line = (x1, y1, x2, y2, color, width) => {return {p1: {x: x1, y: y1}, p2: {x: x2, y: y2}, color: color, width: width}};