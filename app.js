var cvs = document.getElementById('cvs'),
	ctx = cvs.getContext('2d');				
	
var dx1 = [], dy1 = [],
	dx2 = [], dy2 = [],
	x1 = 225, y1 = 250,
	x2 = 275, y2 = 250;
	
// Parser		
var cases = function(str) {
	return str.match(/\s*?else\s*?/g) ? 'true' : str;
};
var condition = function(str) {
	var parts = str.split('->').map(cases);
	return '    if('+parts[0]+') {\n        return '+parts[1]+';\n    }\n';
};
var conditional = function(str) {
	return str.substr(1,str.length-2).split(/,\s*?/g).map(condition).join('');
};
var parse = function(str) {
	return 'int leftMotorPower(float leftJoyY, float rightJoyY, float leftJoyX, float rightJoyX) {\n'+(str.match(/^\[[^\]]+\]$/g) ? conditional(str).replace('}\n    if', '} else if').replace('else if(true)', 'else') : (str.indexOf('return') != -1 ? '    '+str : '    return '+str))+'\n}';
};
var eval = function(str) {
	return Function("leftJoyY", "rightJoyY", "leftJoyX", "rightJoyX", str.replace(/^[^{]+{/, '').replace(/}$/, ''));
};
var interpret = function(x){return eval(parse(x));};

// User Changeable Power Functions
var rightPower = function(y1, y2, x1, x2) {
	return y1;
};
var leftPower = function(y1, y2, x1, x2) {
	return y2;
};

// User Change Functions
$("form").on("submit", function(evt) {
	evt.preventDefault();
	$("pre.left").text(parse($("#left").val()));
	$("pre.right").text(parse($("#right").val()));
	leftPower = interpret($("#left").val());
	rightPower = interpret($("#right").val());
	x1 = 225, y1 = 250,
	x2 = 275, y2 = 250;
});
	
var add = function(a,b){return a+b};
var magnitude = function(a,b){return Math.sqrt(a*a + b*b)};
// Animation Loop
var animate = function() {
	var pad = navigator.webkitGetGamepads()[0];
	dx1.push(pad.axes[0]);
	dy1.push(pad.axes[1]);
	dx2.push(pad.axes[2]);
	dy2.push(pad.axes[3]);			
	
	cvs.width = cvs.width;
	
	var orientation = Math.PI/2;
	if( dx1.length > 2 && dx2.length > 2 ) {
		var y1joy = dy1.slice(-2).reduce(add) / 2 * 20;
		var y2joy = dy2.slice(-2).reduce(add) / 2 * 20;
		var x1joy = dx1.slice(-2).reduce(add) / 2 * 20;
		var x2joy = dx2.slice(-2).reduce(add) / 2 * 20;
		var leftSpeed = leftPower(y1joy, y2joy, x1joy, x2joy);
		var rightSpeed = rightPower(y1joy, y2joy, x1joy, x2joy);
		var shared;
		if( Math.abs(leftSpeed) > Math.abs(rightSpeed) ) {
			shared = rightSpeed;
		} else {
			shared = leftSpeed;
		}
		
		var rotation = Math.PI/8 * (rightSpeed - leftSpeed)/20;
		var angle = Math.atan((y1-y2)/(x1-x2));		
		if( x1-x2 < 0 ) {
			angle = Math.PI + angle;
		}					
		
		orientation = Math.PI/2 - angle;					
		var separation = magnitude(y1-y2, x1-x2);
		deltaX = separation*Math.cos(angle-rotation);
		deltaY = separation*Math.sin(angle-rotation);
		y2 = y1 - deltaY;
		x2 = x1 - deltaX;
		
		y1 += shared * Math.sin(orientation);
		y2 += shared * Math.sin(orientation);
		x1 -= shared * Math.cos(orientation);
		x2 -= shared * Math.cos(orientation);
	}
					
	ctx.beginPath();
	var backShift = Math.sin(orientation) * 50;
	var sideShift = Math.cos(orientation) * 50;
			
	// Leading wheels		
	ctx.arc(x2, y2, 10, 0, Math.PI*2);
	ctx.arc(x1, y1, 10, 0, Math.PI*2);
	ctx.fillStyle = '#f00';
	ctx.fill();	
	ctx.closePath();
	
	// Back wheels
	ctx.beginPath();
	ctx.fillStyle = '#000';
	ctx.arc(x2-sideShift, y2+backShift, 10, 0, Math.PI*2);
	ctx.arc(x1-sideShift, y1+backShift, 10, 0, Math.PI*2);
	ctx.fill();	
	ctx.closePath();
	
	// Frame
	ctx.beginPath();
	ctx.moveTo(x1, y1);	
	ctx.lineTo(x1-sideShift, y1+backShift);
	ctx.lineTo(x2-sideShift, y2+backShift);	
	ctx.lineTo(x2, y2);	
	ctx.lineTo(x1, y1);							
	ctx.stroke();							
	ctx.closePath();	
	
};
// Wait for Gamepad
var poll = function() {
	if(navigator.webkitGetGamepads()[0]) {
		setInterval(animate, 200);			
	} else {
		window.requestAnimationFrame(poll);
	}
};
poll();