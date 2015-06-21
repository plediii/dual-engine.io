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


    it('should send second argument has from', function (done) {
        socket.sideB.on('dual', function (msg) {
            assert.deepEqual(msg.from, ['robinhood']);
            done();
        });
        d.engineio(socket.sideA, ['robinhood']);
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

    it('should give each client a unique "from" address ', function (done) {
        var count = 0;
        var from;
        d.mount(['dalek'], function (msg) {
            count++;
            if (count === 1) {
                from = msg.from;
            } else if (count === 2) {
                assert.deepEQual(from, from);
                assert.notDeepEqual(from, msg.from);
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
        testSocket(io.socket());
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

    it('should send a connect event client connects', function (done) {
        var c = clientpool(dualapi(), ['robinhood']);
        var clientroute;

        c.mount(['connect', '**'], function (ctxt) {
            clientroute = ctxt.to.slice(1);
        });

        c.mount(['identify'], function (ctxt) {
            assert.deepEqual(ctxt.from, clientroute);
            done();
        });

        var socket = io.socket();
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['identify']
                , from: []
                , body: null
            });
        });
        c.connect(socket.sideA);
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
