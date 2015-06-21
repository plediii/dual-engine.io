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

    it('should allow clients to send to mounted hosts', function (done) {
        d.mount(['dalek'], function (msg) {
            done();
        });

        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        d.engineio(socket.sideA);
    });

    it('should include "from" as tail in messages to hosts', function (done) {
        d.mount(['dalek'], function (msg) {
            assert.equal('merci', _.last(msg.from));
            done();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , from: ['merci']
            });
        });
        d.engineio(socket.sideA);
    });

    it('should include "body" in messages to hosts', function (done) {
        d.mount(['dalek'], function (msg) {
            assert.deepEqual({ hello: 'hi' }, msg.body)
            done();
        });

        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , body: { hello: 'hi' }
            });
        });
        d.engineio(socket.sideA);
    });

    it('should include "option" in messages to hosts', function (done) {
        d.mount(['dalek'], function (msg) {
            assert.deepEqual({ allo: 'salaam' }, msg.options)
            done();
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
                , option: { allo: 'salaam' }
            });
        });
        d.engineio(socket.sideA);
    });


});
