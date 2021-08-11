console.log("hello world");

let canvas = document.getElementById('graph');
let canvasDynamic = document.getElementById('dynamic');
let canvasCrosshair = document.getElementById('crosshair');
let curveSelector = document.getElementById('curve_selector');

curve_selector.addEventListener('change', setCurve);

let currentCurve = curveSelector.value;


let img = new Image();
img.src = "cross.png";

let displayXInputArea = document.getElementById('xval');
let displayYInputArea = document.getElementById('yval');
let displayResultArea = document.getElementById('result');

const cellsize = 10;

let deadZone = 0.1;

let xGrid = cellsize;
let yGrid = cellsize;

const xMaxCells = 50; //cells
const yMaxCells = 50; //cells

let ctx = canvas.getContext('2d');
let ctxDynamic = canvasDynamic.getContext('2d');
let ctxCrosshair = canvasCrosshair.getContext('2d');

img.onload = () => {ctxCrosshair.drawImage(img, 0, 0);};

let cursorPos = {x:0, y:0};

let gamepads = {};
let start;
let then = Date.now();


let graphScale = {
    xMax: 1.0,
    yMax: 10,
    xUnit: 0, //initial
    yUnit: 0  //initial 
 };


//Define curves 
//Note: return statemment is implied if we remove {} braces
const exponential = (x)=> {
    return Math.pow(x, 3) *10;
};


const linear = (x)=> {
    return 10*x;
};


const inverseSCurve = (x)=> {
    let result = 4* Math.pow(x-0.5, 3)+0.5;
    return 10*result;
};



const curveFunction = {
    'exponential' : exponential,
    'linear' : linear,
    'inverseSCurve' : inverseSCurve
};



window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);

window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);



function setCurve(event) {
    let selector = event.target;
    let value = selector.value;
    currentCurve = value;
    drawGrids();
    drawFunctionPlot();
    drawAxis();
}


function gamepadHandler(event, connecting) {
    let gamepad = event.gamepad;
    //this is apparently equivalent to doing:
    // let gamepad = navigator.getGamepads()[e.gamepad.index];

    if (connecting) {
        gamepads[gamepad.index] = gamepad;

        if (gamepad.mapping === "standard"){
            console.log("Standard Controller Mapping");
        }
        else {
            console.log("Controller does not have a standard mapping");
        }

        //begin checking gamepad state
        updateGamepadStatus();
    }
    else {
        delete gamepads[gamepad.index];
        window.cancelAnimationFrame(start);
    }
}





//https://www.smashingmagazine.com/2015/11/gamepad-api-in-web-games/
function applyDeadZone(val) {
    let percentage =  (Math.abs(val) - deadZone)/(1-deadZone);

    if (percentage < 0)
        percentage = 0;

    return percentage * (val > 0 ? 1 : -1);
}




function processControllerInput(g) {

    let gp = g;
    let dst = 1; //default distance to move cursor on each update
    let originX = cells(5);
    let originY = cells(55);
    
    if (gp.axes[2] !== 0 || gp.axes[3] !== 0){
    
        let componentX = applyDeadZone(gp.axes[2]);
        let componentY = applyDeadZone(gp.axes[3]);
        
        //if (Math.abs(componentX) >0.9) componentX = Math.round(componentX);
        //if (Math.abs(componentY) >0.9) componentY = Math.round(componentY);
        //magnitude of vector with components X and Y
        let magnitude = Math.sqrt(Math.pow(componentX,2) + Math.pow(componentY,2));

        let x = magnitude;
        
        if (x > 1){
            x = 1;
        }

        y = curveFunction[currentCurve](x);

        displayXInputArea.innerHTML= " " + componentX;
        displayYInputArea.innerHTML= " "+ componentY;
        displayResultArea.innerHTML= " "+ y;


        //update red marker position on curve
        ctxDynamic.clearRect(0,0, canvasDynamic.width, canvasDynamic.height);
        ctxDynamic.fillStyle = "red";

        //note: cellsize/2 to position the center of the marker on the curve
        let markerX = originX+scaleUnits(x, 'x')-(cellsize/2);
        let markerY = originY-scaleUnits(y, 'y')-(cellsize/2);

        ctxDynamic.fillRect(markerX,markerY,10,10);

        
        //update cursor position on it's canvas element
        ctxCrosshair.clearRect(0,0, canvasCrosshair.width, canvasCrosshair.height);

        cursorPos.x += dst*y*componentX;

        cursorPos.y += dst*y*componentY;

        validatePosition();

        //testing something
        ctxCrosshair.fillRect(componentX*20+(canvasCrosshair.width/2)-5, componentY*20 + (canvasCrosshair.height/2)-5, 10, 10);

        ctxCrosshair.drawImage(img, cursorPos.x, cursorPos.y);

    }

}


