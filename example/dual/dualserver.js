/*jslint node: true */
/* global -Promise */
"use strict";

var dualapi = require('dualapi')
.use(require('../../index'));

module.exports = function () {

    var dual = dualapi();

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
