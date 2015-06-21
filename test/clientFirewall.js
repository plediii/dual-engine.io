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

    it('should call second argument on incoming messages', function (done) {
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            done();
        });
    });

    it('should call second argument with incoming message "to"', function (done) {
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            assert.deepEqual(['dalek'], msg.to);
            done();
        });
    });

    it('should call second argument with incoming message "from"', function (done) {
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , from: ['merci']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            assert.deepEqual('merci', _.last(msg.from));
            done();
        });
    });

    it('should call second argument with incoming message "body"', function (done) {
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , body: { mr: 'vicepresident' }
            });
        });
        d.engineio(socket.sideA, function (msg) {
            assert.deepEqual({ mr: 'vicepresident' }, msg.body);
            done();
        });
    });

    it('should call second argument with incoming message "options"', function (done) {
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , options: { business: 'side' }
            });
        });
        d.engineio(socket.sideA, function (msg) {
            assert.deepEqual({ business: 'side' }, msg.options);
            done();
        });
    });

    it('should send message if second argument returns true"', function (done) {
        d.mount(['dalek'], function (msg) {
            done();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            return true;
        });
    });

    it('should *not* send message if second argument returns false"', function (done) {
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            return false;
        });
        done();
    });

    it('should *not* send message if second argument does not return"', function (done) {
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {});
        done();
    });

    it('should send message if second argument returns a Promise resolving to true"', function (done) {
        d.mount(['dalek'], function (msg) {
            done();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            return new Promise(function (resolve) {
                return resolve(true);
            });
        });
    });

    it('should *not* send if second argument returns a Promise resolving to false"', function (done) {
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            return new Promise(function (resolve) {
                return resolve(false);
            });
        });
        done();
    });

    it('should allow second argument to modify message bodies', function (done) {
        d.mount(['dalek'], function (msg) {
            assert.deepEqual({ five: 'alive' }, msg.body);
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , body: { yo: 'hi' }
                , options: { mountain: 'side' }
            });
        });
        d.engineio(socket.sideA, function (msg) {
            msg.body = { five: 'alive' };
            return true;
        });
    });

    it('should allow second argument to modify message options', function (done) {
        d.mount(['dalek'], function (msg) {
            assert.deepEqual({ business: 'side' }, msg.options);
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , body: { yo: 'hi' }
                , options: { mountain: 'side' }
            });
        });
        d.engineio(socket.sideA, function (msg) {
            msg.options = { business: 'side' };
            return true;
        });
    });

    it('should reuse "from" address from clients', function (done) {
        var count = 0;
        var from;
        d.mount(['dalek'], function (msg) {
            count++;
            if (count === 1) {
                from = msg.from;
            } else if (count === 2) {
                assert.deepEqual(from, msg.from);
                done();
            }
        });
        var testSocket = function (asocket) {
            asocket.sideB.on('dual', function () {
                asocket.sideB.emit('dual', {
                    to: ['dalek']
                    , body: { yo: 'hi' }
                    , options: { mountain: 'side' }
                });
            });
            d.engineio(asocket.sideA);
        };
        testSocket(socket);
        testSocket(socket);
    });

});
