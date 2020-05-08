﻿'use strict';
var express = require('express');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();
//const tempDB = new sqlite3.Database('./temps.sqlite3');


var DStemps = null;

/* GET home page. */
router.get('/', function (req, res) {
	res.render('index', {
		//title: 'Express'
		title: `【index】${DStemps}`
	});
});


router.get('/set_temps', function (req, res) {
	DStemps = req.query.temps;
	console.log(DStemps);

	//res.send("OK");
	res.render('index', {
		title: `【set_temps】 ${DStemps}`
	});
});


router.get('/temps', function (req, res) {

	res.render('index', {
		title: `【temps】 ${DStemps}`
	});


	/*
	tempDB.serialize(() => {

		tempDB.all('SELECT * FROM temps ORDER BY dt DESC LIMIT 4 ', (err, rows) => {
			if (err) {
				console.error('Error!', err);
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
	*/
});


module.exports = router;