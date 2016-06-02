var sphero = require("sphero"),
    orb = sphero("f2:97:44:8f:3f:92"); // change BLE address accordingly 
 
orb.connect().then(function() {
  return orb.roll(155, 0);
}).then(function() {
  return orb.color("green");
}).then(orb.detectCollisions);

orb.on("collision", function(data) {
  console.log("collision detected");
  console.log("  data:", data);

  orb.color("red")
    .delay(100)
    .then(function() {
      return orb.color("green");
    });
});
