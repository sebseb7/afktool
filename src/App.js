import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from '@mui/material/styles';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import Autocomplete from '@mui/material/Autocomplete';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const reactParse = require('html-react-parser').default;

function onChatButton(ctx){
	window.ipcApi.chat(ctx.state.toPlayer,ctx.state.chatmsg);
	if(ctx.state.chatmsg.startsWith('/')){
		let list = ctx.state.list;
		list.unshift({type:'log',value:'[CMD] '+ctx.state.chatmsg});
		if(list.length>200) list.pop();
		ctx.setState({list:list});
	}
	ctx.setState({chatmsg:'',tabs:[]});
}
async function onChatTab(ctx){
	if(ctx.state.chatmsg === '') return;
	const tabs = await window.ipcApi.tab(ctx.state.chatmsg);
	let prefix = ctx.state.chatmsg;
	if(prefix.slice(-1) === ' '){
		
	}else{
		let tmp = prefix.split(' ');
		tmp.pop();
		prefix = tmp.join(' ');
		if(prefix === '') {
			prefix = '/'
		}else{
			if(prefix !== ctx.state.chatmsg) prefix += ' ';
		}
	}
	ctx.setState({tabs:tabs.map((a) => prefix+a.match)});
}
function onLoginButton(state){
	window.ipcApi.login(document.getElementById('hostname').value,document.getElementById('port').value,state.version);
}
function onLogoutButton(){
	window.ipcApi.logout();
}
function onReauthButton(){
	window.ipcApi.reauth();
}


function resizeWindow(setState) {
  const headerHeight = document.getElementById('header').offsetHeight;
  const footerHeight = document.getElementById('footer').offsetHeight;
  setState({height:window.innerHeight - ( headerHeight + footerHeight)});
};

const argv = window.ipcApi.argv;
let minecrafthost = '';
let minecraftport = '';

for(let item of argv){
	const [name,value] = item.split('=');
	if(name === 'minecrafthost'){
		minecrafthost = value;
	}
	if(name === 'minecraftport'){
		minecraftport = value;
	}
}


export default class App extends React.Component {

  constructor(props){
  	super(props);
  	this.state = {
		height:600,
		list:[],
		players:[],
		toPlayer:'_all',
		versions:[],
		version:'',
		chatmsg:'',
		health:'',
		hunger:'',
		position:'',
		tabs:[],
		settings_damage_logout:false,
		settings_hold_use:false,
		settings_auto_eat:false
	};
  }
 
  async componentDidMount() {
    const setState = this.setState.bind(this);
    window.addEventListener("resize", function(){resizeWindow(setState)});
    resizeWindow(setState);

	window.ipcApi.handleLog((event, value) => {
		let list = this.state.list;
		list.unshift({type:'log',value:reactParse(value)});
		if(list.length>200) list.pop();
		this.setState({list:list});
	})
	window.ipcApi.handleLink((event, value) => {
		window.ipcApi.browser(value);
	})
	window.ipcApi.handlePosition((event, value) => {
		this.setState({position:Math.round(value.x*100)/100+' '+Math.round(value.y*100)/100+' '+Math.round(value.z*100)/100})
	})
	window.ipcApi.handleHealth((event, value,value2) => {
		this.setState({health:Math.round(value),hunger:Math.round(value2)})
	})
	window.ipcApi.handlePlayers((event, value) => {
		this.setState({players:value});
		if(this.state.toPlayer !== '_all' && !value.includes(this.state.toPlayer)){
			this.setState({toPlayer:'_all'});
		}
	})
	const versions = await window.ipcApi.versions();
	this.setState({versions:versions,version:'1.20.1'});
  }
  componentWillUnmount() {
  }

  handleVersionChange(event,ref){
	this.setState({version:event.target.value});
  }
  handleToChange(event,ref){
	this.setState({toPlayer:event.target.value});
	//state.setState({chatmsg:''});
  }
  handleChatmsgChange(event,ref){
	if(!event || !event.target) return;
	if(event.type === 'click'){
		this.setState({chatmsg:event.target.innerText,tabs:[]});
		return;
	}
	if(event.type === 'keydown'){
		this.setState({chatmsg:event.target.value,tabs:[]});
		return;
	}
	this.setState({chatmsg:event.target.value,tabs:[]});
  }
  handleSettingsDamageLogoutChange(event){
  	this.setState({settings_damage_logout:event.target.checked});
	window.ipcApi.state('damage_logout',event.target.checked);
  }
  handleSettingsHoldUseChange(event){
  	this.setState({settings_hold_use:event.target.checked});
	window.ipcApi.state('hold_use',event.target.checked);
  }
  handleSettingsAutoEatChange(event){
  	this.setState({settings_auto_eat:event.target.checked});
	window.ipcApi.state('auto_eat',event.target.checked);
  }

