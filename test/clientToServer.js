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
        d.mount(['dalek'], function () {
            done();
        });

        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
            }));
        });
        d.engineio(socket.serverSide);
    });

    it('should include "from" as tail in messages to hosts', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            assert.equal('merci', _.last(ctxt.from));
            done();
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , from: ['merci']
            }));
        });
        d.engineio(socket.serverSide);
    });

    it('should include "body" in messages to hosts', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            assert.deepEqual({ hello: 'hi' }, ctxt.body)
            done();
        });

        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , body: { hello: 'hi' }
            }));
        });
        d.engineio(socket.serverSide);
    });

    it('should include "option" in messages to hosts', function (done) {
        d.mount(['dalek'], function (body, ctxt) {
            assert.deepEqual({ allo: 'salaam' }, ctxt.options)
            done();
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send(JSON.stringify({
                to: ['dalek']
                , options: { allo: 'salaam' }
            }));
        });
        d.engineio(socket.serverSide);
    });

    it('should not crash on improper message format', function (done) {
        socket.clientSide.on('message', function () {
            socket.clientSide.send('im not json');
            done();
        });
        d.engineio(socket.serverSide);
    }); 
    
    it('should send an error event on improper message format', function (done) {
       d.mount(['error', 'engineio', 'format'], function (body) {
            assert.equal(body.socket, socket.serverSide);
            done();
        });
        socket.clientSide.on('message', function () {
            socket.clientSide.send('im not json');
        });
        d.engineio(socket.serverSide);
    });

    it('should disconnect on improper message format', function (done) {
        d.mount(['disconnect', '**'], function (body, ctxt) {
            done();
        });
         socket.clientSide.on('message', function () {
             socket.clientSide.send('im not json');
         });
         d.engineio(socket.serverSide);
     });    
});
