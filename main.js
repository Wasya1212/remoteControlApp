const rp = require('request-promise');
const fs = require('fs');
const os = require('os');

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
    uri: 'http://localhost:5000/login',
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
    uri: 'http://localhost:5000/activate',
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
    uri: 'http://localhost:5000/sign-up',
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
    uri: 'http://localhost:5000/login',
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
    uri: 'http://localhost:5000/activate',
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
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('screens/index.html')

  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
}
