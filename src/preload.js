const { contextBridge, ipcRenderer } = require("electron");

globalThis.isElectron = true;

contextBridge.exposeInMainWorld("ipcApi", {
	login: (username, password, version) => {
		ipcRenderer.invoke("login", [username, password, version]);
	},
	look: (yaw, pitch) => {
		ipcRenderer.invoke("look", [yaw, pitch]);
	},
	go: (x, y, z) => {
		ipcRenderer.invoke("go", [x, y, z]);
	},
	stop: () => {
		ipcRenderer.invoke("stop");
	},
	drop: () => {
		ipcRenderer.invoke("drop");
	},
	chat: (username, message) => {
		ipcRenderer.invoke("chat", [username, message]);
	},
	tab: (message) => ipcRenderer.invoke("tab", message),
	ctrl: (ctrl) => ipcRenderer.invoke("ctrl", ctrl),
	ctrlup: (ctrl) => ipcRenderer.invoke("ctrlup", ctrl),
	ctrldown: (ctrl) => ipcRenderer.invoke("ctrldown", ctrl),
	state: (name, value) => {
		ipcRenderer.invoke("state", [name, value]);
	},
	versions: () => ipcRenderer.invoke("versions"),
	logout: () => ipcRenderer.invoke("logout"),
	reauth: () => ipcRenderer.invoke("reauth"),
	browser: (url) => {
		require("electron").shell.openExternal(url);
	},

	handlePlayers: (callback) => {
		ipcRenderer.removeAllListeners("players");
		return ipcRenderer.on("players", callback);
	},
	handleLog: (callback) => {
		ipcRenderer.removeAllListeners("log");
		return ipcRenderer.on("log", callback);
	},
	handleLink: (callback) => {
		ipcRenderer.removeAllListeners("link");
		return ipcRenderer.on("link", callback);
	},
	handlePosition: (callback) => {
		ipcRenderer.removeAllListeners("position");
		return ipcRenderer.on("position", callback);
	},
	handleHealth: (callback) => {
		ipcRenderer.removeAllListeners("health");
		return ipcRenderer.on("health", callback);
	},
	argv: window.process.argv,
});
