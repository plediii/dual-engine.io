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

    it('should allow server to send to clients', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            ctxt.send(ctxt.from);
        });

        socket.sideB.on('dual', function () {
            socket.sideB.emit('dual', {
                to: ['dalek']
            });
        });
        socket.sideA.on('dual', function (msg) {
            // ?
        });
        d.engineio(socket.sideA);
        done('incomplete test');
    });

});
