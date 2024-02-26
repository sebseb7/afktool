import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import IconButton from "@mui/material/IconButton";
import WestIcon from "@mui/icons-material/West";
import EastIcon from "@mui/icons-material/East";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import BackHandIcon from "@mui/icons-material/BackHand";
import AirlineStopsIcon from "@mui/icons-material/AirlineStops";

import { Chart as ChartJS, PointElement, Colors, Tooltip, Legend, LinearScale } from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(PointElement, Tooltip, Legend, LinearScale, Colors);

const invsprite = require("./invsprite.json");

const darkTheme = createTheme({
	palette: {
		mode: "dark",
	},
});

const reactParse = require("html-react-parser").default;

function onSlotButton(ctx, slot) {
	window.ipcApi.setSlot(slot);
	ctx.setState({ slotActive: slot });
}
function onLookButton(ctx) {
	window.ipcApi.look(Math.PI - (document.getElementById("yaw").value / 90) * (Math.PI / 2), (document.getElementById("pitch").value / 90) * (Math.PI / 2) * -1);
}
function onGoButton(ctx) {
	window.ipcApi.go(document.getElementById("x").value, document.getElementById("y").value, document.getElementById("z").value);
}
function onStopButton(ctx) {
	window.ipcApi.stop();
}
function onDropButton(ctx) {
	window.ipcApi.drop();
}
function onCtrlButton(ctrl) {
	window.ipcApi.ctrl(ctrl);
}
function onCtrlUpButton(ctrl) {
	window.ipcApi.ctrlup(ctrl);
}
function onCtrlDownButton(ctrl) {
	window.ipcApi.ctrldown(ctrl);
}
function onChatButton(ctx) {
	window.ipcApi.chat(ctx.state.toPlayer, ctx.state.chatmsg);
	if (ctx.state.chatmsg.startsWith("/")) {
		let list = ctx.state.list;
		list.unshift({ type: "log", value: "[CMD] " + ctx.state.chatmsg });
		if (list.length > 200) list.pop();
		ctx.setState({ list: list });
	}
	ctx.setState({ chatmsg: "", tabs: [] });
}
async function onChatTab(ctx) {
	if (ctx.state.chatmsg === "") return;
	const tabs = await window.ipcApi.tab(ctx.state.chatmsg);
	let prefix = ctx.state.chatmsg;
	if (prefix.slice(-1) === " ") {
	} else {
		let tmp = prefix.split(" ");
		tmp.pop();
		prefix = tmp.join(" ");
		if (prefix === "") {
			prefix = "/";
		} else {
			if (prefix !== ctx.state.chatmsg) prefix += " ";
		}
	}
	ctx.setState({ tabs: tabs.map((a) => prefix + a.match) });
}
function onLoginButton(state) {
	window.ipcApi.login(document.getElementById("hostname").value, document.getElementById("port").value, state.version, state.profile);
}
function onLogoutButton() {
	window.ipcApi.logout();
}
function onReauthButton(state) {
	window.ipcApi.reauth(state.profile);
}

function resizeWindow(setState) {
	const headerHeight = document.getElementById("header").offsetHeight;
	const footerHeight = document.getElementById("footer").offsetHeight;
	setState({ height: window.innerHeight - (headerHeight + footerHeight) });
}

const argv = window.ipcApi.argv;
let minecrafthost = "";
let minecraftport = "";

