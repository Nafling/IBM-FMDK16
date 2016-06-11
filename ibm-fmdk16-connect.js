process.stdout.write('\033c'); //clear terminal

var redOrb = "D3:27:B8:27:F1:06";
var blueOrb = "f2:97:44:8f:3f:92";
var greenOrb = "EE:E5:60:10:DD:72";
var purpleOrb = "CD:A4:00:D9:75:00";

var Client = require('ibmiotf');
var sphero = require('sphero');
var controllerParameter = require('os').hostname();
var orbParameter = process.argv[2];

var speed = 0;
var direction = 0;
var batteryPower = 0;
var collisionScore = 0;
var calibration = false;

var config = {
	"org" : "neia69",
	"id" : "" + controllerParameter + "",
   	"type" : "BB-8",
	"auth-method" : "token",
	"auth-token" : "FiskErSundt"
};

switch(orbParameter){
	case "red": orb = sphero(redOrb); break;
	case "green": orb = sphero(greenOrb); break;
	case "blue": orb = sphero(blueOrb); break;
	case "purple": orb = sphero(purpleOrb); break;
	default:
	console.log("ERROR: Connect to Red, Green, Blue or Purple? Example: sudo node fmdk16-connect.js blue");
	process.exit(1);
};
console.log("Setting up MQTT-connection to " + orbParameter + " BB-8...");
console.log(config);

var deviceClient = new Client.IotfDevice(config);

orb.connect(function() {
	console.log("BB-8 Connected!");
	
	orb.detectCollisions({device: "bb8"});
	orb.on("collision", function(data) {
		//orb.color("red");
		collisionScore += 1;
		setTimeout(function() {
			orb.color(orbParameter);
		}, 500);
	});

	setInterval(function(){
		orb.getPowerState(function(err, data) {
		if (err) {
			console.log("error: ", err);
		} else {
			batteryPower = (data.batteryVoltage/800*100).toFixed(0);
		}});

		var payload = JSON.stringify({d:{
			"BB-8" : "" + orbParameter + "",
			"CollisionScore" : + collisionScore,
			"Battery" : + batteryPower
		}});
		deviceClient.publish("status","json", payload);
		console.log("Publishing: " + payload);
	}, 5000);
	orb.color(orbParameter);
	deviceClient.connect();
});

deviceClient.on('connect', function () {
	console.log("Connected to IBM Watson IoT Platform");
});

deviceClient.on("command", function (commandName,format,payload,topic) {
	console.log(JSON.parse(payload));

	if(commandName === "color" ) {
		orb.color(JSON.parse(payload));
	} else if(commandName === "reset" ) {
		reset = JSON.parse(payload).reset;
		calibration = true;
		setTimeout(function() {
			collisionScore = 0;
			calibration = false;
		}, reset);
	} else if(commandName === "calibrate") {
		calibrate = JSON.parse(payload).calibrate;
		orb.startCalibration();
		calibration = true;
		setTimeout(function() {
			orb.finishCalibration();
			orb.color(orbParameter);
			calibration = false;
		}, calibrate);
	} else if(commandName === "roll") {
		direction = JSON.parse(payload).direction;
		if(calibration === true){
			speed = 0;
		} else {
			speed = JSON.parse(payload).speed;
		}
		orb.roll(speed, direction);
	} else {
		console.log("Command not supported.. " + commandName);
	}
});
