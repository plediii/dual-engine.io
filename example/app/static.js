
var path = require('path');
var express = require('express');
module.exports = function (app) {
    app.use(express.static(path.join(__dirname, '..', 'public')));
    return app;
};
