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
        socket.clientSide.on('message', function (raw) {
            var msg = JSON.parse(raw);
            assert.deepEqual(msg.to, ['index']);
            done();
        });
        d.engineio(socket.serverSide);
    });


    it('should send indexRoute', function (done) {
        socket.clientSide.on('message', function (raw) {
            var msg = JSON.parse(raw);
            assert.deepEqual(msg.from, ['robinhood']);
            done();
        });
        d.engineio(socket.serverSide, {
            indexRoute: ['robinhood']
        });
    });

    it('should send connect event', function (done) {
        d.mount(['connect', '**'], function () {
            done();
        });
        d.engineio(socket.serverSide);
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
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['vp']
                , from: []
            }));
        });
        d.engineio(socket.serverSide);
    });

    it('should mount client address listener before sending connect event', function (done) {
        var clientAddr = false;
        d.mount(['vp'], function (body, ctxt) {
            assert(clientAddr.length > 0);
            assert.deepEqual(clientAddr, ctxt.from);
            assert.equal(1, d.listeners(clientAddr.concat('**')).length);
            done();
        });
        d.mount(['connect', '::clientAddr'], function (body, ctxt) {
            clientAddr = ctxt.params.clientAddr;
            assert.equal(1, d.listeners(clientAddr.concat('**')).length);
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['vp']
                , from: []
            }));
        });
        d.engineio(socket.serverSide);
    });

});
