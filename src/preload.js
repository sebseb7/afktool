const { contextBridge, ipcRenderer } = require("electron");

globalThis.isElectron = true;

contextBridge.exposeInMainWorld("ipcApi", {
	login: (username, password, version, profile) => {
		ipcRenderer.invoke("login", [username, password, version, profile]);
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
	setSlot: (message) => ipcRenderer.invoke("setSlot", message),
	tab: (message) => ipcRenderer.invoke("tab", message),
	ctrl: (ctrl) => ipcRenderer.invoke("ctrl", ctrl),
	ctrlup: (ctrl) => ipcRenderer.invoke("ctrlup", ctrl),
	ctrldown: (ctrl) => ipcRenderer.invoke("ctrldown", ctrl),
	state: (name, value) => {
		ipcRenderer.invoke("state", [name, value]);
	},
	versions: () => ipcRenderer.invoke("versions"),
	profiles: () => ipcRenderer.invoke("profiles"),
	logout: () => ipcRenderer.invoke("logout"),
	reauth: (profile) => ipcRenderer.invoke("reauth", profile),
	browser: (url) => {
		require("electron").shell.openExternal(url);
	},

	handlePlayers: (callback) => {
		ipcRenderer.removeAllListeners("players");
		return ipcRenderer.on("players", callback);
	},
	handleSlot: (callback) => {
		ipcRenderer.removeAllListeners("slot");
		return ipcRenderer.on("slot", callback);
	},
	handleSlotActive: (callback) => {
		ipcRenderer.removeAllListeners("slotActive");
		return ipcRenderer.on("slotActive", callback);
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
	handleName: (callback) => {
		ipcRenderer.removeAllListeners("name");
		return ipcRenderer.on("name", callback);
	},
	handleHealth: (callback) => {
		ipcRenderer.removeAllListeners("health");
		return ipcRenderer.on("health", callback);
	},
	handleEntities: (callback) => {
		ipcRenderer.removeAllListeners("entities");
		return ipcRenderer.on("entities", callback);
	},
	argv: window.process.argv,
});
