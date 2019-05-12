const rp = require('request-promise');
const fs = require('fs');
const os = require('os');

const spawn = require('child_process').spawn;
const execFile = require('child_process').execFile;

const networkInterfaces = os.networkInterfaces();

const { app, BrowserWindow, ipcMain } = require('electron')

let win;
let authData;

try {
  authData = fs.readFileSync("auth.json", "utf8");
} catch (e) {
  authData = null;
}

ipcMain.on('login', async (event, arg) => {
  let body = await rp({
    method: 'POST',
    uri: 'https://remotedesktopweb.herokuapp.com/login',
    formData: arg
  });

  body = JSON.parse(body);
  body.ip = networkInterfaces.Ethernet[1].address;

  fs.writeFileSync("auth.json", JSON.stringify(arg));

  if (!body) {
    event.reply('authentication-reply', { isAuthenticated: false, user: {}, code: null });
    return;
  }

  rp({
    method: 'POST',
    uri: 'https://remotedesktopweb.herokuapp.com/activate',
    formData: body
  })
  .then(accessKey => {
    event.reply('authentication-reply', { isAuthenticated: true, user: body, code: JSON.parse(accessKey).accessKey });
  })
  .catch(err => {
      event.reply('error-reply', 'Can`t get access key');
  });
})

ipcMain.on('sign-up', (event, arg) => {
  rp({
    method: 'POST',
    uri: 'https://remotedesktopweb.herokuapp.com/sign-up',
    formData: arg,
    headers: {
      // 'Content-type': 'application/json'
    }
  })
    .then(body => {
        event.reply('sign-up-reply', 'sign up')
    })
    .catch(err => {
        event.reply('error-reply', 'error');
    });
})

ipcMain.on('authentication', async (event, arg) => {
  if (!authData) {
    return;
  }

  let body = await rp({
    method: 'POST',
    uri: 'https://remotedesktopweb.herokuapp.com/login',
    formData: JSON.parse(authData)
  });

  body = JSON.parse(body);
  body.ip = networkInterfaces.Ethernet[1].address;

  if (!body) {
    event.reply('authentication-reply', { isAuthenticated: false, user: {}, code: null });
    return;
  }

  rp({
    method: 'POST',
    uri: 'https://remotedesktopweb.herokuapp.com/activate',
    formData: body
  })
  .then(accessKey => {
    event.reply('authentication-reply', { isAuthenticated: true, user: body, code: JSON.parse(accessKey).accessKey });
  })
  .catch(err => {
      event.reply('error-reply', 'Can`t get access key');
  });
});

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function createWindow () {
  win = new BrowserWindow({
    width: 300,
    height: 500,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('screens/index.html')

  win.on('closed', () => {
    win = null
  })
}

const child = execFile('node', ['listenMouse.js'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

const { NodeMediaServer } = require('node-media-server');

// const config = {
//   logType: 3,
//
//   rtmp: {
//     port: 1935,
//     chunk_size: 60000,
//     gop_cache: true,
//     ping: 60,
//     ping_timeout: 30
//   },
//   http: {
//     port: 8000,
//     allow_origin: '*'
//   }
// };
//
// const nms = new NodeMediaServer(config)
//
// nms.run();
//
// const command = execFile(__dirname + '/ffmpeg/bin/ffmpeg.exe', [
//   '-f', 'gdigrab',
//   '-i', 'desktop',
//   // '-f', 'dshow',
//   // '-i', 'video=\"screen-capture-recorder\"',
//   '-preset', 'ultrafast',
//   '-vcodec', 'libx264',
//   '-tune', 'zerolatency',
//   '-b', '900k',
//   '-c:a', 'aac',
//   '-ar', '44100',
//   '-f', 'flv',
//   'rtmp://localhost/live/STREAM_NAME'
// ]);
//
// command.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });
//
// command.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`);
// });
//
// command.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });
