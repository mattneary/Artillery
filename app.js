var cvs = document.getElementById('cvs'),
	ctx = cvs.getContext('2d');				
	
// Helper functions	
var magnitude = function(a,b){return Math.sqrt(a*a + b*b)};

// Classes
var Wheel = function(x, y) {
	this.x = x;
	this.y = y;	
};
var Tank = function(controller, cvs) {
	var ctx = cvs.getContext('2d');
	this.wheels = [
		new Wheel(225, 250), 
		new Wheel(275, 250), 
		new Wheel(225, 300), 
		new Wheel(275, 300)
	];
	this.render = function() {
		cvs.width = cvs.width;
		var a = this.wheels[0],
			b = this.wheels[1],
			c = this.wheels[2],
			d = this.wheels[3];
	
		// Leading wheels		
		ctx.beginPath();
			ctx.arc(b.x, b.y, 10, 0, Math.PI*2);
			ctx.arc(a.x, a.y, 10, 0, Math.PI*2);
			ctx.fillStyle = '#f00';
			ctx.fill();	
		ctx.closePath();
		
		// Back wheels
		ctx.beginPath();			
			ctx.arc(d.x, d.y, 10, 0, Math.PI*2);
			ctx.arc(c.x, c.y, 10, 0, Math.PI*2);
			ctx.fillStyle = '#000';
			ctx.fill();	
		ctx.closePath();
		
		// Frame
		ctx.beginPath();
			ctx.moveTo(a.x, a.y);	
			ctx.lineTo(b.x, b.y);
			ctx.lineTo(c.x, c.y);	
			ctx.lineTo(d.x, d.y);	
			ctx.lineTo(a.x, a.y);							
			ctx.stroke();							
		ctx.closePath();
	};
	this.animate = function() {
		// Establish two side speeds based on user power functions.
		controller.update();
		var leftSpeed = leftPower(controller.y1, controller.y2, controller.x1, controller.x2);
		var rightSpeed = rightPower(controller.y1, controller.y2, controller.x1, controller.x2);
		
		// Find velocity shared by both wheels, thus the velocity exhibited...
		// ... by the tank as a whole.
		var shared;
		if( Math.abs(leftSpeed) > Math.abs(rightSpeed) ) {
			shared = rightSpeed;
		} else {
			shared = leftSpeed;
		}
		
		// Determine vector between the front two wheels. 
		var separation = magnitude(this.wheels[0].y-this.wheels[1].y, this.wheels[0].x-this.wheels[1].x),
			angle = Math.atan((this.wheels[0].y-this.wheels[1].y)/(this.wheels[0].x-this.wheels[1].x));;
		if( this.wheels[0].x-this.wheels[1].x < 0 ) {
			angle = Math.PI + angle;
		}	
		
		// Convert wheel power discrepancy to rotation action...
		// ... then perform this with the slower wheel as a pivot.
		var rotation = Math.PI/8 * (rightSpeed - leftSpeed)/20,
			deltaX = separation*Math.cos(angle-rotation),
			deltaY = separation*Math.sin(angle-rotation);
		if( rotation < 0 ) {
			this.wheels[1].y = this.wheels[0].y - deltaY;
			this.wheels[1].x = this.wheels[0].x - deltaX;		
		} else if( rotation > 0 ) {
			this.wheels[0].y = this.wheels[1].y + deltaY;
			this.wheels[0].x = this.wheels[1].x + deltaX;
		}	
		
		// Move entire tank with the shared velocity, where orientation...
		// ... is the direction in which movement will occur.
		var orientation = Math.PI/2 - angle;
		this.wheels[0].y += shared * Math.sin(orientation);
		this.wheels[1].y += shared * Math.sin(orientation);
		this.wheels[0].x -= shared * Math.cos(orientation);
		this.wheels[1].x -= shared * Math.cos(orientation);
		
		// Find new angle between the front wheels...
		angle = Math.atan((this.wheels[0].y-this.wheels[1].y)/(this.wheels[0].x-this.wheels[1].x));
		if( this.wheels[0].x-this.wheels[1].x < 0 ) {
			angle = Math.PI + angle;
		}	
		// ... then use it to recalculate orientation.
		orientation = Math.PI/2 - angle;
		
		if( (this.wheels[0].y > cvs.height-10 || this.wheels[0].y < 10) ||
			(this.wheels[1].y > cvs.height-10 || this.wheels[1].y < 10) ) {
				this.wheels = this.wheels.map(function(wheel) {
					wheel.y = cvs.height - wheel.y;
					return wheel;
				});
		}
		if( (this.wheels[0].x > cvs.width-10 || this.wheels[0].x < 10) ||
			(this.wheels[1].x > cvs.width-10 || this.wheels[1].x < 10) ) {
				this.wheels = this.wheels.map(function(wheel) {
					wheel.x = cvs.width - wheel.y;
					return wheel;
				});
		}
		
		// Adjust back wheels to reflect changed orientation
		var backShift = Math.sin(orientation) * 50,
			sideShift = Math.cos(orientation) * 50;
		this.wheels[2] = new Wheel(this.wheels[0].x-sideShift, this.wheels[0].y+backShift);
		this.wheels[3] = new Wheel(this.wheels[1].x-sideShift, this.wheels[1].y+backShift);
		
		// Render self in canvas
		this.render();
		
		// Animate the next frame
		window.requestAnimationFrame(function() { this.animate(); }.bind(this));
	};	
};
var Controller = function() {
	var pad = navigator.webkitGetGamepads()[0];
	this.x1 = pad.axes[0];
	this.y1 = pad.axes[1];
	this.x2 = pad.axes[2];
	this.y2 = pad.axes[3];
	this.update = function() {
		pad = navigator.webkitGetGamepads()[0];
		this.x1 = pad.axes[0] * 2;
		this.y1 = pad.axes[1] * 2;
		this.x2 = pad.axes[2] * 2;
		this.y2 = pad.axes[3] * 2;
	};
};	
	
