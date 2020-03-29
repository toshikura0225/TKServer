'use strict';

const mcpadc = require('mcp-spi-adc');

const tempSensor = mcpadc.open(6, {speedHz: 20000}, err => {
  if (err) throw err;
 
  setInterval(_ => {
    tempSensor.read((err, reading) => {
      if (err) throw err;
 
      console.log(reading.value * 5);
      //console.log((reading.value * 5.0) * 100);
    });
  }, 1000);
});