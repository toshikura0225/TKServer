'use strict';

const mcpadc = require('mcp-spi-adc');
const gpio = require('rpi-gpio');

const SW_PIN = 40;
gpio.setup(SW_PIN, gpio.DIR_OUT);

const tempSensor = mcpadc.open(6, {speedHz: 20000}, err => {
  if (err) throw err;
 
  setInterval(_ => {
    tempSensor.read((err, reading) => {
      if (err) throw err;
 
      console.log(reading.value * 5);
      //console.log((reading.value * 5.0) * 100);
    });
    
    gpio.write(SW_PIN, true);
    console.log("switch on");

    setTimeout(() => {
        gpio.write(SW_PIN, false);
        console.log("switch off");
    }, 500);
    
  }, 1000);
});