// Parser		
var parse = function(str) {
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
	return 'int leftMotorPower(float leftJoyY, float rightJoyY, float leftJoyX, float rightJoyX) {\n'+(str.match(/^\[[^\]]+\]$/g) ? conditional(str).replace('}\n    if', '} else if').replace('else if(true)', 'else') : (str.indexOf('return') != -1 ? '    '+str : '    return '+str+';'))+'\n}';
};
var eval = function(str) {
	return Function("leftJoyY", "rightJoyY", "leftJoyX", "rightJoyX", str.replace(/^[^{]+{/, '').replace(/}$/, ''));
};
var interpret = function(x){
	return eval(parse(x));
};

// User Changeable Power Functions
var rightPower = function(y1, y2, x1, x2) {
	return y1;
};
var leftPower = function(y1, y2, x1, x2) {
	return y2;
};

// Listen for User Code Submission
$("form").on("submit", function(evt) {
	console.log("test");
	evt.preventDefault();
	leftPower = interpret($("#left").val());
	rightPower = interpret($("#right").val());
	x1 = 225, y1 = 250,
	x2 = 275, y2 = 250;
});
$("#deploy").on("click", function(evt) {	
	evt.preventDefault();
	$("pre.left").text(parse($("#left").val()));
	$("pre.right").text(parse($("#right").val()));
	leftPower = interpret($("#left").val());
	rightPower = interpret($("#right").val());
	x1 = 225, y1 = 250,
	x2 = 275, y2 = 250;
});

// Wait for Gamepad
var tank, controller;
var poll = function() {
	if(navigator.webkitGetGamepads()[0]) {
		controller = new Controller();
		tank = new Tank(controller, cvs);
		window.requestAnimationFrame(function() {
			tank.animate();
		});
	} else {
		window.requestAnimationFrame(poll);
	}
};
poll();