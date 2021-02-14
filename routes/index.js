'use strict';
var express = require('express');
var router = express.Router();

var req_url = null;

/* GET home page. */
router.get('/', function (req, res) {

    let vvv = "OK";
    if (req.url.indexOf("?") != -1) {
        req_url = req.url
    }
    else {
        vvv = req_url;
    }
    res.render('index', { title: vvv });
});

module.exports = router;
