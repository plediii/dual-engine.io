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

    it('should send message if second argument returns"', function (done) {
        d.mount(['dalek'], function (msg) {
            done();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {});
    });

    it('should *not* send message if second argument throws"', function (done) {
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            throws 'filibuster';
        });
        done();
    });

    it('should send message after a returned promise resolves', function (done) {
        var resolved = false;
        d.mount(['dalek'], function (msg) {
            assert(resolved);
            done();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            return new Promise(function (resolve) {
                resolved = true;
                return resolve(true);
            });
        });
    });

    it('should not send a message if a returned promise does not resolve', function (done) {
        var resolved = false;
        d.mount(['dalek'], function (msg) {
            done('promise was not resolved');
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            return new Promise(function (resolve) {});
        });
        done();
    });

    it('should *not* send a message if returned promise rejects "', function (done) {
        d.mount(['dalek'], function (msg) {
            done('message was rejected');
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA, function (msg) {
            return new Promise(function (resolve, reject) {
                return reject();
            });
        });
        done();
    });

    it('should allow second argument to modify message bodies', function (done) {
        d.mount(['dalek'], function (msg) {
            assert.deepEqual({ five: 'alive' }, msg.body);
            done();
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
        });
    });

    it('should allow second argument to modify message options', function (done) {
        d.mount(['dalek'], function (msg) {
            assert.deepEqual({ business: 'side' }, msg.options);
            done();
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
        });
    });
});
