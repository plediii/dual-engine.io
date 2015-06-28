
module.exports = function (app) {
    var dualserver = require('../dual/dualserver');
    var dual = dualserver(app);
    app.set('dual', dual);

    var io = require('engine.io')();
    app.set('io', io);

    io.on('connection', function (socket) {
        return dual.engineio(socket);
    });

    return app;
};
