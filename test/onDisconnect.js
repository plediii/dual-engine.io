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
        d.mount(['identify'], function (ctxt) {
            d.mount(['disconnect'].concat(ctxt.from), function (ctxt) {
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
        d.engineio(socket.sideA);
    });

    it('should send disconnect with clients address', function (done) {
        var clientAddr = false;
        d.mount(['disconnect', '::clientAddr'], function (body, ctxt) {
            assert.deepEqual(ctxt.params.clientAddr, clientAddr);
        });
        d.mount(['vp'], function (body, ctxt) {
            clientAddr = ctxt.from;
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
