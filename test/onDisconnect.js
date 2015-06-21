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
            socket.disconnect();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA);
    });

    it('should send with "disconnect" and the connections from prefix', function (done) {
        var disconnected = false;
        d.mount(['disconnect', '**'], function () {
            assert(disconnected);
            done();
        });
        d.mount(['dalek'], function (msg) {
            socket.disconnect();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA);
    });


    it('should send a disconnect message when client disconnects', function (done) {
        var c = clientpool(dualapi(), ['robinhood']);
        var clientRoute;
        c.mount(['identify'], function (ctxt) {
            c.mount(['disconnect'].concat(ctxt.from), function (ctxt) {
                done();
            });
        });

        var socket = io.socket();
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['identify']
                , from: []
                , body: null
            });
            socket.sideB.emit('disconnect');
        });
        c.connect(socket.sideA);
    });

});
