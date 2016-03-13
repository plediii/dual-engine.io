/*jslint node: true */
"use strict";

module.exports = function (Domain) {
    Domain.prototype.engineio = function (socket, options) {
        var d = this;
        options = options || {};
        options.firewall = options.firewall || function (msg, socket) {
            // block wildcards by default
            for (var idx in msg.to) {
                var point = msg.to[idx];
                if (point[0] == '*') {
                    socket.close();
                    throw new Error('Wild card detected.');
                }
            };
        };
        var indexRoute = options.indexRoute || ['index'];
        d.uid()
        .then(function (clientid) {
            var clientRoute = ['engineio', clientid];
            socket.on('close', function () {
                d.unmount(clientRoute);
                d.send(['disconnect'].concat(clientRoute));
            });
            d.mount(clientRoute.concat('::clientHost'), function (body, ctxt) {
                socket.send(JSON.stringify({
                    to: ctxt.params.clientHost
                    , from: ctxt.from
                    , body: ctxt.body
                    , options: ctxt.options
                }));
            });
            d.send(['connect'].concat(clientRoute));
            var dsend = function (msg) {
                d.send({
                    to: msg.to
                    , from: clientRoute.concat(msg.from || [])
                    , body: msg.body
                    , options: msg.options
                });
            }
            var send;
            if (options.hasOwnProperty('firewall')) {
                // if a firewall is provided, use it to filter messages
                var firewallError = function (err, msg) {
                    return d.send({
                        to: ['error', 'engineio', 'firewall']
                        , body: {
                            error: err
                            , msg: msg
                            , socket: socket
                            , client: clientRoute
                        }
                    });
                };
                send = function (raw) {
                    var msg = JSON.parse(raw);
                    var async;
                    try {
                        async = options.firewall(msg, socket);
                    } catch (err) {
                        return firewallError(err, msg);
                    }
                    if (async && async.then) {
                        async.then(function () {
                            return dsend(msg);
                        })
                            .catch(function (err) {
                                if (async.isRejected()) {
                                    return firewallError(err, msg);
                                } else {
                                    throw err;
                                }
                            });
                    } else {
                        dsend(msg);
                    }

                };
            } else {
                send = function (raw) {
                    dsend(JSON.parse(raw));
                };
            }
            socket.on('message', send);
            socket.send(JSON.stringify({
                to: ['index']
                , from: indexRoute
            }));
        });
    };

    Domain.prototype.engineio.redirect = function (socket, body) {
        socket.on('drain', function () {
            socket.close();
        });
        socket.send(JSON.stringify({
            to: ['redirect']
            , body: body
        }));
    };
};