for (let item of argv) {
	const [name, value] = item.split("=");
	if (name === "minecrafthost") {
		minecrafthost = value;
	}
	if (name === "minecraftport") {
		minecraftport = value;
	}
}

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 600,
			list: [],
			players: [],
			toPlayer: "_all",
			versions: [],
			profiles: [
				{ value: "a", text: "Profile A" },
				{ value: "b", text: "Profile B" },
				{ value: "c", text: "Profile C" },
				{ value: "d", text: "Profile D" },
			],
			profile: "a",
			version: "",
			chatmsg: "",
			health: "",
			hunger: "",
			position: "",
			tabs: [],
			settings_damage_logout: false,
			settings_hold_use: false,
			settings_auto_eat: false,
			settings_anti_afk: false,
			settings_attack: false,
			settings_ticks: 30,
			slot_5: "air",
			slot_6: "air",
			slot_7: "air",
			slot_8: "air",
			slot_36: "air",
			slot_37: "air",
			slot_38: "air",
			slot_39: "air",
			slot_40: "air",
			slot_41: "air",
			slot_42: "air",
			slot_43: "air",
			slot_44: "air",
			slot_45: "air",
			slot_36num: "",
			slot_37num: "",
			slot_38num: "",
			slot_39num: "",
			slot_40num: "",
			slot_41num: "",
			slot_42num: "",
			slot_43num: "",
			slot_44num: "",
			slot_45num: "",
			slotActive: null,
			radar: {
				datasets: [],
			}
		};
	}

	async componentDidMount() {
		const setState = this.setState.bind(this);
		window.addEventListener("resize", function () {
			resizeWindow(setState);
		});
		resizeWindow(setState);

		window.ipcApi.handleLog((event, value) => {
			let list = this.state.list;
			list.unshift({ type: "log", value: reactParse(value) });
			if (list.length > 200) list.pop();
			this.setState({ list: list });
		});
		window.ipcApi.handleLink((event, value) => {
			window.ipcApi.browser(value);
		});
		window.ipcApi.handleSlotActive((event, value) => {
			this.setState({ slotActive: value });
		});
		window.ipcApi.handleSlot((event, slot, name, size) => {
			if (!name) name = "air";
			if (!invsprite[name]) name = "barrier";
			if (slot === 5) this.setState({ slot_5: name });
			if (slot === 6) this.setState({ slot_6: name });
			if (slot === 7) this.setState({ slot_7: name });
			if (slot === 8) this.setState({ slot_8: name });
			if (slot === 45) this.setState({ slot_45: name, slot_45num: size && size > 1 ? size : "" });
			if (slot === 36) this.setState({ slot_36: name, slot_36num: size && size > 1 ? size : "" });
			if (slot === 36) this.setState({ slot_36: name, slot_36num: size && size > 1 ? size : "" });
			if (slot === 37) this.setState({ slot_37: name, slot_37num: size && size > 1 ? size : "" });
			if (slot === 38) this.setState({ slot_38: name, slot_38num: size && size > 1 ? size : "" });
			if (slot === 39) this.setState({ slot_39: name, slot_39num: size && size > 1 ? size : "" });
			if (slot === 40) this.setState({ slot_40: name, slot_40num: size && size > 1 ? size : "" });
			if (slot === 41) this.setState({ slot_41: name, slot_41num: size && size > 1 ? size : "" });
			if (slot === 42) this.setState({ slot_42: name, slot_42num: size && size > 1 ? size : "" });
			if (slot === 43) this.setState({ slot_43: name, slot_43num: size && size > 1 ? size : "" });
			if (slot === 44) this.setState({ slot_44: name, slot_44num: size && size > 1 ? size : "" });
		});
		window.ipcApi.handleName((event, slot, name) => {
			const profiles = this.state.profiles;
			if (slot === "a") profiles[0].text = name;
			if (slot === "b") profiles[1].text = name;
			if (slot === "c") profiles[2].text = name;
			if (slot === "d") profiles[3].text = name;
			this.setState({ profiles: profiles });
		});
		window.ipcApi.handlePosition((event, value, yaw, pitch) => {
			this.setState({
				position:
					Math.round(value.x * 10) / 10 +
					" " +
					Math.round(value.y * 10) / 10 +
					" " +
					Math.round(value.z * 10) / 10 +
					" (" +
					Math.round(((yaw * -1 - Math.PI) / Math.PI) * 1800) / 10 +
					"/" +
					Math.round(((pitch * -1) / Math.PI) * 1800) / 10 +
					")",
			});
		});
		window.ipcApi.handleHealth((event, value, value2) => {
			this.setState({ health: Math.round(value), hunger: Math.round(value2) });
		});
		window.ipcApi.handleEntities((event, value) => {
			
			let sets = {};
			for (const entitiy of value) {
				if (!sets[entitiy.name]) sets[entitiy.name] = [];
				sets[entitiy.name].push({ x: entitiy.pos.x, y: entitiy.pos.z })
			}
			let datasets = [];
			for (const set of Object.keys(sets).sort()) {
				datasets.push({ label: set, data: sets[set] });
			}

			this.setState({ radar: {datasets: datasets} });
		});
		window.ipcApi.handlePlayers((event, value) => {
			this.setState({ players: value });
			if (this.state.toPlayer !== "_all" && !value.includes(this.state.toPlayer)) {
				this.setState({ toPlayer: "_all" });
			}
		});
		const versions = await window.ipcApi.versions();
		const profiles = await window.ipcApi.profiles();
		const profiles_state = this.state.profiles;
		if (profiles[0]) profiles_state[0].text = profiles[0];
		if (profiles[1]) profiles_state[1].text = profiles[1];
		if (profiles[2]) profiles_state[2].text = profiles[2];
		if (profiles[3]) profiles_state[3].text = profiles[3];
		this.setState({ profiles: profiles_state });
		this.setState({ versions: versions, version: "1.20.1" });
	}
	componentWillUnmount() {}

	handleVersionChange(event, ref) {
		this.setState({ version: event.target.value });
	}
	handleProfileChange(event, ref) {
		this.setState({ profile: event.target.value });
	}
	handleToChange(event, ref) {
		this.setState({ toPlayer: event.target.value });
		//state.setState({chatmsg:''});
	}
	handleChatmsgChange(event, ref) {
		if (!event || !event.target) return;
		if (event.type === "click") {
			this.setState({ chatmsg: event.target.innerText, tabs: [] });
			return;
		}
		if (event.type === "keydown") {
			this.setState({ chatmsg: event.target.value, tabs: [] });
			return;
		}
		this.setState({ chatmsg: event.target.value, tabs: [] });
	}
	handleSettingsDamageLogoutChange(event) {
		this.setState({ settings_damage_logout: event.target.checked });
		window.ipcApi.state("damage_logout", event.target.checked);
	}
	handleSettingsHoldUseChange(event) {
		this.setState({ settings_hold_use: event.target.checked });
		window.ipcApi.state("hold_use", event.target.checked);
	}
	handleSettingsAutoEatChange(event) {
		this.setState({ settings_auto_eat: event.target.checked });
		window.ipcApi.state("auto_eat", event.target.checked);
	}
	handleSettingsAntiAfkChange(event) {
		this.setState({ settings_anti_afk: event.target.checked });
		window.ipcApi.state("anti_afk", event.target.checked);
	}
	handleSettingsAttackChange(event) {
		this.setState({ settings_attack: event.target.checked });
		window.ipcApi.state("attack", event.target.checked);
	}
	handleSettingsTicksChange(event) {
		this.setState({ settings_ticks: event.target.value });
		window.ipcApi.state("ticks", event.target.value);
	}

	render() {
		return (
			<ThemeProvider theme={darkTheme}>
				<div style={{ padding: "0px" }}>
					<CssBaseline />
					<div id="header" style={{ padding: "20px" }}>
						<Grid container spacing={2}>
							<Grid item xs="auto">
								<TextField InputLabelProps={{ shrink: true }} id="hostname" label="Hostname" defaultValue={minecrafthost} variant="outlined" size="small" />
							</Grid>
							<Grid item xs="auto">
								<TextField InputLabelProps={{ shrink: true }} id="port" label="Port" defaultValue={minecraftport} variant="outlined" size="small" />
							</Grid>
							<Grid item xs="auto">
								<FormControl size="small">
									<InputLabel id="select-label">Version</InputLabel>
									<Select
										labelId="select-label"
										label="Version"
										id="version"
										value={this.state.version}
										onChange={(event) => {
											this.handleVersionChange(event, this);
										}}
									>
										{this.state.versions.map((line, i) => (
											<MenuItem value={line}>{line}</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs="auto">
								<FormControl size="small">
									<InputLabel id="select-label">Profile</InputLabel>
									<Select
										labelId="select-label"
										label="Profile"
										id="profile"
										value={this.state.profile}
										onChange={(event) => {
											this.handleProfileChange(event, this);
										}}
									>
										{this.state.profiles.map((line, i) => (
											<MenuItem value={line.value}>{line.text}</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs="auto">
								<Button
									onClick={() => {
										onLoginButton(this.state);
									}}
									variant="contained"
								>
									Login
								</Button>
							</Grid>
							<Grid item xs="auto">
								<Button onClick={onLogoutButton} variant="contained">
									Logout
								</Button>
							</Grid>
							<Grid item xs="auto">
								<Button
									onClick={() => {
										onReauthButton(this.state);
									}}
									variant="contained"
								>
									Reauth
								</Button>
							</Grid>
						</Grid>
					</div>

					<Grid container spacing={2}>
						
						<Grid item xs="8">

							<List
								sx={{
									width: "100%",
									bgcolor: "background.paper",
									position: "relative",
									overflow: "auto",
									height: this.state.height,
									maxHeight: this.state.height,
									"& ul": { padding: 0 },
								}}
							>
								
								<li key={`section`}>
									<ul>
										<li>
											<Scatter options={{ plugins: { colors: { forceOverride: true } }, scales: { y: { beginAtZero: false } }, animation: false, transitions:{active:{animation:{duration:0}}} }} data={this.state.radar}/>
										</li>
										{this.state.list.map((line, i) => (
											<ListItem sx={{ fontFamily: "Monospace", paddingTop: 0, paddingBottom: 0 }} key={"item_" + i}>
												{line.type === "log" && <ListItemText sx={{ margin: 0 }} primary={line.value} />}
											</ListItem>
										))}
									</ul>
									
								</li>
							</List>
						</Grid>
						<Grid item xs="4">
							<Stack spacing={1}>
								<FormGroup>
									<FormControlLabel
										checked={this.state.settings_damage_logout}
										onChange={(event) => {
											this.handleSettingsDamageLogoutChange(event);
										}}
										control={<Switch />}
										label="Logout on low health"
									/>
									<FormControlLabel
										checked={this.state.settings_anti_afk}
										onChange={(event) => {
											this.handleSettingsAntiAfkChange(event);
										}}
										control={<Switch />}
										label="Anti AFK"
									/>
									<FormControlLabel
										checked={this.state.settings_auto_eat}
										onChange={(event) => {
											this.handleSettingsAutoEatChange(event);
										}}
										control={<Switch />}
										label="Auto eat"
									/>
									<FormControlLabel
										checked={this.state.settings_attack}
										onChange={(event) => {
											this.handleSettingsAttackChange(event);
										}}
										control={<Switch />}
										label={
											<>
												<span style={{ paddingRight: "10px", lineHeight: "40px" }}>Attack every</span>
												<TextField
													sx={{ width: 80 }}
													InputLabelProps={{ shrink: true }}
													value={this.state.settings_ticks}
													onChange={(event) => {
														this.handleSettingsTicksChange(event);
													}}
													label="ticks"
													variant="outlined"
													size="small"
												/>
											</>
										}
									/>
									<FormControlLabel
										checked={this.state.settings_hold_use}
										onChange={(event) => {
											this.handleSettingsHoldUseChange(event);
										}}
										control={<Switch />}
										label="Hold place"
									/>
								</FormGroup>
								<Table size="small">
									<TableBody>
										<TableRow key="health" sx={{ "th,td": { border: 0 } }}>
											<TableCell component="th" scope="row">
												Health
											</TableCell>
											<TableCell align="right">{this.state.health}</TableCell>
										</TableRow>
										<TableRow key="hunger" sx={{ "th,td": { border: 0 } }}>
											<TableCell component="th" scope="row">
												Hunger
											</TableCell>
											<TableCell align="right">{this.state.hunger}</TableCell>
										</TableRow>
										<TableRow key="position" sx={{ "td,th": { border: 0 } }}>
											<TableCell component="th" scope="row">
												Position
											</TableCell>
											<TableCell align="right">{this.state.position}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<Grid container spacing={2}>
									<Grid item xs="4">
										<TextField InputLabelProps={{ shrink: true }} id="yaw" label="Yaw" variant="outlined" size="small" />
									</Grid>
									<Grid item xs="4">
										<TextField InputLabelProps={{ shrink: true }} id="pitch" label="Pitch" variant="outlined" size="small" />
									</Grid>
									<Grid item xs="3">
										<Button
											onClick={() => {
												onLookButton(this.state);
											}}
											variant="contained"
										>
											Look
										</Button>
									</Grid>
								</Grid>
								<Grid container spacing={2}>
									<Grid item xs="5">
										<TextField InputLabelProps={{ shrink: true }} id="x" label="X" variant="outlined" size="small" />
									</Grid>
									<Grid item xs="5">
										<TextField InputLabelProps={{ shrink: true }} id="z" label="Z" variant="outlined" size="small" />
									</Grid>
								</Grid>
								<Grid container spacing={2}>
									<Grid item xs="5">
										<TextField InputLabelProps={{ shrink: true }} id="y" label="Y" variant="outlined" size="small" />
									</Grid>
									<Grid item xs="3">
										<Button
											onClick={() => {
												onGoButton(this.state);
											}}
											variant="contained"
										>
											Go
										</Button>
									</Grid>
									<Grid item xs="3">
										<Button
											onClick={() => {
												onStopButton(this.state);
											}}
											variant="contained"
										>
											Stop
										</Button>
									</Grid>
								</Grid>
								<Stack direction="row" spacing={1}>
									<IconButton
										onClick={() => {
											onCtrlButton("sprint");
										}}
									>
										<DirectionsRunIcon />
									</IconButton>
									<IconButton
										onMouseDown={() => {
											onCtrlDownButton("forward");
										}}
										onMouseUp={() => {
											onCtrlUpButton("forward");
										}}
									>
										<NorthIcon />
									</IconButton>
									<IconButton
										onClick={() => {
											onCtrlButton("sneak");
										}}
									>
										<DirectionsWalkIcon />
									</IconButton>
									<IconButton
										onClick={() => {
											onDropButton(this.state);
										}}
									>
										<BackHandIcon />
									</IconButton>
								</Stack>
								<Stack direction="row" spacing={1}>
									<IconButton
										onMouseDown={() => {
											onCtrlDownButton("left");
										}}
										onMouseUp={() => {
											onCtrlUpButton("left");
										}}
									>
										<WestIcon />
									</IconButton>
									<IconButton
										onMouseDown={() => {
											onCtrlDownButton("back");
										}}
										onMouseUp={() => {
											onCtrlUpButton("back");
										}}
									>
										<SouthIcon />
									</IconButton>
									<IconButton
										onMouseDown={() => {
											onCtrlDownButton("right");
										}}
										onMouseUp={() => {
											onCtrlUpButton("right");
										}}
									>
										<EastIcon />
									</IconButton>
									<IconButton
										onClick={() => {
											onCtrlButton("jump");
										}}
									>
										<AirlineStopsIcon />
									</IconButton>
								</Stack>
								<Stack direction="row" spacing={0.3}>
									<div
										onClick={() => {
											onSlotButton(this, 0);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 0 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_36].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_36].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_36num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 1);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 1 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_37].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_37].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_37num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 2);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 2 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_38].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_38].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_38num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 3);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 3 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_39].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_39].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_39num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 4);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 4 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_40].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_40].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_40num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 5);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 5 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_41].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_41].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_41num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 6);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 6 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_42].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_42].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_42num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 7);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 7 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_43].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_43].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_43num}
									</div>
									<div
										onClick={() => {
											onSlotButton(this, 8);
										}}
										style={{
											border: "1px solid #" + (this.state.slotActive === 8 ? "aaa" : "444"),
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_44].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_44].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_44num}
									</div>
								</Stack>
								<Stack direction="row" spacing={0.3}>
									<div
										style={{
											border: "1px solid #444",
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_45].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_45].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									>
										{this.state.slot_45num}
									</div>
									<div
										style={{
											border: "1px solid #444",
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_5].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_5].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									></div>
									<div
										style={{
											border: "1px solid #444",
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_6].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_6].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									></div>
									<div
										style={{
											border: "1px solid #444",
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_7].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_7].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									></div>
									<div
										style={{
											border: "1px solid #444",
											width: 32,
											height: 32,
											backgroundPositionX: -1 * invsprite[this.state.slot_8].x,
											backgroundPositionY: -1 * invsprite[this.state.slot_8].y,
											backgroundSize: "1024px auto",
											backgroundImage: "url('invsprite.png')",
											userSelect: "none",
										}}
									></div>
								</Stack>
							</Stack>
						</Grid>
					</Grid>

					<div id="footer" style={{ padding: "20px" }}>
						<Grid container spacing={2}>
							<Grid item xs="auto">
								<FormControl size="small">
									<InputLabel id="to-label">To</InputLabel>
									<Select
										labelId="to-label"
										label="To"
										id="to"
										value={this.state.toPlayer}
										onChange={(event) => {
											this.handleToChange(event, this);
										}}
									>
										<MenuItem value={"_all"}>everyone</MenuItem>
										{this.state.players.map((line, i) => (
											<MenuItem value={line}>{line}</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs="9">
								<Autocomplete
									clearIcon={<></>}
									id="chatmsg"
									sx={{ width: "100%" }}
									options={this.state.tabs}
									freeSolo
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											onChatButton(this);
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "Tab") {
											e.preventDefault();
											onChatTab(this);
										}
									}}
									value={this.state.chatmsg}
									onChange={(event) => {
										this.handleChatmsgChange(event, this);
									}}
									onInputChange={(event) => {
										this.handleChatmsgChange(event, this);
									}}
									renderInput={(params) => <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} label="Chatmsg" variant="outlined" size="small" />}
								/>
							</Grid>
							<Grid item xs="auto">
								<Button
									onClick={() => {
										onChatButton(this);
									}}
									variant="contained"
								>
									Send
								</Button>
							</Grid>
						</Grid>
					</div>
				</div>
			</ThemeProvider>
		);
	}
}
