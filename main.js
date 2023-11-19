const path = require('path');
const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');
const Store = require('electron-store');
const isDev = require('electron-is-dev');
const {app, BrowserWindow, ipcMain} = require('electron')
const { v4: uuidv4 } = require('uuid');
const {loader} = require("@nxg-org/mineflayer-smooth-look");
const mc = require('minecraft-protocol');
const store = new Store();


var counter = 1;
var bot;

function createWindow() {
  let host = store.get('host');
  let port = store.get('port');
  if(!port) port = '';
  if(!host) host = '';

  const win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1000,
    height: 600,
	minWidth:500,
	minHeight:500,
    webPreferences: {
      nodeIntegration: true,
	  preload: path.join(__dirname, 'src','preload.js'),
	  additionalArguments: ['minecrafthost='+host,'minecraftport='+port]
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'build','index.html')}`
  );

  ipcMain.on('test', (event, arg) => {
  	console.log(event,arg);
  })

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
  
  ipcMain.handle('versions', (event, msg) => {
    console.log('versions');
    return mc.supportedVersions;
  })

  ipcMain.handle('login', (event,msg) => {
	let uuid = store.get('uuid');

	if(! uuid){
		uuid = uuidv4();
		store.set('uuid',uuid);
	}
	store.set('host', msg[0]);
	store.set('port', msg[1]);

    bot = mineflayer.createBot({
      host: msg[0], // minecraft server ip
      username: uuid, // minecraft username
      port: msg[1],                // only set if you need a port that isn't 25565
      version: msg[2],
      auth: 'microsoft' ,             // only set if you need microsoft auth, then set this to 'microsoft'
	  onMsaCode: (msg) => {
	  	win.webContents.send('log','use this auth code: '+msg.user_code);
	  	win.webContents.send('link',msg.verification_uri);
	  },
    });
	bot.on('spawn', () =>{
  	  win.webContents.send('log', 'logged in');
	})
	bot.on('kicked', (msg) =>{
  	  win.webContents.send('log', 'kicked: '+msg);
	})
	bot.on('error', (msg) =>{
  	  win.webContents.send('log', 'error: '+msg);
	})
	bot.on('end', (msg) =>{
  	  win.webContents.send('log', 'end: '+msg);
	})
    bot.on('message', (message) => {
  	  win.webContents.send('log', 'msg: '+message);
    })
    bot.on('chat', (username, message) => {
      if (username === bot.username) return
  	  win.webContents.send('log', '['+username+'] '+message);
    })
    bot.on('whisper', (username, message) => {
      if (username === bot.username) return
  	  win.webContents.send('log', '['+username+'] [whispers] '+message);
    })
  });
  ipcMain.handle('logout', () => {
  	bot.quit();
  });
  ipcMain.handle('reauth', () => {
	let uuid = uuidv4();
	store.set('uuid',uuid);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
