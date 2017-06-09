var gridWidth = 10;
var gridHeight = 10;

var cellMaxCount = 50;

var baseOff = 0;

var yOff = 100;
var xOff = 200;

var cellWidth = 40;
var cellHeight = 35;

var cellSizeLowerBound = 5;
var cellSizeUpperBound = 50;

var canWidth = 0;
var canHeight = 0;

var currentMouseCellX = 0;
var currentMouseCellY = 0;

var lastCellModifiedX = 0;
var lastCellModifiedY = 0;

var currentMouseAbsX = 0;
var currentMouseAbsY = 0;

var lastMouseAbsX = 0;
var lastMouseAbsY = 0;

var repeatInterval = gridWidth;

var repeatCount = 1;

var drawGrid = true;

var canvas = null;

var drawRepeat = false;

var drawDisplayMode = false;

var drawMonochromeMode = false;

var mouseCurrentlyDown = false;

var ignoreModifiedStatus = true;

var mouseDragMode = false;

var colourValues = ["#ffffff", "#ff3333"];
var defaultColourValues = ["#ffffff", "#ff3333", "#33ff33", "#3333ff", "#ffff33", "#ff33ff", "#33ffff"];

var cursorDragMode = false;
var brushMode = true; //replace all with current colour or "cycle"
var brushColour = 0;

var colourBarRevealed = false;
var sizeBarRevealed = false;
var gaugeBarRevealed = false;

var cellColours;

var currentDownloadWindow = null;

function setColourValue(colourIndex, value)
{
	//Sets one of the colours in colourValues to a new value.
	
	colourValues[colourIndex] = '#' + value.toString();
	updateColourSelectbar();
	drawBoard(true);
}

function hideAllBars()
{
	//hides all the dropdown "bars"
	if (colourBarRevealed)
	{
		toggleColourBar();
	}
	if (sizeBarRevealed)
	{
		toggleSizeBar();
	}
    if (gaugeBarRevealed)
	{
		toggleGaugeBar();
	}		
}
function toggleColourBar() {
	//Toggles the colour change bar.
	
	if (!colourBarRevealed)
	{
		hideAllBars(); //hide all other bars, close them
	}
	
    var division = document.getElementById('colourbar');
    if (!colourBarRevealed) {
        division.style.visibility = 'visible';
		colourBarRevealed = true;
    } else {
        division.style.visibility = 'hidden';
		colourBarRevealed = false;
    }
}
function toggleSizeBar() {
	//Toggles the size change bar.
	
	if (!sizeBarRevealed)
	{
		hideAllBars(); //hide all other bars, close them
	}
	
    var division = document.getElementById('sizebar');
    if (!sizeBarRevealed) {
        division.style.visibility = 'visible';
		sizeBarRevealed = true;
    } else {
        division.style.visibility = 'hidden';
		sizeBarRevealed = false;
    }
}
function toggleGaugeBar() {
	//Toggles the gauge change bar.
	
	if (!gaugeBarRevealed)
	{
		hideAllBars(); //hide all other bars, close them
	}
	
    var division = document.getElementById('gaugebar');
    if (!gaugeBarRevealed) {
        division.style.visibility = 'visible';
		gaugeBarRevealed = true;
    } else {
        division.style.visibility = 'hidden';
		gaugeBarRevealed = false;
    }
}

function toggleRepeat()
{
	//Toggles the repeat "ghost" display of the pattern.
	
	if (repeatCount == 1)
	{
		drawRepeat = true;
		repeatCount = 3;
	}
	else
	{
		drawRepeat = false;
		repeatCount = 1;
	}
	
	drawBoard(true);
}
function changeRepeat(amount) {
	//Changes the number of times the knitting pattern will be repeated
	//when repeat is on.
	if (repeatInterval+amount < 1 || repeatInterval+amount >= cellWidth)
	{
		return; //just exit the function
	}
	repeatInterval += amount;
	for (var x = repeatInterval; x < gridWidth; x++)
	{
		for (var y = 0; y < gridHeight; y++)
		{
			cellColours[x][y] = 0;
		}
	}
	drawBoard(true);
}

function toggleGrid() {
	//Toggles the grid drawn on the canvas.
	
	drawGrid = !drawGrid;
	drawBoard(true);
}

