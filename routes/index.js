'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express',
        temps: DStemps
    });
});

var DStemps = [];
router.get('/set_temps', function (req, res) {

    if (req.query.temps) {
        DStemps = JSON.parse(req.query.temps);
        console.log(DStemps);
    }

    res.send("OK");
});


module.exports = router;