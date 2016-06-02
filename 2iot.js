var Client = require('ibmiotf');
var sphero = require("sphero");
orb = sphero("f2:97:44:8f:3f:92");
orb2 = sphero("D3:27:B8:27:F1:06");

var orbSpeed = 0;
var orbDirection = 0;
var orbCalibration = false;

var orb2Speed = 0;
var orb2Direction = 0;
var orb2Calibration = false;

var config = {
    "org" : "fsmx8m",
    "id" : "blueorbfm16",
    "type" : "bb8",
    "auth-method" : "token",
    "auth-token" : "H_5wqaUpjzF?CC9am6"
};

var deviceClient = new Client.IotfDevice(config);

orb.connect(function() {
    orb.color("blue");
    orb2.connect(function() {
        orb2.color("red");
        deviceClient.connect();
    });
});

deviceClient.on('connect', function () {
    console.log("Wohoo connected!!");
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
        orbCalibrate = JSON.parse(payload).calibrate;
        orb.setStabilization(0);
        orb.setBackLed(255);
        orb.color("black");
	orbCalibration = true;
        setTimeout(function() {
          orb.setHeading(calibrate);
          orb.setBackLed(0);
          orb.color("green");
          orb.setStabilization(1);
	  calibration = false;
        }, calibrate);
    }
    else if(commandName === "roll") {
        orbDirection = JSON.parse(payload).direction;
        if(orbCalibration === true){
	    orbSpeed = 0;
	} else {
	orbSpeed = JSON.parse(payload).speed;
	}
        orb.roll(orbSpeed, orbDirection);
    } else {
        console.log("Command not supported.. " + commandName);
    }
});
