const robot = require("robotjs");
const vol = require('vol');
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed.
  }
});

robot.setMouseDelay(10);

// setInterval(() => { process.stdout.write('\033c'); }, 300);

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      // console.log(message)
        const { type: messageType, payload} = JSON.parse(message);

        // console.log("type", messageType);

        if (messageType == 'control' && payload.controller == 'volume') {
          switch (payload.action) {
            case 'get-volume-level': {
              vol
                .get()
                .then(level => {
                  console.log("sending volume level...")
                  const json = JSON.stringify({
                    type: 'volume',
                    volumeLevel: level
                  });
                  ws.send(json);
                });
            } break;
            case 'set-volume-level': {
              vol.set(payload.volumeLevel);
            } break;
            default: {
              console.log('strange volume action...')
            } break;
          }
        }

        if (messageType == 'control' && payload.controller == 'keyboard') {
          try {
            robot.keyTap(payload.key);
          } catch (e) {
            console.error(e);
          }
        }

        if (messageType == 'control' && payload.controller == 'mouse') {
          const mouse = robot.getMousePos()

          let x = mouse.x
          let y = mouse.y

          if (payload.action) {
            switch (payload.action) {
              case 'left-click': {
                robot.mouseClick('left');
              } break;
              case 'right-click': {
                robot.mouseClick('right');
              } break;
              case 'middle-click': {
                robot.mouseClick('middle');
              } break;
              case 'top-scroll': {
                robot.scrollMouse(0, 50);
              } break;
              case 'bottom-scroll': {
                robot.scrollMouse(0, -50);
              } break;
              default: {
                console.log('strange mouse action...')
              } break;
            }
          }

          if (payload.direction) {
            switch (payload.direction) {
              case 'top-left': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x -= 4, y -= 4)
                }
              } break;
              case 'top-right': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x += 4, y -= 4)
                }
              } break;
              case 'bottom-left': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x -= 4, y += 4)
                }
              } break;
              case 'bottom-right': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x += 4, y += 4)
                }
              } break;
              case 'left': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x -= 4, y)
                }
              } break;
              case 'right': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x += 4, y)
                }
              } break;
              case 'top': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x, y -= 4)
                }
              } break;
              case 'bottom': {
                for (let i = 0; i < 10; i++) {
                  robot.moveMouse(x, y += 4)
                }
              } break;
              default: {
                console.log('strange mouse direction...')
              } break;
            }
          }
        }

        // console.log('received: %s', message);
        // ws.send('reply from server : ' + message);
    });

    // ws.send('something');
});

console.log("start websockets...");
