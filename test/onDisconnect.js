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

    it('should send to "disconnect" when a client disconnects', function (done) {
        var disconnected = false;
        d.mount(['disconnect', '**'], function () {
            assert(disconnected);
            done();
        });
        d.mount(['dalek'], function (msg) {
            disconnected = true;
            socket.disconnect();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA);
    });

    it('should send disconnect with clients address', function (done) {
        var clientAddr = false;
        d.mount(['disconnect', '::clientAddr'], function (body, ctxt) {
            assert.deepEqual(ctxt.params.clientAddr, clientAddr);
            done();
        });
        d.mount(['vp'], function (body, ctxt) {
            clientAddr = ctxt.from;
            socket.disconnect();
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
