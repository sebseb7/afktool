const path = require("path");
const mineflayer = require("mineflayer");
const { Vec3 } = require("vec3");
const Store = require("electron-store");
const isDev = require("electron-is-dev");
const { app, BrowserWindow, ipcMain } = require("electron");
const { v4: uuidv4 } = require("uuid");
const { loader } = require("@nxg-org/mineflayer-smooth-look");
const mc = require("minecraft-protocol");
const store = new Store();
const autoeat = require("mineflayer-auto-eat").plugin;
const {
	pathfinder,
	Movements,
	goals: { GoalBlock, GoalXZ },
} = require("mineflayer-pathfinder");

var counter = 1;
var bot;

var settings = { damage_logout: false, hold_use: false, hold_use_inhibit: false, auto_eat: false, attack: false, ticks: 30 };

var tick = 0;

function createWindow() {
	let host = store.get("host");
	let port = store.get("port");
	if (!port) port = "";
	if (!host) host = "";

	const win = new BrowserWindow({
		autoHideMenuBar: true,
		width: 1200,
		height: 800,
		minWidth: 500,
		minHeight: 500,
		backgroundColor: "#121212",
		show: false,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "src", "preload.js"),
			additionalArguments: ["minecrafthost=" + host, "minecraftport=" + port],
		},
	});
	win.once("ready-to-show", () => {
		win.show();
	});

	win.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "build", "index.html")}`);

	ipcMain.on("test", (event, arg) => {
		console.log(event, arg);
	});

	if (isDev) {
		win.webContents.openDevTools({ mode: "detach" });
	}

	ipcMain.handle("versions", (event, msg) => {
		return mc.supportedVersions;
	});

	let timer1;

	ipcMain.handle("login", (event, msg) => {
		let uuid = store.get("uuid");

		if (!uuid) {
			uuid = uuidv4();
			store.set("uuid", uuid);
		}
		store.set("host", msg[0]);
		store.set("port", msg[1]);

		bot = mineflayer.createBot({
			host: msg[0], // minecraft server ip
			username: uuid, // minecraft username
			port: msg[1], // only set if you need a port that isn't 25565
			version: msg[2],
			auth: "microsoft", // only set if you need microsoft auth, then set this to 'microsoft'
			onMsaCode: (msg) => {
				win.webContents.send("log", "use this auth code: " + msg.user_code);
				win.webContents.send("link", msg.verification_uri);
			},
		});
		bot.loadPlugin(loader);
		bot.loadPlugin(autoeat);
		bot.loadPlugin(pathfinder);
		bot.on("spawn", async () => {
			win.webContents.send("log", "logged in");
			win.webContents.send("players", Object.keys(bot.players));
			win.webContents.send("health", bot.health, bot.food);
			win.webContents.send("position", bot.entity.position, bot.entity.yaw, bot.entity.pitch);
			if (settings.auto_eat) {
				bot.autoEat.enable();
				bot.autoEat.options.startAt = 18;
			} else {
				bot.autoEat.disable();
			}
			if (settings.auto_eat && bot.health < 16 && bot.food < 20) {
				bot.autoEat
					.eat(true)
					.then(() => {})
					.catch((e) => {});
			}
			if (timer1) clearInterval(timer1);
			timer1 = setInterval(() => {}, 50);
		});
		bot.on("autoeat_error", () => {});
		bot.on("kicked", (msg) => {
			if (timer1) clearInterval(timer1);
			win.webContents.send("log", "kicked: " + msg);
		});
		bot.on("error", (msg) => {
			if (timer1) clearInterval(timer1);
			win.webContents.send("log", "error: " + msg);
		});
		bot.on("end", (msg) => {
			if (timer1) clearInterval(timer1);
			win.webContents.send("log", "end: " + msg);
		});
		bot.on("message", (message, pos, sender) => {
			win.webContents.send("log", message.toHTML());
		});
		bot.on("chat", (username, message, translate, jsonMsg) => {
			if (username === bot.username) return;
		});
		bot.on("whisper", (username, message) => {
			if (username === bot.username) return;
		});
		bot.on("death", () => {
			if (settings.damage_logout) {
				win.webContents.send("log", "death logout");
				bot.quit();
			}
		});
		bot.on("move", () => {
			win.webContents.send("position", bot.entity.position, bot.entity.yaw, bot.entity.pitch);
		});
		bot.on("forcedMove", () => {
			win.webContents.send("position", bot.entity.position, bot.entity.yaw, bot.entity.pitch);
		});
		bot.on("health", () => {
			win.webContents.send("health", bot.health, bot.food);
			if (settings.damage_logout && bot.health < 4) {
				win.webContents.send("log", "health logout");
				bot.quit();
			}
			if (settings.auto_eat && bot.health < 16 && bot.food < 20) {
				bot.autoEat
					.eat(true)
					.then(() => {})
					.catch((e) => {});
			}
		});
		bot.on("playerJoined", () => {
			win.webContents.send("players", Object.keys(bot.players));
		});
		bot.on("playerLeft", () => {
			win.webContents.send("players", Object.keys(bot.players));
		});
		bot.on("soundEffectHeard", (soundName) => {
			//win.webContents.send('log', 'sound '+soundName);
		});
		bot.on("hardcodedSoundEffectHeard", (soundId, soundCategory) => {
			//win.webContents.send('log', 'soundid '+soundId+':'+soundCategory);
		});
		bot.on("goal_reached", (goal) => {
			win.webContents.send("log", "[path goal reached]");
		});
		bot.on("playerCollect", (entity, item) => {
			if (entity == bot.entity) {
			}
		});
		bot.on("path_reset", (goal) => {
			//win.webContents.send('log', '[path '+goal+']');
		});

		bot.on("physicsTick", async () => {
			tick++;
			if (settings.ticks > 0) {
				if (tick % settings.ticks == 0) {
					if (settings.attack) {
						const entity = bot.entityAtCursor();
						if (entity) {
							bot.attack(entity);
						} else {
							bot.swingArm();
						}
					}
				}
			}
			if ((settings.hold_use_inhibit == false) & settings.hold_use) {
				settings.hold_use_inhibit = true;
				const block = bot.blockAtCursor(5);

				if (block) {
					let x = 0;
					let y = 0;
					let z = 0;
					if (block.face == 0) y = -1;
					if (block.face == 1) y = 1;
					if (block.face == 2) z = -1;
					if (block.face == 3) z = 1;
					if (block.face == 4) x = -1;
					if (block.face == 5) x = 1;

					try {
						const dest = block.position.plus(new Vec3(x, y, z));
						await bot._genericPlace(block, new Vec3(x, y, z), { swingArm: "right" });
					} catch (error) {
						console.log("That did not go well.", error);
					}
					settings.hold_use_inhibit = false;
				}
			}
		});
	});
	ipcMain.handle("look", (event, msg) => {
		bot.smoothLook.look(msg[0], msg[1]);
	});
	ipcMain.handle("go", (event, msg) => {
		bot.pathfinder.setGoal(null);
		const defaultMove = new Movements(bot);
		defaultMove.allow1by1towers = false;
		defaultMove.canDig = false;
		bot.pathfinder.setMovements(defaultMove);
		if (msg[1]) {
			bot.pathfinder.setGoal(new GoalBlock(msg[0], msg[1], msg[2]));
		} else {
			bot.pathfinder.setGoal(new GoalXZ(msg[0], msg[2]));
		}
	});
	ipcMain.handle("drop", (event, msg) => {
		//bot.setQuickBarSlot(0..8)
		bot.unequip("hand");
	});
	ipcMain.handle("stop", (event, msg) => {
		bot.pathfinder.setGoal(null);
	});
	ipcMain.handle("ctrl", (event, msg) => {
		bot.setControlState(msg, !bot.getControlState(msg));
	});
	ipcMain.handle("ctrlup", (event, msg) => {
		bot.setControlState(msg, false);
	});
	ipcMain.handle("ctrldown", (event, msg) => {
		bot.setControlState(msg, true);
	});
	ipcMain.handle("logout", () => {
		if (timer1) clearInterval(timer1);
		bot.quit();
	});
	ipcMain.handle("reauth", () => {
		let uuid = uuidv4();
		store.set("uuid", uuid);
	});
	ipcMain.handle("chat", (event, msg) => {
		if (msg[0] == "_all") {
			bot.chat(msg[1]);
		} else {
			bot.whisper(msg[0], msg[1]);
		}
	});
	ipcMain.handle("tab", async (event, msg) => {
		if (bot) {
			const res = await bot.tabComplete(msg);
			return res;
		}
		return [];
	});
	ipcMain.handle("state", (event, msg) => {
		if (bot)
			if (msg[0] == "hold_use") {
				if (msg[1]) {
				} else {
				}
			}
		if (bot)
			if (msg[0] == "auto_eat") {
				if (msg[1]) {
					bot.autoEat.enable();
					bot.autoEat.options.startAt = 18;
					if (bot.health < 16 && bot.food < 20) {
						bot.autoEat
							.eat(true)
							.then(() => {})
							.catch((e) => {});
					}
				} else {
					bot.autoEat.disable();
				}
			}
		settings[msg[0]] = msg[1];
	});
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
