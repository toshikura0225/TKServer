'use strict';

const fs = require('fs');
const async = require('async');
const request = require('request');

//var deviceList = {
//    "28-030897790b03": { "offset": -0.984, "value": 0 },    // 外気温
//    "28-0308977986cf": { "offset": -0.57, "value": 0 },     // 室温（上部）
//    "28-030897791fc8": { "offset": 0.73, "value": 0 },      // 給水槽
//    "28-030997796347": { "offset": 0.62, "value": 0 },      // 生育槽
//    "28-031097791505": { "offset": 0, "value": 0 }          // 室温（下部）
//};


// 動作させるプラットフォーム
const platform = require('os').platform();
console.log(platform);


const temps_config = require('./temps.json');
console.log(`deviceList = ${temps_config}`);
const deviceList = temps_config["deviceList"];

function main() {

    async.eachSeries(Object.keys(deviceList), (id, next) => {

        console.log(`Reading ${id}.`);

        get_wire(id, (temp) => {
            deviceList[id]["value"] = temp + deviceList[id]["offset"];
            //console.log(`temp=${deviceList[id]["value"]}(${temp})`);
            next();
        });
    }, (err) => {
        if (err) throw err;

        let temps = Object.keys(deviceList).map(id => deviceList[id]["value"]);
        console.log(`Measured ${temps}`);

        request({
            method: 'get',
            url: `http://localhost:3000/set_temps?temps=${temps}`
        }, (error, response, body) => {
            //console.log(`error:${error}`);
            //console.log(`body:${body}`);
        });
    });

}

var tempTimerID = setInterval(main , 60 * 1000);
main();

function get_wire(ds_id, next) {

    if (platform === 'linux') {
        let path = `/sys/bus/w1/devices/${ds_id}/w1_slave`;

        fs.readFile(path, 'utf-8', (err, data) => {

            // 例外処理
            if (err) { throw err; }
            let temp = null;

            if (data.match(/YES/)) {

                let matches = data.match(/t=(\d+)/);
                temp = parseInt(matches[1]) / 1000;

            } else {
                temp = null;
            }

            next(temp);
        });
    } else if (platform === 'win32') {
        let max = 30, min = -10;
        let temp = Math.random() * (max + 1 - min) + min;
        next(temp);
    }

}

