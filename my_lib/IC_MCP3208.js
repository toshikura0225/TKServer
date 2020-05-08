'use strict';

const spi = require('spi-device');
const async = require('async');

// 1-wire温度センサ「DS18B20」用のライブラリ
module.exports = class IC_MCP3208 {

	constructor(Vref, AGND) {
		this.Vref = Vref;
		this.AGND = AGND;
		this.NUM_OF_CH = 8;
		this.NUM_OF_AVE = 10;
		this.MAX_MIN_FILTER = 8;

		this.voltageValue = [];
		this.namaValueArray = [];
		this.centerValueArray = [];
		for (let i = 0; i < this.NUM_OF_CH; i++) {

			this.voltageValue.push(0);
			this.namaValueArray.push([]);
			this.centerValueArray.push([]);

			for (let j = 0; j < this.MAX_MIN_FILTER; j++) {
				this.centerValueArray[i].push(0);
			}
		}

		this.mcp3208 = spi.openSync(0, 0);
	}
	
	getADValues(read_callback) {
		let chs = [0, 1, 2, 3, 4, 5, 6, 7];
		async.each(chs, function (ch, callback) {

			//stampLog(`AD読み込み開始[${port["sensor"]["name"]}]`);
			this.getADValue(ch, function (read_channel, adValue) {
				this.voltageValue[read_channel] = adValue;
				console.log("ch:" + read_channel + " = " + adValue);


				/*
				if (this.voltageValue[read_channel] >= 0) {
					this.voltageValue[read_channel] = this.voltageValue[read_channel] * 0.96 + adValue * 0.04;	// ローパスフィルタ
				} else {
					this.voltageValue[read_channel] = adValue;
				}
				*/

				/*
				// 生AD値の平均を計算する
				this.namaValueArray[read_channel].push(adValue);
				let len = this.namaValueArray[read_channel].length;

				if (adValue <= 5 && len >= 2) {
					this.namaValueArray[read_channel][len - 1] = this.namaValueArray[read_channel][len - 2];
				}


				if (len >= this.NUM_OF_AVE) {
					// 指定回数分のデータをとったら

					// 平均値を計算
					let sum = 0;
					for (let i = 0; i < len; i++) {
						sum += this.namaValueArray[read_channel][i];
					}
					this.namaValueArray[read_channel] = [];

					// 中央値計算用の配列に追加
					this.centerValueArray[read_channel].push(sum / len);

					// 中央値計算用にソート
					let sorted = this.centerValueArray[read_channel].slice().sort((a, b) => {
						return (a - b);
					});

					// 中央値をAD値とする。ただし多少の移動平均をかける
					this.voltageValue[read_channel] = this.voltageValue[read_channel] * 0.2 + sorted[parseInt(len / 2)] * 0.8;

					//if (ch === 0) {
					//    let str = "";
					//    for (let i = 0; i < this.MAX_MIN_FILTER; i++) {
					//        str = str + this.centerValueArray[read_channel][i] + ", ";

					//    }
					//    console.log(str);
					//}

					// 古い中央値計算用の平均値配列を削除
					this.centerValueArray[read_channel].shift();
				}
				*/

				//stampLog(`AD読み込み完了[${port}]`);
				callback(null);

			}.bind(this));

		}.bind(this)).then(() => {
			read_callback();
		});

		
	}

	getADValue(channel, read_callback) {

		// An SPI message is an array of one or more read+write transfers
		let sendMessage = [{
			sendBuffer: Buffer.from([(0x06 | (channel >> 2)), (channel << 6), 0x00]), // http://www.geocities.jp/zattouka/GarageHouse/micon/circuit/A_D.htm Sent to read channel 5
			//sendBuffer: new Buffer([0x01, (8 + channel << 4), 0x01]), // https://gist.github.com/stephanebachelier/b26f075aa40ad862379235930866b6e7
			//sendBuffer: Buffer.from([0x01, 0xd0, 0x00]), //
			receiveBuffer: Buffer.alloc(3),              // Raw data read from channel 5
			byteLength: 3,
			speedHz: 20000 // Use a low bus speed to get a good reading from the TMP36
		}];

		this.mcp3208.transfer(sendMessage, (err, recvMessage) => {

			if (err) throw err;

			// Convert raw value from sensor to celcius and log to console
			let rawValue = ((recvMessage[0].receiveBuffer[1] & 0x0F) << 8) +
				recvMessage[0].receiveBuffer[2];
			//console.log(rawValue);
			//const voltage = rawValue * 3.3 / 1023;
			let voltage = rawValue * (this.Vref - this.AGND) / 4096.0;
			//const celcius = (voltage - 0.5) * 100;

			//this.voltageValue[channel] = voltage;
			read_callback(channel, voltage);
		});
	}

};

