const {NodeMediaServer} = require('node-media-server');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const robot = require("robotjs");

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// console.log(__dirname + '/ffmpeg/bin/ffmpeg.exe')

const config = {
  logType: 3,

  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config)

nms.run();

const spawn = require('child_process').spawn;
const execFile = require('child_process').execFile;

// setTimeout(() => {
//   const command = execFile(__dirname + '/ffmpeg/bin/ffmpeg.exe', [
//     '-f', 'gdigrab',
//     '-i', 'desktop',
//     // '-f', 'dshow',
//     // '-i', 'video=\"screen-capture-recorder\"',
//     '-preset', 'ultrafast',
//     '-vcodec', 'libx264',
//     '-tune', 'zerolatency',
//     '-b', '900k',
//     '-c:a', 'aac',
//     '-ar', '44100',
//     '-f', 'flv',
//     'rtmp://localhost/live/STREAM_NAME'
//   ]);
//
//   command.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });
//
//   command.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
//   });
//
//   command.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// }, 3000)


// const command = ffmpeg('desktop')
//   .videoCodec('libx264')
//   .size('1920x1080')
//   .flvmeta()
//   .format('flv')
//   .inputFPS(25)
//   .videoBitrate('900k')
//   // .audioCodec('libmp3lame')
//   // .audioBitrate('128k')
//   // .addInputOption('-f gdigrab')
//   .addInputOption('-f dshow')
//   .addInputOption('-i video="screen-capture-recorder"')
//   // .addInputOption('-preset ultrafast')
//   // .addInputOption('-tune zerolatency')
//   .addInputOption('-c:a aac')
//   .addInputOption('-ar 44100')
//   .addInputOption('rtmp://localhost/live/STREAM_NAME')
//   // .save(path.resolve(__dirname, 'outputs.flv'))
//   .on('codecData', function(data) {
//     console.log('Input is ' + data.audio + ' audio ' +
//       'with ' + data.video + ' video');
//   })
//   .on('progress', function(progress) {
//     console.log('Processing: ' + progress.percent + '% done');
//   })
//   .on('stderr', function(stderrLine) {
//     console.log('Stderr output: ' + stderrLine);
//   })
//   .on('error', function(err, stdout, stderr) {
//     console.log('Cannot process video: ' + err.message);
//   })
//   .on('end', function(stdout, stderr) {
//     console.log('Succeeded !');
//   });
//
//   command.setFfmpegPath(__dirname + '/ffmpeg/bin/ffmpeg.exe');
//   command.setFfprobePath(__dirname + '/ffmpeg/bin/ffprobe.exe');

//
// const ffstream = command.pipe();
// ffstream.on('data', function(chunk) {
//   console.log('ffmpeg just wrote ' + chunk.length + ' bytes');
// });

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/socket.html');
// });

// io.on('connection', function(socket){
//   console.log('an user connected');
//
//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//   });
//
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });
//
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

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log(message)
        const { type: messageType, payload} = JSON.parse(message);

        console.log("type", messageType);

        if (messageType == 'control' && payload.controller == 'mouse') {
          const mouse = robot.getMousePos()

          let x = mouse.x
          let y = mouse.y

          switch (payload.direction) {
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
              console.log('strage mouse direction...')
            }
          }
        }

        console.log('received: %s', message);
        ws.send('reply from server : ' + message);
    });

    ws.send('something');
});

// set python
// npm config set python Z:\С\Users\ukran\Desktop\imitation-rest\Python-2.7.15\python.exe

// command
// ffmpeg -f dshow -i video="screen-capture-recorder" -preset ultrafast -vcodec libx264 -tune zerolatency -b 900k -c:a aac -ar 44100 -f flv rtmp://localhost/live/STREAM_NAME
