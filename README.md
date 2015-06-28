# dual-engine.io [![Build Status](http://jenkins.plediii.net:8080/buildStatus/icon?job=dual-engine.io master)](http://jenkins.plediii.net:8080/job/dual-engine.io%20master/)

Allows a [`dualapi`](https://github.com/plediii/dualapi) domain
mounted on a server side to communicate with a `dualapi` domain
mounted in a browser via engine.io.

A simple demonstration is in
[`./example`](https://github.com/plediii/dual-engine.io/tree/master/example).  

The client side transport is provided in
[`dual-engine.io-client`](https://github.com/plediii/dual-engine.io-client).

In general, the server side `dualapi` domain is connected by providing
a connected engine.io socket:
```javascript
var dualapi = require('dualapi')
  .use(require('dual-engine.io'));

var domain = dualapi();
domain.mount(['connect', '::client'], function (body, ctxt) {
  // a client connected! say hello!
  ctxt.send({
   to: ctxt.params.client.concat('hello'), 
   body: 'Helloooo!'
  });
});

var io = require('engine.io').listen(3000);
io.on('connection', function (socket) {
   return domain.engineio(socket);
});
````