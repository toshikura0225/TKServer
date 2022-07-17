'use strict';
var express = require('express');
var router = express.Router();

const gpio = require('rpi-gpio');
const SW_PIN = 37;
gpio.setup(SW_PIN, gpio.DIR_OUT);

const USB_SW_PIN = 35;
gpio.setup(USB_SW_PIN, gpio.DIR_OUT);



/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});




router.get('/sw', function (req, res) {

    console.log("switch on");

    gpio.write(SW_PIN, true);

    setTimeout(() => {
        gpio.write(SW_PIN, false);
        console.log("switch off");
    }, 500);

    res.send("sw OK");
});






router.get('/usbon', function (req, res) {

    console.log("usb on");

    gpio.write(USB_SW_PIN, false);

    res.send("usbon");
});

router.get('/usboff', function (req, res) {

    console.log("usb off");

    gpio.write(USB_SW_PIN, true);


    res.send("usboff");
});


module.exports = router;
