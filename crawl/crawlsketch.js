var y, z = 0, crawlFont;
function preload() {
  crawlFont = loadFont('Inconsolata-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  y = height/2-400;
}

function draw() {
    background(0);
    push();
    textFont(crawlFont);
    translate(0, y, z);
    rotateX(PI/4);
    textAlign(CENTER, TOP);
    textSize(width/12);
    fill(253, 88, 163);
    text("Episode IV\nVULN VORTEX",0,0);
    textSize(width/20);
    var w = width*0.8;
    text("In a world where code powers everything, a rogue AI named Glitch has unleashed chaos.\n\nSystems are crumbling as vulnerabilities spread like wildfire.\n\nNow, it's up to you to stop the collapse. With Patch by your side, you'll dive into the corrupted code, dodge dangerous bugs, and wield powerful tools to fight back.\n\nThe fate of the software ecosystem is in your hands. Are you ready to jump in, take control of Patch, and secure the code before it's too late?", -w/2,width/4,w,height*20);
    pop();
    y -= height/600;
    z -= height/600;
}