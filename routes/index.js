'use strict';
var express = require('express');
var router = express.Router();

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

router.get('/temps', function (req, res) {
    res.render('temps', {
        title: 'Express',
        temps: DStemps
    });
});


module.exports = router;