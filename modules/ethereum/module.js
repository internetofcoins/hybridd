// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - ethereum/module.js
// Module to connect to ethereum or any of its derivatives

// required libraries in this context
var fs = require('fs');
var Client = require('../../lib/rest').Client;

// exports
exports.init = init;
exports.tick = tick;
exports.exec = exec;
exports.stop = stop;
exports.link = link;
exports.post = post;

// initialization function
function init() {
  modules.initexec('ethereum',['init']);
}

// stop function
function stop() {
}

// scheduled ticker function
function tick(properties) {
}

// standard functions of an asset store results in a process superglobal -> global.hybridd.process[processID]
// child processes are waited on, and the parent process is then updated by the postprocess() function
// http://docs.ethereum.org/en/latest/protocol.html
function exec(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var target = properties.target;
	var mode  = target.mode;
	var factor = (typeof target.factor != 'undefined'?target.factor:null);
  var fee = (typeof target.fee != 'undefined'?target.fee:null);
	var subprocesses = [];	
	// set request to what command we are performing
	global.hybridd.proc[processID].request = properties.command;
  // define the source address/wallet
  var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:false);
	// handle standard cases here, and construct the sequential process list
	switch(properties.command[0]) {
		case 'init':
			// set up init probe command to check if RPC and block explorer are responding and connected
			subprocesses.push('func("ethereum","link",{target:'+str(target)+',command:["eth_gasPrice"]})');
			subprocesses.push('func("ethereum","post",{target:'+str(target)+',command:["init"],data:data,data})');
      subprocesses.push('pass( (data != null && typeof data.result=="string" && data.result[1]=="x" ? 1 : 0) )');      
      subprocesses.push('logs(1,"module ethereum: "+(data?"connected":"failed connection")+" to ['+target.name+'] host '+target.host+':'+target.port+'")');      
		break;
		case 'status':
			// set up init probe command to check if Altcoin RPC is responding and connected
			subprocesses.push('func("ethereum","link",{target:'+str(target)+',command:["eth_protocolVersion"]})');
			subprocesses.push('func("ethereum","post",{target:'+str(target)+',command:["status"],data:data})');
		break;
		case 'factor':
      // directly return factor, post-processing not required!
      subprocesses.push('stop(0,"'+factor+'")');
		break;
		case 'fee':
      // directly return fee, post-processing not required!
      subprocesses.push('stop(0,"'+padFloat(fee,factor)+'")');
		break;
		case 'balance':
      if(sourceaddr) {
        subprocesses.push('func("ethereum","link",{target:'+str(target)+',command:["eth_getBalance",["'+sourceaddr+'","latest"]]})'); // send balance query
        subprocesses.push('stop((data!=null && typeof data.result!="undefined"?0:1),(data!=null && typeof data.result!="undefined"? fromInt(lHex2Dec(data.result),'+factor+') :null))');
      } else {
        subprocesses.push('stop(1,"Error: missing address!")');
      }
		break;
		case 'push':
      var deterministic_script = (typeof properties.command[1] != 'undefined'?properties.command[1]:false);
      if(deterministic_script) {
        subprocesses.push('func("ethereum","link",{target:'+str(target)+',command:["eth_sendRawTransaction",["'+deterministic_script+'"]]})');
        // returns: { "id":1, "jsonrpc": "2.0", "result": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331" }
        subprocesses.push('stop((typeof data.result!="undefined"?0:1),(typeof data.result!="undefined"?data.result:null))');
      } else {
        subprocesses.push('stop(1,"Missing or badly formed deterministic transaction!")');
      }
    break;
		case 'unspent':
      case 'unspent':
        subprocesses.push('stop(0,{"unspents":[],"change":"0"})');      
      break;
      //if(sourceaddr) {
      //  subprocesses.push('func("blockexplorer","exec",{target:'+str( modules.getsource(mode) )+',command:["unspent","'+sourceaddr+'"'+(properties.command[2]?',"'+properties.command[2]+'"':'')+']})');
      //} else {
      //}
    break;
		case 'history':
		break;
		default:
		 	subprocesses.push('stop(1,"Asset function not supported!")');
	}
  // fire the Qrtz-language program into the subprocess queue
  scheduler.fire(processID,subprocesses);  
}

// standard function for postprocessing the data of a sequential set of instructions
function post(properties) {
	// decode our serialized properties
	var processID = properties.processID
	var target = properties.target
	var postdata = properties.data;
	var factor = (typeof target.factor != 'undefined'?target.factor:null);
	// set data to what command we are performing
	global.hybridd.proc[processID].data = properties.command;
	// handle the command
	if (postdata == null) {
		var success = false;
	} else {
		var success = true;
		switch(properties.command[0]) {
      case 'init':
        if(typeof postdata.result!='undefined' && postdata.result) {
          global.hybridd.asset[target.name].fee = fromInt(lHex2Dec(postdata.result).times(25000),factor);
        }
      break;
			case 'status':
        // nicely cherrypick and reformat status data
        var collage = {};
        collage.module = 'ethereum';
        collage.synced = null;
        collage.blocks = null;
        collage.fee = null;
        collage.supply = null;
        collage.difficulty = null;
        collage.testmode = null;
        collage.version = (typeof postdata.result=='string' ? postdata.result : null);
        postdata = collage;
			break;
			default:
				success = false;		
		}
	}
  // stop and send data to parent
  scheduler.stop(processID,{err:(success?0:1),data:postdata});
}

// data returned by this connector is stored in a process superglobal -> global.hybridd.process[processID]
function link(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var target = properties.target;
	var command = properties.command;
	if(DEBUG) { console.log(' [D] module ethereum: sending REST call to ['+target.name+'] -> '+JSON.stringify(command)); }
	// separate method and arguments
	var mainpath = (typeof target.path == 'undefined'?'':'/'+target.path);
	var method = command.shift();
	var params = command.shift();
	var queryurl = target.host+':'+target.port+mainpath;	
	// launch the asynchronous rest functions and store result in global.hybridd.proc[processID]
  // FIX THIS! IT CAN CAUSE MEMORY LEAKS! SEE NAD CODE FOR A GOOD EXAMPLE.
	if(typeof target.user != 'undefined' && typeof target.pass != 'undefined') {
		var options_auth={user:target.user,password:target.pass};
		restAPI = new Client(options_auth);
	} else { restAPI = new Client(); }
  // do a GET or PUT/POST based on the command input
  var args = {};
  //if(typeof params!='undefined') {
  if(typeof params=='string') { try { params = JSON.parse(params); } catch(e) {} }
  args = {
      headers:{'Content-Type':'application/json'},
      data:{"jsonrpc":"2.0","method":method,"params":params,"id":Math.floor(Math.random()*10000)}
  }
  var postresult = restAPI.post(queryurl,args,function(data,response){restaction({processID:processID,data:data});});
	postresult.on('error', function(err){
    console.log(err);
    scheduler.stop(processID,{err:1});
	});
}

function restaction(properties) {
  var data = properties.data;
  if(data.code<0) { var err=1; } else { var err=data['code']; }
  try { data = JSON.parse(data); } catch(e) {}
  scheduler.stop(properties.processID,{err:err,data:data});
}

