'use strict';
var express = require('express');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();
const tempDB = new sqlite3.Database('./temps.sqlite3.db');

const gpio = require('rpi-gpio');
const SW_PIN = 37;
gpio.setup(SW_PIN, gpio.DIR_OUT);

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express'
    });
});

var DStemps = null;
router.get('/set_temps', function (req, res) {
    DStemps = req.query.temps;
    console.log(DStemps);

    res.send("OK");
});



router.get('/sw', function (req, res) {

    console.log("switch on");

    gpio.write(SW_PIN, true);

    setTimeout(() => {
        gpio.write(SW_PIN, false);
        console.log("switch off");
    }, 500);

    res.send("OK");
});



router.get('/temps', function (req, res) {


    tempDB.serialize(() => {

        tempDB.all('SELECT * FROM temps ORDER BY dt DESC LIMIT 4 ', (err, rows) => {
            if (err) {
                console.error('Error!', error);
                //return;
            }

            //console.log(`${row.dt}...${row.t1} ${row.t2}`);
            console.log(`${rows}`);

            res.render('temps', {
                title: 'Express',
                temps: JSON.stringify(rows)
            });
        });


    });
});


module.exports = router;