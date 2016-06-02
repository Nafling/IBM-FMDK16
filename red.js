var Client = require('ibmiotf');
var sphero = require("sphero");
orb = sphero("D3:27:B8:27:F1:06");

var speed = 0;
var direction = 0;
var calibration = false;

var config = {
    "org" : "fsmx8m",
    "id" : "blueorbfm16",
    "type" : "bb8",
    "auth-method" : "token",
    "auth-token" : "H_5wqaUpjzF?CC9am6"
};

var deviceClient = new Client.IotfDevice(config);

orb.connect(function() {
    orb.color("green");
    deviceClient.connect();
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
        calibrate = JSON.parse(payload).calibrate;
        orb.setStabilization(0);
        orb.setBackLed(255);
        orb.color("black");
	calibration = true;
        setTimeout(function() {
          orb.setHeading(calibrate);
          orb.setBackLed(0);
          orb.color("green");
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