function crop(width, height, callback) {
  //Crops part of the canvas, then runs a callback function with
  //the dataURL of the crop as an argument.
  
  // create an in-memory canvas
  var buffer = document.createElement('canvas');
  var b_ctx = buffer.getContext('2d');
  // set its width/height to the required ones
  buffer.width = width;
  buffer.height = height;
  // draw the main canvas on our buffer one
  // drawImage(source, source_X, source_Y, source_Width, source_Height, 
  //  dest_X, dest_Y, dest_Width, dest_Height)
  b_ctx.drawImage(canvas, xOff-baseOff, yOff-baseOff, width, height,
                  0, 0, buffer.width, buffer.height);
  // now call the callback with the dataURL of our buffer canvas
  return callback(buffer.toDataURL());
};

function setDefaultDisplaySettings()
{
	if (repeatCount == 3)
	{
		toggleRepeat();
	}
	if (drawDisplayMode)
	{
		toggleDisplay();
	}
	drawBoard(true);
	
}
function openDownloadWindow(data)
{
	
	//Opens a window that has an image for downloading.
	//Returns the window object.
	var w=window.open('about:blank','image from canvas');
	w.close();
	w=window.open('about:blank','Image');
	w.document.write("<img src='"+data+"' alt='from canvas'/>");
	w.focus();
	return w;
}

function downloadImage()
{
	var lastRepeatCount = repeatCount;
	var lastDisplayMode = drawDisplayMode;
	setDefaultDisplaySettings();
	drawBoard(false);
	if (currentDownloadWindow != null)
	{
		currentDownloadWindow.close();
	}
	window.setTimeout(function() {currentDownloadWindow = crop(cellWidth*(gridWidth+4), cellHeight*(gridHeight+4), openDownloadWindow);}, 100);
	
	
	
	(function (lastRepeatCount, lastDisplayMode)
	{
	window.setTimeout(function() {
	if (repeatCount != lastRepeatCount)
	{
		repeatCount = 3;
	}
	if (lastDisplayMode != drawDisplayMode)
	{
		drawDisplayMode = true;
		drawGrid = false;
	}
	drawBoard(true);
	}, 750);
	})(lastRepeatCount, lastDisplayMode);
	
}

function printImage()
{
	//Runs the print function for the pattern, after cropping it out of the canvas.
	
	downloadImage();
	window.setTimeout(function() {currentDownloadWindow.print();}, 750);
	
}
function toggleDisplay()
{
	//Toggles the display mode from rectangles to stitch shapes.
	//Also turns grid on and off, depending on the new mode toggled to.
	
	drawDisplayMode = !drawDisplayMode;
	if (drawDisplayMode)
	{
		drawGrid = false;
		if (drawMonochromeMode)
		{
			toggleMonochrome();
		}
	}
	else
	{
		drawGrid = true;
	}
	drawBoard(true);
}

function toggleMonochrome()
{
	//Toggles the monochrome display mode.
	
	drawMonochromeMode = !drawMonochromeMode;
	if (drawDisplayMode && drawMonochromeMode)
	{
		toggleDisplay();
		
	}
	if (drawMonochromeMode)
	{
		$("#monochromebutton").html("Colour </br><img src='images/icons/monochrome.svg' class='toolbarbuttonicon'></img>");
	}
	else
	{
		$("#monochromebutton").html("Black and White </br><img src='images/icons/monochrome.svg' class='toolbarbuttonicon'></img>");
	}
	
	drawBoard(true);
}
function changeZoom(factor)
{
	if (cellWidth*factor < cellSizeUpperBound || cellHeight*factor < cellSizeUpperBound
	|| cellWidth*factor > cellSizeLowerBound || cellHeight*factor > cellSizeLowerBound)
	{
		cellWidth = Math.round(cellWidth*factor);
		cellHeight = Math.round(cellHeight*factor);
		drawBoard(true);
	}
}

function changeRowGauge(amount) {
	//Changes the appearance of the pattern gauging by pixels
	
	if (cellHeight+amount >= 5)
	{
		cellHeight += amount
	}
	else
	{
		cellHeight = 5;
	}
	drawBoard(true);
}

