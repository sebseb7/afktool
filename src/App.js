import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from "@mui/material/CssBaseline";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

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
  setState({height:window.innerHeight - headerHeight});
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
		versions:[],
		version:''
	};
	console.log('constructor');
  }
 
  async componentDidMount() {
    const setState = this.setState.bind(this);
    window.addEventListener("resize", function(){resizeWindow(setState)});
    resizeWindow(setState);

    console.log('did mount');
	window.ipcApi.handleLog((event, value) => {
		let list = this.state.list;
		list.unshift({type:'log',value:value});
		if(list.length>200) list.pop();
		this.setState({list:list});
	})
	window.ipcApi.handleLink((event, value) => {
		window.ipcApi.browser(value);
	})
	const versions = await window.ipcApi.versions();
	this.setState({versions:versions,version:'1.20.1'});
  }
  componentWillUnmount() {
  	console.log('will unmount');
  }

  handleVersionChange(event,ref){
	this.setState({version:event.target.value});
  }

  render() { return(
    <div style={{padding:'0px'}}>
	  <CssBaseline/>
      <div id="header" style={{padding:'20px'}}>


      <Grid container spacing={2}>
        <Grid item xs="auto">
	  	  <TextField id="hostname" label="Hostname" defaultValue={minecrafthost} variant="outlined" size="small"/>
        </Grid>
        <Grid item xs="auto">
	  	  <TextField id="port" label="Port" defaultValue={minecraftport} variant="outlined" size="small"/>
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
	  <div style={{marginTop:'0px',width:'100%'}}>
	  
	  <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'auto',
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


	  </div>
    </div>
  )};
}

