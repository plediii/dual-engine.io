/*jslint node: true */
"use strict";

var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');
var dualproto = require('dual-protocol');

var io = require('./mock-io');

describe('client address', function () {

    var d, socket;
    beforeEach(function () {
        d = dualproto.use(require('../index'))();
        socket = io.socket();
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

    it('should give each distinct client a distinct "from" address ', function (done) {
        var count = 0;
        var from;
        d.mount(['dalek'], function (body, ctxt) {
            count++;
            if (count === 1) {
                from = ctxt.from;
            } else if (count === 2) {
                assert.notDeepEqual(from, ctxt.from);
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

});
