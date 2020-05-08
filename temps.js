'use strict';

const fs = require('fs');
const async = require('async');
const request = require('request');
require('date-utils');

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

// DB
const sqlite3 = require('sqlite3').verbose();
const tempDB = new sqlite3.Database('./temps.sqlite3');


const temps_config = require('./temps.json');
const deviceList = temps_config["deviceList"];

var temps = null;

async function main() {
	console.log("main");

	// 温度測定
	await main_temperature();

	// AD値測定
	await main_ads();


	console.log("requesting");
	request({
		method: 'get',
		//url: `http://localhost:3000/set_temps?temps=${temps}`
		url: `http://${temps_config['global_ip']}/set_temps?temps=${temps} / ${voltageIC_MCP3208.voltageValue}`
	}, (error, response, body) => {
		console.log(`error:${error}`);
		console.log(`body:${body}`);
	});
}

(async () => {
	console.log("init");
	await createTable();
})().then(() => {
	console.log("then");

	var tempTimerID = setInterval(main, 60 * 1000);
	main();
});


function main_temperature() {


	return new Promise(resolve => {

		tempDB.serialize(() => {

			var stmt = tempDB.prepare('INSERT INTO t_temps (dt, name, temp) VALUES (?, ?, ?)');
			let now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");

			async.eachSeries(Object.keys(deviceList), (id, next) => {

				console.log(`Reading ${id}.`);

				get_wire(id, (temp) => {
					deviceList[id]["value"] = (temp !== null) ? temp + deviceList[id]["offset"] : null;
					console.log(`temp=${deviceList[id]["value"]}(${temp})`);

					let data = [now, deviceList[id]["name"], deviceList[id]["value"]];
					stmt.run(data, (err_run) => {
						if (err_run) {
							console.log(`err_run=${err_run}`);
						}
						next();
					});
				});
			}, (err) => {

				stmt.finalize();
				if (err) throw err;

				temps = Object.keys(deviceList).map(id => deviceList[id]["value"]);
				console.log(`Measured ${temps}`);


				resolve();
			});
		});
	});
}

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

function createTable() {
	return new Promise(resolve => {
		tempDB.serialize(() => {
			let sqls = [
				'CREATE TABLE IF NOT EXISTS "t_temps"(\
					"dt"	TIMESTAMP,\
					"name"	TEXT,\
					"temp"	REAL)'
				];
			
			tempDB.run(sqls[0]);
			console.log("run");
			resolve();
		});
	});

}

// ==================  AD変換IC「MCP3208」関連 ==================

const IC_MCP3208 = require('./my_lib/IC_MCP3208.js');
var voltageIC_MCP3208 = new IC_MCP3208(5.0, 0.0);


async function main_ads() {

	console.log("reading ADs");
	return new Promise(resolve => {

		tempDB.serialize(() => {

			var stmt = tempDB.prepare('INSERT INTO t_temps (dt, name, temp) VALUES (?, ?, ?)');
			let now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");

			async.eachSeries([...Array(8)].map((_, i) => i), (i, next) => {


				console.log(`Reading CH${i}.`);

				voltageIC_MCP3208.getADValue(i, (ch, voltage) => {
					console.log(`Read CH${ch} = ${voltage}`);

					let data = [now, `CH${ch}`, voltage];
					stmt.run(data, (err_run) => {
						if (err_run) {
							console.log(`err_run=${err_run}`);
						}
						next();
					});
				});

			}, (err) => {

				stmt.finalize();
				if (err) throw err;

				let temps = Object.keys(deviceList).map(id => deviceList[id]["value"]);
				console.log(`Measured ${temps}`);

				resolve();

			});
		});
	});
}
