# dual-engine.io example server

## Running

From the example directory, 
```shell
  npm install
  npm start
```

This will initiate an example server running at `localhost:3000`.

## Code

The bulk of the example code is scaffolding to set up an HTTP and web
socket server.  Once these are running, the dualapi server is attached
in
[`./app/dual.js`](https://github.com/plediii/dual-engine.io/blob/master/example/app/dual.js),
and the server side logic is in
[`./dual/dualserver`](https://github.com/plediii/dual-engine.io/blob/master/example/dual/dualserver.js).
The client side logic is implemented in
[`./client/app.js`](https://github.com/plediii/dual-engine.io/blob/master/example/client/app.js).