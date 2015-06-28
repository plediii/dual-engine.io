/*jslint node: true */
"use strict";

var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');
var dualproto = require('dual-protocol');

var io = require('./mock-io');

describe('redirect', function () {

    var d, socket;
    beforeEach(function () {
        d = dualproto.use(require('../index'))();
        socket = io.socket();
    });
    
    it('should be provided on engineio', function () {
        assert(_.isFunction(d.engineio.redirect));
    });

    it('should respond with redirect event when connected with redirect client', function (done) {
        socket.clientSide.on('message', function (raw) {
            var msg = JSON.parse(raw);
            assert.deepEqual(msg.to, ['redirect']);
            assert.equal(msg.body, '/yo');
            done();
        });
        d.engineio.redirect(socket.serverSide, '/yo');
    });

    it('should disconnect client after redirect', function (done) {
        socket.clientSide.on('close', function () {
            done();
        });
        d.engineio.redirect(socket.serverSide, '/yo');
    });

});