// Ensure that the cursor is never moved outside the visible area of the canvas
function validatePosition(){
    if (cursorPos.x < 0){
        cursorPos.x = 0;
    }

    if (cursorPos.x + img.width > canvasCrosshair.width){
        cursorPos.x = canvasCrosshair.width - img.width;
    }

    if (cursorPos.y < 0){
        cursorPos.y = 0;
    }

    if (cursorPos.y +img.height > canvasCrosshair.height){
        cursorPos.y = canvasCrosshair.height - img.height;
    }

}


function cells(count) {
    //think of this as the blocks on the grid
    return count*cellsize;
}



function defineUnit(){
    graphScale.xUnit = xMaxCells/graphScale.xMax;
    graphScale.yUnit = yMaxCells/graphScale.yMax;
}


function drawGrids() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.beginPath();
    
    while(xGrid<canvas.height){
        ctx.moveTo(0,xGrid);
        ctx.lineTo(canvas.width, xGrid);
        xGrid += cellsize;
    }

    while(yGrid<canvas.width){
        ctx.moveTo(yGrid,0);
        ctx.lineTo(yGrid, canvas.width);
        yGrid += cellsize;
    }


    xGrid = cellsize;
    yGrid = cellsize;
    ctx.strokeStyle="gray";
    ctx.stroke();
}


//returns unit value in terms of cells on the grid
//axis is a char; 'x' or 'y' representing the axis
function scaleUnits(val, axis){
    if (axis === 'y') {
        return cells(graphScale.yUnit) * val;
    }
    if (axis === 'x') {
        return cells(graphScale.xUnit) * val;
    }
    return 0; //maybe throw error instead
}


function drawAxis() {
    ctx.beginPath();
    ctx.strokeStyle = "black";

    ctx.moveTo(cells(5), cells(5));

    ctx.lineTo(cells(5), cells(55)); //draw y-axis
    ctx.lineTo(cells(55), cells(55)); //draw x-axis

    //begin at origin again
    ctx.moveTo(cells(5), cells(55));
    
    //start drawing the legend for x-axis
    let xseries = 0;
    let xseries_max = 55;
    for (let i=0; i<=cellsize; i++){
        ctx.strokeText(xseries, cells(2), cells(xseries_max));
        xseries_max -=5;
        xseries+=1;
    }

    //start drawing legend for y-axis
    ctx.moveTo(cells(5), cells(55))
    let yseries = 0;
    let yseries_max = 5;
    for (let i=0; i<=cellsize; i++){
        //y-axis =55, plus offset of 2 = 57
        ctx.strokeText(yseries+"%", cells(yseries_max), cells(57)) 
        yseries_max +=5;
        yseries+=10;
    }

    ctx.stroke();
}


function drawFunctionPlot() {
    let originX = cells(5);
    let originY = cells(55);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(originX,originY)

    let y = 0;
    for (let i = 0; i<=100; i++){
        x = i/100;
        y = curveFunction[currentCurve](x);
        ctx.lineTo(originX+scaleUnits(x, 'x'),originY-scaleUnits(y, 'y'));
        console.log(x+" "+y);
    }

    ctx.stroke();
}


function scangamepads(){
    let currGamepads = navigator.getGamepads();
    for (let i = 0; i < currGamepads.length; i++) {
        if (currGamepads[i] && (currGamepads[i].index in gamepads)) {
            let index = currGamepads[i].index;
            gamepads[index] = currGamepads[i];
        }
    }        

}



function updateGamepadStatus() {
    //this block is temporary
    let tmp = Date.now();
    let elapsed = tmp - then;
    console.log(elapsed/1000); //print frame time
    then = tmp;

    scangamepads();
    for (let g in gamepads){
        if (gamepads[g])
            processControllerInput(gamepads[g]);
    }
    start = window.requestAnimationFrame(updateGamepadStatus);
}


defineUnit();
drawGrids();
drawAxis();
drawFunctionPlot();
