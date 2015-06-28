var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');

module.exports = function (app) {
    app.use(logger('dev'));
    // app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(cookieParser('iSCXURPMZUH2kyCPbeMQdS2Z76EmvOZM'));

    return app;
};
