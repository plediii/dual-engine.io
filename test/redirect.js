/*jslint node: true */
"use strict";

var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');
var dualproto = require('dual-protocol');

var io = require('./mock-io');

describe('dual engine.io', function () {

    var d, socket;
    beforeEach(function () {
        d = dualproto.use(require('../index'))();
        socket = io.socket();
    });

    it('should respond with redirect event when connected with redirect client', function (done) {
        var c = clientpool(dualapi(), ['robinhood']);
        var socket = io.socket();
        socket.sideB.on('dual', function (msg) {
            assert.deepEqual(msg.to, ['redirect']);
            assert.equal(msg.body, '/yo');
            done();
        });
        c.redirectClient(socket.sideA, '/yo');
    });

    it('should disconnect client after redirect', function (done) {
        var c = clientpool(dualapi(), ['robinhood']);
        var socket = io.socket();
        socket.sideB.on('disconnect', function (msg) {
            done();
        });
        c.redirectClient(socket.sideA, '/yo');
    });

});
