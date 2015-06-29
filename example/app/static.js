
var path = require('path');
var express = require('express');
var browserify = require('browserify-middleware');

module.exports = function (app) {
    app.use(express.static(path.join(__dirname, '..', 'public')));
    app.get('/app.js', browserify(__dirname + '/../client/served.js'));
    return app;
};
