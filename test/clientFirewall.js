/*jslint node: true */
"use strict";

var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');
var dualproto = require('dual-protocol');

var io = require('./mock-io');

describe('client firewall', function () {

    var d, socket;
    beforeEach(function () {
        d = dualproto.use(require('../index'))();
        socket = io.socket();
    });

    it('should call firewall on incoming messages', function (done) {
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                done();
            }});
    });

    it('should call firewall with incoming message "to"', function (done) {
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                assert.deepEqual(['dalek'], msg.to);
                done();
            }});
    });

    it('should call firewall with incoming message "from"', function (done) {
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , from: ['merci']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                assert.deepEqual('merci', _.last(msg.from));
                done();
            }});
    });

    it('should call firewall with incoming message "body"', function (done) {
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , body: { mr: 'vicepresident' }
            }));
        });
        d.engineio(socket.serverSide, { 
            firewall: function (msg) {
                assert.deepEqual({ mr: 'vicepresident' }, msg.body);
                done();
            }});
    });

    it('should call firewall with incoming message "options"', function (done) {
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , options: { business: 'side' }
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                assert.deepEqual({ business: 'side' }, msg.options);
                done();
            }});
    });

    it('should call firewall with socket"', function (done) {
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , options: { business: 'side' }
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg, fsocket) {
                assert.equal(socket.serverSide, fsocket);
                done();
            }});
    });

    it('should send message if firewall returns"', function (done) {
        d.mount(['dalek'], function (msg) {
            done();
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {}});
    });

    it('should *not* send message if firewall throws"', function (done) {
        d.mount(['error'], function () {
            done();
        });
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                throw 'filibuster';
            }});
    });

    it('should send error if firewall throws"', function (done) {
        d.mount(['error'], function (body) {
            assert.equal(body.error, 'filibuster');
            assert.deepEqual(body.msg, { to: ['dalek' ]});
            assert.equal(body.socket, socket.serverSide);
            assert(_.isArray(body.client));
            done();
        });
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                throw 'filibuster';
            }});
    });

    it('should send error to specific engine.io error route"', function (done) {
        d.mount(['error', 'engineio', 'firewall'], function (body) {
            assert.equal(body.error, 'filibuster');
            assert.deepEqual(body.msg, { to: ['dalek' ]});
            assert.equal(body.socket, socket.serverSide);
            assert(_.isArray(body.client));
            done();
        });
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                throw 'filibuster';
            }});
    });

    it('should send message after a returned promise resolves', function (done) {
        var resolved = false;
        d.mount(['dalek'], function (msg) {
            assert(resolved);
            done();
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                return new Promise(function (resolve) {
                    resolved = true;
                    return resolve(true);
                });
            }});
    });

    it('should not send a message if a returned promise does not resolve', function (done) {
        var resolved = false;
        d.mount(['dalek'], function (msg) {
            done('promise was not resolved');
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                return new Promise(function (resolve) {});
            }});
        done();
    });

    it('should *not* send a message if returned promise rejects "', function (done) {
        d.mount(['error'], function (body) {
            done();
        });
        d.mount(['dalek'], function (msg) {
            done('message was rejected');
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                return new Promise(function (resolve, reject) {
                    return reject('congratulations');
                });
            }});
    });

    it('should send error if firewall throws"', function (done) {
        d.mount(['error', 'engineio', 'firewall'], function (body) {
            assert.equal(body.error, 'congratulations');
            assert.deepEqual(body.msg, { to: ['dalek' ]});
            assert.equal(body.socket, socket.serverSide);
            assert(_.isArray(body.client));
            done();
        });
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                return new Promise(function (resolve, reject) {
                    return reject('congratulations');
                });
            }});
    });

    it('should *not* send firewall error if recipient throws"', function (done) {
        d.mount(['error', 'engineio', 'firewall'], function () {
            done('error was not a firewall error');
        });
        d.mount(['dalek'], function (msg) {
            throw 'expected unhandled error';
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {}});
        done();
    });

    it('should *not* send firewall error if recipient resolves"', function (done) {
        d.mount(['error', 'engineio', 'firewall'], function () {
            done('error was not a firewall error');
        });
        d.mount(['dalek'], function (msg) {
            throw 'expected unhandled error';
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                return Promise.resolve('no problem');
            }});
        done();
    });

    it('should send error to specific engine.io error route"', function (done) {
        d.mount(['error', 'engineio', 'firewall'], function (body) {
            assert.equal(body.error, 'congratulations');
            assert.deepEqual(body.msg, { to: ['dalek' ]});
            assert.equal(body.socket, socket.serverSide);
            assert(_.isArray(body.client));
            done();
        });
        d.mount(['dalek'], function (msg) {
            done('should not have sent');
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                return new Promise(function (resolve, reject) {
                    return reject('congratulations');
                });
            }});
    });

    it('should allow firewall to modify message bodies', function (done) {
        d.mount(['dalek'], function (body, msg) {
            assert.deepEqual({ five: 'alive' }, msg.body);
            done();
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , body: { yo: 'hi' }
                , options: { mountain: 'side' }
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                msg.body = { five: 'alive' };
            }});
    });

    it('should allow firewall to modify message options', function (done) {
        d.mount(['dalek'], function (body, msg) {
            assert.deepEqual({ business: 'side' }, msg.options);
            done();
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , body: { yo: 'hi' }
                , options: { mountain: 'side' }
            }));
        });
        d.engineio(socket.serverSide, {
            firewall: function (msg) {
                msg.options = { business: 'side' };
            }});
    });


    it('should block wildcards by default (undefined options)', function (done) {
        d.mount(['error'], function () {});
        d.mount(['**'], function (msg, ctxt) {
            if (ctxt.to[0] !== 'disconnect' 
                && ctxt.to[0] !== 'connect') {
                console.error('sent ', ctxt);
                done('should not have sent');
            }
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['*']
            });
            socket.sideB.emit('dual', {
                to: ['**']
            });
            socket.sideB.emit('dual', {
                to: ['dalek', '*']
            });
            socket.sideB.emit('dual', {
                to: ['dalek', '**']
            });
        });
        d.engineio(socket.sideA);
        done();
    });

    it('should block wildcards by default (unused option)', function (done) {
        d.mount(['error'], function () {});
        d.mount(['**'], function (msg, ctxt) {
            if (ctxt.to[0] !== 'disconnect'
               && ctxt.to[0] !== 'connect') {
                console.error('sent ', ctxt);
                done('should not have sent');
            }
        });
        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['*']
            });
            socket.sideB.emit('dual', {
                to: ['**']
            });
            socket.sideB.emit('dual', {
                to: ['dalek', '*']
            });
            socket.sideB.emit('dual', {
                to: ['dalek', '**']
            });
        });
        d.engineio(socket.sideA, {});
        done();
    });

});