function changeWidthGauge(amount) {
	//Changes the appearance of the pattern gauging by pixels
	
	if (cellWidth+amount >= 5)
	{
		cellWidth += amount
	}
	else
	{
		cellWidth = 5;
	}
	
	
	drawBoard(true);
}
function changeGridWidth(amount, append) {
	//Changes the amount of columns in the pattern, if append is true it adds/removes to the right,
	//if it's false it adds/removes to the left
	
	if (gridWidth+amount <= 0)
	{
		return; //nope!
	}
	gridWidth += amount;
	repeatInterval += amount;
	
	if (append && amount < 0)
	{
		for (var x = 0; x < gridWidth-amount; x++)
		{
			for (var y = 0; y < gridHeight; y++)
			{
				if (x >= gridWidth)
				{
					cellColours[x][y] = 0;
				}
			}
		}
	}
	
	if (!append && amount > 0)
	{
		var cellCache = cellColours;
		createCellColours();  //resets to 0s
		for (var x = 0; x < gridWidth-amount; x++)
		{
			for (var y = 0; y < gridHeight; y++)
			{
				cellColours[x+amount][y] = cellCache[x][y];
			}
		}
	}
	
	if (!append && amount < 0)
	{
		var cellCache = cellColours;
		createCellColours();  //resets to 0s
		for (var x = -amount; x < gridWidth-amount; x++)
		{
			for (var y = 0; y < gridHeight; y++)
			{
				cellColours[x+amount][y] = cellCache[x][y];
			}
		}
	}
	
	drawBoard(true);
}

function changeGridHeight(amount, append) {
	//Changes the amount of rows in the pattern, if append is true it adds/removes to the bottom,
	//if it's false it adds/removes to the top
	
	if (gridHeight+amount <= 0)
	{
		return; //nope!
	}
	gridHeight += amount;
	
	if (append && amount < 0)
	{
		for (var x = 0; x < gridWidth; x++)
		{
			for (var y = 0; y < gridHeight-amount; y++)
			{
				if (y >= gridHeight)
				{
					cellColours[x][y] = 0;
				}
			}
		}
	}
	
	if (!append && amount > 0)
	{
		var cellCache = cellColours;
		createCellColours();
		for (var x = 0; x < gridWidth; x++)
		{
			for (var y = 0; y < gridHeight-amount; y++)
			{
				cellColours[x][y+amount] = cellCache[x][y];
			}
		}
	}
	
	if (!append && amount < 0)
	{
		var cellCache = cellColours;
		createCellColours();  //resets to 0s
		for (var x = 0; x < gridWidth; x++)
		{
			for (var y = -amount; y < gridHeight-amount; y++)
			{
				cellColours[x][y+amount] = cellCache[x][y];
			}
		}
	}
	
	drawBoard(true);
}

