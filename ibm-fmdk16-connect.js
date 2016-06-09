var redOrb = "D3:27:B8:27:F1:06";
var blueOrb = "f2:97:44:8f:3f:92";
var greenOrb = "EE:E5:60:10:DD:72";
var purpleOrb = "CD:A4:00:D9:75:00";

process.stdout.write('\033c'); //clear terminal
var Client = require('ibmiotf');
var sphero = require("sphero");
var controllerParameter = require('os').hostname().split('.').shift();
var orbParameter = process.argv[2];

var speed = 0;
var direction = 0;
var calibration = false;

var config = {
    "org" : "neia69",
    "id" : "" + controllerParameter + "",
    "type" : "BB-8",
    "auth-method" : "token",
    "auth-token" : "FiskErSundt"
};

switch(orbParameter){
    case "red":
        orb = sphero(redOrb);
        console.log("Setting up MQTT-connection to Red BB-8...");
        console.log(config);
        break;
    case "green":
        orb = sphero(greenOrb);
        console.log("Setting up MQTT-connection to Green BB-8...");
        console.log(config);
        break;
    case "blue":
        orb = sphero(blueOrb);
        console.log("Setting up MQTT-connection to Blue BB-8...");
        console.log(config);
        break;
    case "purple":
        orb = sphero(purpleOrb);
        console.log("Setting up MQTT-connection to Purple BB-8...");
        console.log(config);
        break;
    default:
        console.log("ERROR: Connect to Red, Green, Blue or Purple? Example: sudo node fmdk16-connect.js blue");
        process.exit(1);
};

var deviceClient = new Client.IotfDevice(config);

orb.connect(function() {
    console.log("BB-8 Connected!");
    orb.color(orbParameter);

    deviceClient.connect();
});

deviceClient.connect();

deviceClient.on('connect', function () {
    console.log("Connected to IBM Watson IoT Platform");
    deviceClient.publish("status","json",'{"d" : { "cpu" : 60, "mem" : 50 }}');
});

deviceClient.on("command", function (commandName,format,payload,topic) {
    console.log(JSON.parse(payload));

    if(commandName === "color" ) {
        console.log(JSON.parse(payload).color);
	orb.color(JSON.parse(payload).color);
    }
    else if(commandName === "calibrate") {
        console.log(JSON.parse(payload).calibrate);
        calibrate = JSON.parse(payload).calibrate;
        orb.setStabilization(0);
        orb.setBackLed(255);
        orb.color("black");
	calibration = true;
        setTimeout(function() {
          orb.setHeading(0);
          orb.setBackLed(0);
          orb.color(orbParameter);
          orb.setStabilization(1);
	  calibration = false;
        }, calibrate);
    }
    else if(commandName === "roll") {
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
