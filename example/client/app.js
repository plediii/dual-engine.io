
var eio = require('engine.io-client');
var dualapi = require('dualapi').use(require('dual-engine.io-client'));

var addBtn = document.getElementById('add');
var statusText = document.getElementById('status');
var addend = document.getElementById('addend');

var d = dualapi()
    .mount({
        '**': function (body, ctxt) {
            console.log(ctxt.from.join('/'), '->', ctxt.to.join('/'), ':', body);
        }
        , addend: function (body) {
            addend.innerText = '' + body;
        }
        , connect: {
            server: function () {
                addBtn.disabled = false;
                statusText.innerText = 'connected';
                d.request(['server', 'addend'])
                    .spread(function (body, options) {
                        if (options.statusCode === 200) {
                            addend.innerText = '' + body;
                        } else {
                            console.error('' + options.statusCode + ' Server did not return addend');
                        }
                    });
            }
        }
        , disconnect: {
            server: function () {
                statusText.innerText = 'not connected';
                addBtn.disabled = true;
            }
        }
    });

d.engineio(eio, ['server']);

addBtn.onclick = function () {
    d.send(['server', 'add']);
};