function createArray(length) {
	//Array creation function, used mostly for the cellColours multi-dimensional arrays
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function setBrushColour(colourID)
{
	//Sets the colour of the brush, to an ID used with colourValues
	brushColour = colourID;
	updateColourToolbar();
	updateColourSelectbar();
}

function addColour(colour)
{
	//Adds a colour to colourValues
	if (colour == 'default')
	{
		if (colourValues.length < defaultColourValues.length)
		{
			colourValues[colourValues.length] = defaultColourValues[colourValues.length];
		}
		else
		{
			colourValues[colourValues.length] = "#ffffff";
		}
	}
	else
	{
		colourValues[colourValues.length] = colour;
	}
	updateColourToolbar();
	updateColourSelectbar();
	
	
	if (!colourBarRevealed)
	{
		toggleColourBar();
	}
}

function removeColourButtonPress(colourID)
{
	var colourInGrid = false;
	for (var x = 0; x < gridWidth; x++)
		{
			for (var y = 0; y < gridHeight; y++)
			{
				if (colourID == cellColours[x][y])
				{
					colourInGrid = true;
				}
			}
		}
	if (!colourInGrid || confirm("Are you sure you want to remove colour: " + colourID + "?"))
	{
		removeColour(colourID);
	}
}
function removeColour(colourID)
{
	//Removes a colour from colourValues
	if (colourID == colourValues.length-1 && colourID == brushColour)
	{
		brushColour -= 1;
	}
	else if (brushColour > colourID)
	{
		brushColour -= 1;
	}
	colourValues.splice(colourID, 1); //removes the item from index colourID
	for (var x = 0; x < gridWidth; x++)
		{
			for (var y = 0; y < gridHeight; y++)
			{
				if (cellColours[x][y] == colourID)
				{
					cellColours[x][y] = 0;
				}
				else if (cellColours[x][y] > colourID)
				{
					cellColours[x][y] = cellColours[x][y] - 1;
				}
			}
		}
	updateColourToolbar();
	updateColourSelectbar();
	drawBoard(true);
}
function updateColourToolbar()
{
	
	
	$("#coloureditbar").empty();
	for (var x = 0; x < colourValues.length; x++)
	{	
		
		var groupDiv = $("<span>", {"class": "coloureditgroup"});
		
		//create jscolour input
		
		var input = document.createElement('input');
		input.className = "jscolor ";
        var picker = new jscolor(input, 
		{
			value: colourValues[x]
		});
		
		$(input).prop( "disabled", true );
		(function(num)
		{
		$(input).change(function(e){
			var color = e.target.value;
			setColourValue(num, color);
		});
		})(x);
		
		$(groupDiv).append(input);
       // document.getElementById('coloureditbar').appendChild(input);
		
		
		//create remove button for colour
		
		if (colourValues.length > 1)
		{
			var button = document.createElement('button');
			$(button).attr("class", "colourremovebutton");
			(function(num)
			{
			$(button).click(function(e){
				removeColourButtonPress(num);
			});
			})(x);
			
			//document.getElementById('coloureditbar').appendChild(button);
			$(groupDiv).append(" ");
			$(groupDiv).append(button);
		}
		$('#coloureditbar').append(groupDiv);
		
	}
	
}
function updateColourSelectbar()
{
	//Updates the colour toolbar to have jscolor inputs matching colourValues, and brush
	//selection buttons on the sidebar
	$(".brushcolourbutton").remove();
	$(".activebrushcolourbutton").remove();
	
	$("#colourpalette").empty();
	
	//adds selection buttons
	
	//works to have the buttons in groups of 2 column rows
	$('<br>').appendTo($("#colourpalette"));
	for (var x = 0; x < colourValues.length; x++)
	{
		if (x == brushColour)
		{
			var $input = $('<button id="activebrushcolourbutton" class="brushcolourbutton" onclick="setBrushColour(' + x + ')">' + '</button>');
		}
		else
		{
			var $input = $('<button class="brushcolourbutton" onclick="setBrushColour(' + x + ')">' + '</button>');
		}
		$input.css("backgroundColor", colourValues[x]);
		$input.appendTo($("#colourpalette"));
		if ((x % 3) == 2)
		{
			//works to have the buttons in groups of 2 column rows
			$('<br>').appendTo($("#colourpalette"));
		}
	}
}
function createCellColours()
{
	//Sets an empty cellColours array
	cellColours = createArray(cellMaxCount, cellMaxCount);

	//initialize cellColours array to 0
	for (var x = 0; x < cellColours.length; x++)
	{
		for (var y = 0; y < cellColours[x].length; y++)
		{
			cellColours[x][y] = 0;
		}
	}
}

createCellColours();


function setCursorDragMode(mode)
{
	//Changes the action of clicking and dragging with the cursor on the canvas,
	//true means that it will simply move the grid around, false means that it
	//will draw, as a brush.
	if (cursorDragMode == mode)
	{
		return false; //did not change
	}
	if (mode)
	{
		$('#drawboard').css('cursor', 'move');
		
		$('#activecursorbrushbutton').prop('id', 'cursorbrushbutton');
		$('#cursordragbutton').prop('id', 'activecursordragbutton');
	}
	else if (!mode)
	{
		$('#cursorbrushbutton').prop('id', 'activecursorbrushbutton');
		$('#activecursordragbutton').prop('id', 'cursordragbutton');
		$('#drawboard').css('cursor', 'pointer');
	}
	cursorDragMode = mode;
	
	return true; //changed
}


function setCellColour(cellx, celly)
{
	//Sets a cell to a specific colour given cell coordinates
	if (cellx >= 0 && celly >= 0 && cellx < gridWidth*repeatCount && celly < gridHeight)
	{
		if (!brushMode)
		{
			if (cellColours[cellx % repeatInterval][celly] == 1)
			{
				cellColours[cellx % repeatInterval][celly] = 0;
			}
			else
			{
				cellColours[cellx % repeatInterval][celly] = 1;
			}
		}
		else
		{
			cellColours[cellx % repeatInterval][celly] = brushColour;
		}
	}
	ignoreModifiedStatus = false;
	lastCellModifiedX = cellx;
	lastCellModifiedY = celly;
}

/* function getCursorPosition(event) {
	//Gets the position of the cursor relative to the canvas in pixels
	
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
	
    console.log("x: " + x + " y: " + y);
	console.log("x: " + Math.floor((x-baseOff)/cellWidth) + " y: " + Math.floor((y-baseOff)/cellHeight));
} */

function handleCanvasClick(event)
{
	//Handles a click on the canvas, typically to set colours on the grid
	
	event.preventDefault();
	
	mouseCurrentlyDown = true;

	var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
	currentMouseCellX = Math.floor((x-baseOff-xOff)/cellWidth);
	currentMouseCellY = Math.floor((y-baseOff-yOff)/cellHeight);
	
	
	
	if (currentMouseCellX > gridWidth*repeatCount || currentMouseCellX < 0 || currentMouseCellY > gridHeight || currentMouseCellY < 0 || cursorDragMode)
	{
		mouseDragMode = true;
	}
	if ((currentMouseCellX != lastCellModifiedX || currentMouseCellY != lastCellModifiedY || ignoreModifiedStatus) && (!mouseDragMode && !cursorDragMode))
	{
	    setCellColour(currentMouseCellX, currentMouseCellY);
	}
	
}

function handleCanvasRelease(event)
{
	//Handles releasing the mouse from the canvas
	
	event.preventDefault();
	
	mouseCurrentlyDown = false;
	mouseDragMode = false;
	ignoreModifiedStatus = true;
}

function handleCanvasMove(event)
{
	//Handles moving the mouse on the canvas
	
	event.preventDefault();
	
	var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
	currentMouseCellX = Math.floor((x-baseOff-xOff)/cellWidth);
	currentMouseCellY = Math.floor((y-baseOff-yOff)/cellHeight);
	currentMouseAbsX = x;
	currentMouseAbsY = y;
	
	if (mouseDragMode)
	{
		//Move the cell grid, if the mouse is being dragged outside of it. Also,
		//if the move would take the grid out of the bounds of the canvas, don't
		//move it.
		if ((currentMouseAbsX-lastMouseAbsX > 0 || xOff > -((gridWidth-1)*cellWidth)) && (currentMouseAbsX-lastMouseAbsX < 0 || xOff < canWidth-(cellWidth*2)))
		{
		xOff += currentMouseAbsX-lastMouseAbsX;
		}
		//Why in the MouseY < 0 section (cellHeight*8) in particular? Who the heck knows? It works.
		if ((currentMouseAbsY-lastMouseAbsY > 0 || yOff > -((gridHeight-1)*cellHeight)) && (currentMouseAbsY-lastMouseAbsY < 0 || yOff < canHeight-(cellHeight*8)))
		{
		yOff += currentMouseAbsY-lastMouseAbsY;
		}
	}
	else if ((currentMouseCellX != lastCellModifiedX || currentMouseCellY != lastCellModifiedY || ignoreModifiedStatus) && mouseCurrentlyDown && !mouseDragMode && !cursorDragMode)
	{
	    setCellColour(currentMouseCellX, currentMouseCellY);
	}
	
	lastMouseAbsX = currentMouseAbsX;
	lastMouseAbsY = currentMouseAbsY;
	drawBoard(true);
}

function handleCanvasOut(event)
{
	//Handles the mouse leaving the canvas, usually makes sure that the
	//program treats the mouse as "released".
	mouseCurrentlyDown = false;
	mouseDragMode = false;
	ignoreModifiedStatus = true;
}
function setCanvasSize()
{
	//Sets the size of the canvas, used on initialization, and window resizing
	var clientHeight = document.getElementById("holder").clientHeight;
	var clientWidth = document.getElementById("holder").clientWidth;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
	canWidth = clientWidth;
	canHeight = clientHeight;
	drawBoard(true);
}
function initializeCanvas()
{
	//Initializes the canvas, adding EventListeners and setting size
	canvas = document.getElementById("drawboard")
	canvas.onselectstart = function () { return false; }
	setCanvasSize();
	drawBoard(true);
	updateColourToolbar();
	updateColourSelectbar();
	canvas.addEventListener("mousedown", handleCanvasClick, false);
	canvas.addEventListener("mouseup", handleCanvasRelease, false);
	canvas.addEventListener('mousemove', handleCanvasMove, false);
	canvas.addEventListener('mouseout', handleCanvasOut, false);
	
	canvas.addEventListener("touchstart", handleCanvasClick, false);
	canvas.addEventListener("touchend", handleCanvasRelease, false);
	canvas.addEventListener('touchmove', handleCanvasMove, false);
	
}

function ellipse(context, cx, cy, rx, ry){
        context.save(); // save state
        context.beginPath();

        context.translate(cx-rx, cy-ry);
        context.scale(rx, ry);
        context.arc(1, 1, 1, 0, 2 * Math.PI, false);

        context.restore(); // restore to original state
        context.stroke();
}

function drawBoard(highlight)
{
    //Draws the canvas, including the knitting pattern
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = 1;
	for (var x = 0; x < gridWidth*repeatCount; x++) {
		for (var y = 0; y < gridHeight; y++) 
		{
			
			if (cellColours[x % repeatInterval][y] ==  "#000000")
			{
				context.strokeStyle = "white";
			}
			else
			{
				context.strokeStyle = "black";
			}
			
			
				
			if (!drawMonochromeMode)
			{				
				context.fillStyle = colourValues[cellColours[x % repeatInterval][y]];
			}
			else
			{
				context.fillStyle = "white";
			}
			
			
			
			//rectangles
			if (!drawDisplayMode && !drawMonochromeMode)
			{
				context.beginPath();
				context.rect((x*cellWidth)+baseOff+xOff, (y*cellHeight)+baseOff+yOff, cellWidth, cellHeight);
				//context.rect((x*cellWidth)+baseOff+xOff, (y*cellHeight)+baseOff+yOff, cellWidth, cellHeight);
				context.fill();
			}
			
			//fancy stuff
			else if (drawDisplayMode)
			{
				context.beginPath();
				context.moveTo((x*cellWidth)+baseOff+xOff, (y*cellHeight)+baseOff+yOff-(cellHeight*0.275));
				context.lineTo((x*cellWidth)+baseOff+xOff, (y*cellHeight)+baseOff+(cellHeight/1.5)+yOff);
				context.lineTo((x*cellWidth)+baseOff+(cellWidth/2)+xOff, (y*cellHeight)+baseOff+cellHeight*1.2+yOff);
				context.lineTo((x*cellWidth)+baseOff+(cellWidth/2)+xOff, (y*cellHeight)+baseOff+(cellHeight/4)+yOff);
				context.closePath();
				context.fill();
				context.stroke();
				context.beginPath();
				context.moveTo((x*cellWidth)+baseOff+(cellWidth/2)+xOff, (y*cellHeight)+baseOff+(cellHeight/4)+yOff);
				context.lineTo((x*cellWidth)+baseOff+(cellWidth/2)+xOff, ((y*cellHeight)+baseOff+cellHeight*1.2)+yOff);
				context.lineTo((x*cellWidth)+baseOff+cellWidth+xOff, (y*cellHeight)+baseOff+(cellHeight/1.5)+yOff);
				context.lineTo((x*cellWidth)+baseOff+cellWidth+xOff, (y*cellHeight)+baseOff+yOff-(cellHeight*0.275));
				context.closePath();
				context.fill();
				context.stroke();
			}
			
			
			//draw monochrome symbols in that mode
			else if (drawMonochromeMode)
			{
				context.fillStyle = "black";
				context.strokeStyle = "black";
				context.lineWidth = 1;
				
				if (cellColours[x % repeatInterval][y] == 1)
				{
					context.beginPath();
					context.lineWidth = 4.5;
					ellipse(context, (x*cellWidth)+baseOff+xOff+(cellWidth/2), (y*cellHeight)+baseOff+yOff+(cellHeight/2), cellWidth/3, cellHeight/3);
					context.lineWidth = 1;
					context.closePath();
				}
				else if (cellColours[x % repeatInterval][y] == 2)
				{
					context.lineWidth = 4.5;
					context.beginPath();
					context.moveTo((x*cellWidth)+baseOff+xOff+4, (y*cellHeight)+baseOff+yOff+4);
					context.lineTo((x*cellWidth)+baseOff+xOff+cellWidth-4, (y*cellHeight)+baseOff+yOff+cellHeight-4);
					context.moveTo((x*cellWidth)+baseOff+xOff+cellWidth-4, (y*cellHeight)+baseOff+yOff+4);
					context.lineTo((x*cellWidth)+baseOff+xOff+4, (y*cellHeight)+baseOff+yOff+cellHeight-4);
					context.stroke();
					context.closePath();
					
					context.lineWidth = 1;
					
				}
				else if (cellColours[x % repeatInterval][y] == 3)
				{
					context.beginPath();
					ellipse(context, (x*cellWidth)+baseOff+xOff+(cellWidth/2), (y*cellHeight)+baseOff+yOff+(cellHeight/2), cellWidth/3, cellHeight/3);
					context.fill();
					context.closePath();
				}
				else if (cellColours[x % repeatInterval][y] == 4)
				{
					context.beginPath();
					context.moveTo((x*cellWidth)+baseOff+xOff+cellWidth-4, (y*cellHeight)+baseOff+yOff+4);
					context.lineTo((x*cellWidth)+baseOff+xOff+cellWidth-4, (y*cellHeight)+baseOff+yOff+cellHeight-4);
					context.lineTo((x*cellWidth)+baseOff+xOff+4, (y*cellHeight)+baseOff+yOff+cellHeight-4);
					context.lineTo((x*cellWidth)+baseOff+xOff+cellWidth-4, (y*cellHeight)+baseOff+yOff+4);
					context.closePath();
					context.fill();
					context.lineWidth = 1;
				}
				else if (cellColours[x % repeatInterval][y] == 5)
				{
					context.lineWidth = 4.5;
					context.beginPath();
					context.moveTo((x*cellWidth)+baseOff+xOff+(cellWidth/2), (y*cellHeight)+baseOff+yOff+4);
					context.lineTo((x*cellWidth)+baseOff+xOff+cellWidth-4, (y*cellHeight)+baseOff+yOff+cellHeight-4);
					context.lineTo((x*cellWidth)+baseOff+xOff+4, (y*cellHeight)+baseOff+yOff+cellHeight-4);
					context.lineTo((x*cellWidth)+baseOff+xOff+(cellWidth/2), (y*cellHeight)+baseOff+yOff+4);
					context.closePath();
					context.stroke();
					context.lineWidth = 1;
				}
				else if (cellColours[x % repeatInterval][y] == 6)
				{
					context.beginPath();
					context.rect((x*cellWidth)+baseOff+xOff+(cellWidth-(cellWidth/1.25)), (y*cellHeight)+baseOff+yOff+(cellHeight-(cellHeight/1.25)), cellWidth/1.5, cellHeight/1.5);
					context.closePath();
					context.fill();
				}
				else if (cellColours[x % repeatInterval][y] != 0)
				{
					context.fillText(cellColours[x % repeatInterval][y], (x*cellWidth)+baseOff+xOff+(cellWidth-(cellWidth/1.25)), (y*cellHeight)+baseOff+yOff+(cellHeight)-(cellHeight/4));
				}
				context.lineWidth = 1;
			}
			
			
			
		}
	}
	
	//Draws the grid, if grid is enabled
	if (drawGrid)
	{
		context.lineWidth = 1;
		for (var x = 0; x <= (gridWidth*cellWidth)*repeatCount; x += cellWidth) {
			context.moveTo(0.5 + x + baseOff+xOff, baseOff+yOff);
			context.lineTo(0.5 + x + baseOff+xOff, (gridHeight*cellHeight) + baseOff+yOff);
		}


		for (var x = 0; x <= (gridHeight*cellHeight); x += cellHeight) {
			context.moveTo(baseOff+xOff, 0.5 + x + baseOff+yOff);
			context.lineTo((gridWidth*cellWidth)*repeatCount + baseOff+xOff, 0.5 + x + baseOff+yOff);
		}

		context.strokeStyle = "black";
		context.stroke();


		context.beginPath();

		var repeatcontext = canvas.getContext("2d");

		for (var x = 0; x <= (gridWidth*cellWidth)*repeatCount; x += cellWidth) {
			if ((x/cellWidth) % repeatInterval == 0)
			{
			repeatcontext.moveTo(0.5 + x + baseOff+xOff, baseOff+yOff);
			repeatcontext.lineTo(0.5 + x + baseOff+xOff, (gridHeight*cellHeight) + baseOff+yOff);
			}
		}
		if (drawRepeat)
		{
			repeatcontext.strokeStyle = "lime";
		}
		else
		{
			repeatcontext.strokeStyle = "black";
		}
		 repeatcontext.stroke();


		for (var x = 0; x <= (gridWidth*cellWidth)*repeatCount; x += cellWidth) {
			if ((x/cellWidth) % repeatInterval == 0)
			{
			repeatcontext.moveTo(0.5 + x + baseOff+xOff, baseOff+yOff);
			repeatcontext.lineTo(0.5 + x + baseOff+xOff, (gridHeight*cellHeight) + baseOff+yOff);
			}
		}
		repeatcontext.stroke();
		
		
		
	}
	
	//do hover highlight
	if (highlight && currentMouseCellX < gridWidth*repeatCount && currentMouseCellY < gridHeight*repeatCount && currentMouseCellX >= 0 && currentMouseCellY >= 0)
	{

		context.beginPath();
		context.lineWidth = 2.5;
		
		if (!brushMode)
		 {
			context.strokeStyle = "lime";
		 }
		 else
		 {
			context.strokeStyle = colourValues[brushColour];
		 }
		if (!cursorDragMode)
		{
					
			context.rect(currentMouseCellX*cellWidth+baseOff+xOff, currentMouseCellY*cellHeight+baseOff+yOff, cellWidth, cellHeight);
			context.stroke()
		}
		
		if (drawMonochromeMode)
		{
			context.fillStyle = "black";
			context.strokeStyle = "black";
			context.lineWidth = 1;
			if (brushColour == 1)
			{
				context.beginPath();
				context.lineWidth = 4.5;
				ellipse(context, (currentMouseCellX*cellWidth)+baseOff+xOff+(cellWidth/2), (currentMouseCellY*cellHeight)+baseOff+yOff+(cellHeight/2), cellWidth/3, cellHeight/3);
				context.lineWidth = 1;
				context.closePath();
			}
			else if (brushColour == 2)
			{
				context.lineWidth = 4.5;
				context.beginPath();
				context.moveTo((currentMouseCellX*cellWidth)+baseOff+xOff+4, (currentMouseCellY*cellHeight)+baseOff+yOff+4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+cellWidth-4, (currentMouseCellY*cellHeight)+baseOff+yOff+cellHeight-4);
				context.moveTo((currentMouseCellX*cellWidth)+baseOff+xOff+cellWidth-4, (currentMouseCellY*cellHeight)+baseOff+yOff+4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+4, (currentMouseCellY*cellHeight)+baseOff+yOff+cellHeight-4);
				context.stroke();
				context.closePath();
				
				context.lineWidth = 1;
				
			}
			else if (brushColour == 3)
			{
				context.beginPath();
				ellipse(context, (currentMouseCellX*cellWidth)+baseOff+xOff+(cellWidth/2), (currentMouseCellY*cellHeight)+baseOff+yOff+(cellHeight/2), cellWidth/3, cellHeight/3);
				context.fill();
				context.closePath();
			}
			else if (brushColour == 4)
			{
				context.beginPath();
				context.moveTo((currentMouseCellX*cellWidth)+baseOff+xOff+cellWidth-4, (currentMouseCellY*cellHeight)+baseOff+yOff+4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+cellWidth-4, (currentMouseCellY*cellHeight)+baseOff+yOff+cellHeight-4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+4, (currentMouseCellY*cellHeight)+baseOff+yOff+cellHeight-4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+cellWidth-4, (currentMouseCellY*cellHeight)+baseOff+yOff+4);
				context.closePath();
				context.fill();
				context.lineWidth = 1;
			}
			else if (brushColour == 5)
			{
				context.lineWidth = 4.5;
				context.beginPath();
				context.moveTo((currentMouseCellX*cellWidth)+baseOff+xOff+(cellWidth/2), (currentMouseCellY*cellHeight)+baseOff+yOff+4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+cellWidth-4, (currentMouseCellY*cellHeight)+baseOff+yOff+cellHeight-4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+4, (currentMouseCellY*cellHeight)+baseOff+yOff+cellHeight-4);
				context.lineTo((currentMouseCellX*cellWidth)+baseOff+xOff+(cellWidth/2), (currentMouseCellY*cellHeight)+baseOff+yOff+4);
				context.closePath();
				context.stroke();
				context.lineWidth = 1;
			}
			else if (brushColour == 6)
			{
				context.beginPath();
				context.rect((currentMouseCellX*cellWidth)+baseOff+xOff+(cellWidth-(cellWidth/1.25)), (currentMouseCellY*cellHeight)+baseOff+yOff+(cellHeight-(cellHeight/1.25)), cellWidth/1.5, cellHeight/1.5);
				context.closePath();
				context.fill();
			}
			else if (brushColour != 0)
			{
				context.fillText(brushColour, (currentMouseCellX*cellWidth)+baseOff+xOff+(cellWidth-(cellWidth/1.25)), (currentMouseCellY*cellHeight)+baseOff+yOff+(cellHeight)-(cellHeight/4));
			}
			context.lineWidth = 1;
		}
	}
	
	context.lineWidth = 1;	
	//draw numbering
	if (!drawDisplayMode)
	{
		context.fillStyle = "black";
		context.font = ((cellWidth+cellHeight)/2.5).toString() + "px Consolas";
		for (var x = 0; x < gridWidth; x++)
		{
			var doubleDigitOff = 0;
			if (gridWidth-x >= 10)
			{
				var doubleDigitOff = 5;
			}
			context.fillText(gridWidth-x, x*cellWidth+(cellWidth*0.3)+xOff+baseOff-doubleDigitOff, (gridHeight+1)*(cellHeight*1)+yOff+baseOff);
		}
		
		for (var y = 0; y < gridHeight; y++)
		{
			context.fillText(gridHeight-y, cellWidth*gridWidth+(cellWidth/2)+xOff+baseOff, y*cellHeight+(cellHeight*0.8)+yOff+baseOff);
		}
	}
}

function startSite()
{
	initializeCanvas(); window.onresize = setCanvasSize;
	
	initializeCanvas();
	window.onresize = setCanvasSize;
}

//When document is ready, initialize canvas and whenever the window is resized, update the canvas size
$(document).ready( function() { startSite(); });
