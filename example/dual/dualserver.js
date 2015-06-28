/*jslint node: true */
/* global -Promise */
"use strict";

var dualapi = require('dualapi')
.use(require('../../index'));
var engineio = require('engine.io');

module.exports = function (app) {

    var dual = dualapi();
    app.set('io', engineio);
    app.set('dual', dual);

    var addend = 0;
    dual.mount({
        '**': function (body, ctxt) {
            console.log(ctxt.from.join('/'), '->', ctxt.to.join('/'), ':', body);
        }
        , add: function () {
            addend++;
            dual.send({
                to: ['engineio', '*', 'addend']
                , body: addend
            });
        }
        , addend: function (body, ctxt) {
            ctxt.return(addend);
        }
        , error: function (ctxt) {
            console.error(ctxt.body);
            if (ctxt.body.message.stack) {
                console.error(ctxt.body.message.stack);
            }
        }
    });
    return dual;
};
