/*jslint node: true */
"use strict";

var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');
var dualproto = require('dual-protocol');

var io = require('./mock-io');

describe('dual engine.io server to client', function () {

    var d, socket;
    beforeEach(function () {
        d = dualproto.use(require('../index'))();
        socket = io.socket();
    });

    it('should allow server to send to clients', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            ctxt.send(ctxt.from.concat('cat'));
        });

        var count = 0;
        socket.sideB.on('dual', function () {
            count++;
            if (count === 1) {
                socket.sideB.emit('dual', {
                    to: ['dalek']
                });
            } else {
                done();
            }
        });
        d.engineio(socket.sideA);
    });

    it('should send with stripped client address', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            ctxt.send(ctxt.from.concat(['scraps']));
        });

        var count = 0;
        socket.sideB.on('dual', function (msg) {
            count++;
            if (count === 1) {
                socket.sideB.emit('dual', {
                    to: ['dalek']
                });
            } else {
                assert.deepEqual(msg.to, ['scraps']);
                done();
            }
        });
        d.engineio(socket.sideA);
    });

    it('should send with provided from', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            ctxt.send(ctxt.from.concat(['scraps']), ['captain']);
        });
        var count = 0;
        socket.sideB.on('dual', function (msg) {
            count++;
            if (count === 1) {
                socket.sideB.emit('dual', {
                    to: ['dalek']
                });
            } else {
                assert.deepEqual(msg.from, ['captain']);
                done();
            }
        });
        d.engineio(socket.sideA);
    });

    it('should send with provided body', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            ctxt.send({
                to: ctxt.from.concat('cat')
                , body: { we: 'got' }
            });
        });
        var count = 0;
        socket.sideB.on('dual', function (msg) {
            count++;
            if (count === 1) {
                socket.sideB.emit('dual', {
                    to: ['dalek']
                });
            } else {
                assert.deepEqual(msg.body, { we: 'got' });
                done();
            }
        });
        d.engineio(socket.sideA);
    });

    it('should send with provided options', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            ctxt.send({
                to: ctxt.from.concat("cat")
                , options: { video: 'games' }
            });
        });
        var count = 0;
        socket.sideB.on('dual', function (msg) {
            count++;
            if (count === 1) {
                socket.sideB.emit('dual', {
                    to: ['dalek']
                });
            } else {
                assert.deepEqual(msg.options, { video: 'games' });
                done();
            }
        });
        d.engineio(socket.sideA);
    });

});