  render() { return(
    <ThemeProvider theme={darkTheme}>
    <div style={{padding:'0px'}}>
	  <CssBaseline/>
      <div id="header" style={{padding:'20px'}}>


      <Grid container spacing={2}>
        <Grid item xs="auto">
	  	  <TextField InputLabelProps={{ shrink: true }} id="hostname" label="Hostname" defaultValue={minecrafthost} variant="outlined" size="small"/>
        </Grid>
        <Grid item xs="auto">
	  	  <TextField InputLabelProps={{ shrink: true }} id="port" label="Port" defaultValue={minecraftport} variant="outlined" size="small"/>
        </Grid>
        <Grid item xs="auto">
		<FormControl size="small">
          <InputLabel id="select-label">Version</InputLabel>
	      <Select
    		labelId="select-label"
    		label="Version"
			id="version"
			value={this.state.version}
			onChange={(event) => {this.handleVersionChange(event, this)}}
  		  >
		  	{this.state.versions.map((line, i) => (
				<MenuItem value={line}>{line}</MenuItem>
			))}
		  </Select>
		  </FormControl>
		</Grid>
        <Grid item xs="auto">
          <Button onClick={()=>{onLoginButton(this.state)}} variant="contained">Login</Button>
        </Grid>
        <Grid item xs="auto">
          <Button onClick={onLogoutButton} variant="contained">Logout</Button>
        </Grid>
        <Grid item xs="auto">
          <Button onClick={onReauthButton} variant="contained">Reauth</Button>
        </Grid>
      </Grid>


      </div>
      
	  <Grid container spacing={2}>
        <Grid item xs="8">
	  
	  <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'auto',
        height: this.state.height,
        maxHeight: this.state.height,
        '& ul': { padding: 0 },
      }}
    >
        <li key={`section`}>
          <ul>
			{this.state.list.map((line,i) => 
              <ListItem sx={{fontFamily:'Monospace',paddingTop:0,paddingBottom:0}} key={'item_'+i}>
			    {line.type === 'log' &&
				 <ListItemText sx={{margin:0}} primary={line.value} />
				}
              </ListItem>
			)}
          </ul>
        </li>
    </List>
		</Grid>
        <Grid item xs="4">
		    <FormGroup>
      			<FormControlLabel checked={this.state.settings_damage_logout} onChange={(event)=>{this.handleSettingsDamageLogoutChange(event)}} control={<Switch/>} label="Logout on low health" />
      			<FormControlLabel checked={this.state.settings_auto_eat} onChange={(event)=>{this.handleSettingsAutoEatChange(event)}} control={<Switch/>} label="Auto eat" />
    		</FormGroup>	

      <Table size="small">
        <TableBody>
            <TableRow key="health" sx={{ 'th,td': { border: 0 } }}>
              <TableCell component="th" scope="row">Health</TableCell>
              <TableCell align="right">{this.state.health}</TableCell>
            </TableRow>
            <TableRow key="hunger" sx={{ 'th,td': { border: 0 } }}>
              <TableCell component="th" scope="row">Hunger</TableCell>
              <TableCell align="right">{this.state.hunger}</TableCell>
            </TableRow>
            <TableRow key="position" sx={{ 'td,th': { border: 0 } }}>
              <TableCell component="th" scope="row">Position</TableCell>
              <TableCell align="right">{this.state.position}</TableCell>
            </TableRow>
        </TableBody>
      </Table>

		</Grid>
	</Grid>

      <div id="footer" style={{padding:'20px'}}>
      
	  <Grid container spacing={2}>
        <Grid item xs="auto">
		  <FormControl size="small">
          <InputLabel id="to-label">To</InputLabel>
	      <Select
    		labelId="to-label"
    		label="To"
			id="to"
			value={this.state.toPlayer}
			onChange={(event) => {this.handleToChange(event, this)}}
  		  >
			<MenuItem value={'_all'}>everyone</MenuItem>
		  	{this.state.players.map((line, i) => (
				<MenuItem value={line}>{line}</MenuItem>
			))}
		  </Select>
		  </FormControl>
        </Grid>
        <Grid item xs="9">
	  	  <Autocomplete clearIcon={<></>} id="chatmsg" sx={{width: '100%'}} options={this.state.tabs} freeSolo onKeyPress={(e) => { if (e.key === 'Enter') { onChatButton(this) }}} onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault();onChatTab(this); }}} value={this.state.chatmsg} onChange={(event) => {this.handleChatmsgChange(event,this)}}  onInputChange={(event) => {this.handleChatmsgChange(event,this)}} renderInput={(params) => <TextField  {...params} fullWidth InputLabelProps={{ shrink: true }} label="Chatmsg" variant="outlined" size="small"/>}
		  />
        </Grid>
        <Grid item xs="auto">
          <Button onClick={()=>{onChatButton(this)}} variant="contained">Send</Button>
        </Grid>
      </Grid>
	  </div>


    </div>
    </ThemeProvider>
  )};
}

