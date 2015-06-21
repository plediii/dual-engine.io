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

    it('should send index event on connect', function (done) {
        socket.sideB.on('dual', function (msg) {
            assert.deepEqual(msg.to, ['index']);
            done();
        });
        d.engineio(socket.sideA);
    });


    it('should send second argument as from', function (done) {
        socket.sideB.on('dual', function (msg) {
            assert.deepEqual(msg.from, ['robinhood']);
            done();
        });
        d.engineio(socket.sideA, ['robinhood']);
    });

    it('should send connect event', function (done) {
        console.log('incomplete test');
    });

});
