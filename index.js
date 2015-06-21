/*jslint node: true */
"use strict";

var uid = require('uid-safe');

module.exports = function (domain, indexroute, defaultFirewall) {

    domain.connect = function (socket, firewall) {
        firewall = firewall || defaultFirewall;
        uid(24)
            .then(function (clientid) {
                var clientRoute = ['client', clientid];
                socket.on('disconnect', function () {
                    domain.send(['disconnect'].concat(clientRoute));
                });
                domain.open(clientRoute, socket, firewall);
                domain.send(['connect'].concat(clientRoute), []);
                domain.send(clientRoute.concat('index'), indexroute);
            });
    };

    domain.redirectClient = function (socket, where) {
        socket.emit('dual', {
            to: ['redirect']
            , body: where
        });
        socket.disconnect();
    };

    return domain;
};
