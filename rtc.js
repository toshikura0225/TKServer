'use strict';

let CONTROL_1 = 0x00;
let CONTROL_2 = 0x01;
let CONTROL_3 = 0x02;
let SECONDS = 0x03;
let MINUTES = 0x04;
let HOURS = 0x05;
let DAYS = 0x06;
let WEEKDAYS = 0x07;
let MONTHS = 0x08;
let YEARS = 0x09;
let SECOND_ALARM = 0x0A;
let MINUTE_ALARM = 0x0B;
let HOUR_ALRAM = 0x0C;
let DAY_ALARM = 0x0D;
let WEEKDAY_ALARM = 0x0E;
let WATCHDG_TIM_CTL = 0x10;
let WATCHDG_TIM_VAL = 0x11;
let TIMESTP_CTL = 0x12;
let SEC_TIMESTP = 0x13;
let MIN_TIMESTP = 0x14;
let HOUR_TIMESTP = 0x15;
let DAY_TIMESTP = 0x16;
let MON_TIMESTP = 0x17;
let YEAR_TIMESTP = 0x18;
let AGING_OFFSET = 0x19;



const i2c = require('i2c-bus');
 
const MCP9808_ADDR = 0x51;
const TEMP_REG = 0x00;
 
const i2c1 = i2c.open(1, err => {
    if (err) throw err;

    /*
 
  i2c1.readWord(MCP9808_ADDR, TEMP_REG, (err, rawData) => {
    if (err) throw err;
 
    console.log(`Read data: ${rawData}`);
 
    i2c1.close(err => {
      if (err) throw err;
    });

*/
    
    for (let i = 0x00; i < 0x10; i++) {
        const address = TEMP_REG + i;
        const rawData = i2c1.readWordSync(MCP9808_ADDR, address) & 0b01111111;
        console.log(`[0x${address.toString(16)}]: ${rawData} 0x${rawData.toString(16)} / ${(rawData >> 4) & 0b111} ${rawData & 0b1111}`);
    }
    
    //i2c1.writeWordSync(MCP9808_ADDR, 0x03, 0);
    //i2c1.closeSync();
    //i2c1.closeSync();
    
  //});
});