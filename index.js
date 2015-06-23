/*jslint node: true */
"use strict";

module.exports = function (Domain) {
    Domain.prototype.engineio = function (socket, options) {
        var d = this;
        options = options || {};
        var indexRoute = options.indexRoute || ['index'];
        d.uid()
        .then(function (clientid) {
            var clientRoute = ['engineio', clientid];
            socket.on('disconnect', function () {
                d.send(['disconnect'].concat(clientRoute));
            });
            d.send(['connect'].concat(clientRoute));
            d.mount(clientRoute.concat('::clientHost'), function (body, ctxt) {
                socket.emit('dual', {
                    to: ctxt.params.clientHost
                    , from: ctxt.from
                    , body: ctxt.body
                    , options: ctxt.options
                });
            });
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
                send = function (msg) {
                    var async = options.firewall(msg);
                    if (async && async.then) {
                        async.then(function () {
                            dsend(msg)
                        });
                    } else {
                        dsend(msg);
                    }
                };
            } else {
                send = dsend;
            }
            socket.on('dual', send);
            socket.emit('dual', {
                to: ['index']
                , from: indexRoute
            });
        });
    };

    Domain.prototype.engineio.redirect = function (socket, body) {
        socket.emit('dual', {
            to: ['redirect']
            , body: body
        });
        process.nextTick(function () {
            socket.disconnect();
        });
    };
};
