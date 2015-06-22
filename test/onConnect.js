/*jslint node: true */
"use strict";

var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');
var dualproto = require('dual-protocol');

var io = require('./mock-io');

describe('on connect', function () {

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


    it('should send indexRoute', function (done) {
        socket.sideB.on('dual', function (msg) {
            assert.deepEqual(msg.from, ['robinhood']);
            done();
        });
        d.engineio(socket.sideA, {
            indexRoute: ['robinhood']
        });
    });

    it('should send connect event', function (done) {
        d.mount(['connect', '**'], function () {
            done();
        });
        d.engineio(socket.sideA);
    });

    it('should send connect event with client address', function (done) {
        var clientAddr = false;
        d.mount(['vp'], function (body, ctxt) {
            assert(clientAddr.length > 0);
            assert.deepEqual(clientAddr, ctxt.from);
            done();
        });
        d.mount(['connect', '::clientAddr'], function (body, ctxt) {
            clientAddr = ctxt.params.clientAddr;
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['vp']
                , from: []
            });
        });
        d.engineio(socket.sideA);
    });

});
