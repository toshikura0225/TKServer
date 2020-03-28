'use strict';

const fs = require('fs');
const async = require('async');
const request = require('request');

//var deviceList = {
//    "28-030897790b03": { "offset": -0.984, "value": 0 },    // 1 ヒーター付き水槽内部
//    "28-0308977986cf": { "offset": -0.57, "value": 0 },     // 2 ヒータ吹き出し温度
//    "28-030897791fc8": { "offset": 0.73, "value": 0 },      // 3
//    "28-030997796347": { "offset": 0.62, "value": 0 },      // 4
//    "28-031097791505": { "offset": 0, "value": 0 }          // 5
//    "28-031097791505": { "offset": 0, "value": 0 }          // 6 温調なし水温
//    "28-031097791505": { "offset": 0, "value": 0 }          // 7 ハウス下部
//    "28-031097791505": { "offset": 0, "value": 0 }          // 8 水耕栽培キット出口液温
//    "28-031097791505": { "offset": 0, "value": 0 }          // 9 
//    "28-031097791505": { "offset": 0, "value": 0 }          // 10 
//};


// 動作させるプラットフォーム
const platform = require('os').platform();
console.log(platform);

// DB
const sqlite3 = require('sqlite3').verbose();
const tempDB = new sqlite3.Database('./temps.sqlite3.db');


const temps_config = require('./temps.json');
const deviceList = temps_config["deviceList"];

function main() {

    async.eachSeries(Object.keys(deviceList), (id, next) => {

        console.log(`Reading ${id}.`);

        get_wire(id, (temp) => {
            deviceList[id]["value"] = (temp !== null) ? temp + deviceList[id]["offset"] : null;
            //console.log(`temp=${deviceList[id]["value"]}(${temp})`);
            next();
        });
    }, (err) => {
        if (err) throw err;

        let temps = Object.keys(deviceList).map(id => deviceList[id]["value"]);
        console.log(`Measured ${temps}`);

        try {
            tempDB.serialize(function() {
                //tempDB.run(`INSERT INTO temps (dt, t1, t2, t3, t4, t5) VALUES (datetime('now', 'localtime'), ${temps[0]},${temps[1]},${temps[2]},${temps[3]},${temps[4]})`);
                let sql = `INSERT INTO temps (dt, t1, t2, t3, t4, t5, t6,t7, t8, t9, t10) VALUES (datetime('now', 'localtime'), ${temps[0]},${temps[1]},${temps[2]},${temps[3]},${temps[4]},${temps[5]},${temps[6]},${temps[7]},${temps[8]},${temps[9]})`
                console.log(sql);
                tempDB.run(sql);
                //tempDB.finalize();
            });
        } catch (e) {
            console.error(`DB error:${e}`);
        }
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

        fs.stat(path, (error, stats) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    console.log('ファイル・ディレクトリは存在しません。');
                } else {
                    console.log(error);
                }
                next(null);
            } else {

                fs.readFile(path, 'utf-8', (err, data) => {

                    // 例外処理
                    if (err) { throw err; }
                    let temp = null;

                    if (data.match(/YES/)) {
                        try {
                            let matches = data.match(/t=(\d+)/);
                            temp = parseInt(matches[1]) / 1000;
                        }catch(e) {
                            console.log(error);
                        }
                    } else {
                        temp = null;
                    }

                    next(temp);
                });
            }
        });
    } else if (platform === 'win32') {
        let max = 30, min = -10;
        let temp = Math.random() * (max + 1 - min) + min;
        next(temp);
    }

}

