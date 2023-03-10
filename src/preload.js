const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcApi', {
	login: (username,password) => {ipcRenderer.invoke('login',[username,password])},
	logout: () => ipcRenderer.invoke('logout'),
	reauth: () => ipcRenderer.invoke('reauth'),
	browser: (url) => {
		require('electron').shell.openExternal(url);
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

