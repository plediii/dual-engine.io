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
            d.send(['connect'].concat(clientRoute))
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
            socket.on('disconnect', function () {

            });
        });
    };
};
