const { contextBridge, ipcRenderer } = require('electron');

globalThis.isElectron = true;

contextBridge.exposeInMainWorld('ipcApi', {
	login: (username,password,version) => {ipcRenderer.invoke('login',[username,password,version])},
	chat: (username,message) => {ipcRenderer.invoke('chat',[username,message])},
	tab: (message) => ipcRenderer.invoke('tab',message),
	state: (name,value) => {ipcRenderer.invoke('state',[name,value])},
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
	handlePosition: (callback) => {
		ipcRenderer.removeAllListeners('position');
		return ipcRenderer.on('position', callback)
	},
	handleHealth: (callback) => {
		ipcRenderer.removeAllListeners('health');
		return ipcRenderer.on('health', callback)
	},
	argv: window.process.argv
})

