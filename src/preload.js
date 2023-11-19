const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcApi', {
	login: (username,password,version) => {ipcRenderer.invoke('login',[username,password,version])},
	chat: (username,message) => {ipcRenderer.invoke('chat',[username,message])},
	versions: () => ipcRenderer.invoke('versions'),
	logout: () => ipcRenderer.invoke('logout'),
	reauth: () => ipcRenderer.invoke('reauth'),
	browser: (url) => {
		require('electron').shell.openExternal(url);
	},

	handlePlayers: (callback) => {
		ipcRenderer.removeAllListeners('players');
		return ipcRenderer.on('players', callback)
	},
	handleLog: (callback) => {
		ipcRenderer.removeAllListeners('log');
		return ipcRenderer.on('log', callback)
	},
	handleLink: (callback) => {
		ipcRenderer.removeAllListeners('link');
		return ipcRenderer.on('link', callback)
	},
	argv: window.process.argv
})

