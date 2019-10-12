'use strict';

// 動作させるプラットフォーム
const platform = require('os').platform();
console.log(platform);

const fs = require('fs');


var tempsID = setInterval(() => {

    get_wire("28-030897790b03", (temp) => {
        console.log(temp);
    });

}, 5000);

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

