var logger = require('morgan');

module.exports = function (app) {
    app.use(logger('dev'));

    return app;
};
