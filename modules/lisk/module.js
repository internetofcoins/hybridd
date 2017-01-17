// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - lisk/module.js
// Module to connect to CryptoNote currencies like Monero/Bytecoin or any of their derivatives

// required libraries in this context
var fs = require('fs');
var Client = require('../../lib/rest').Client;

// exports
exports.init = init;
exports.tick = tick;
exports.exec = exec;
exports.post = post;
exports.stop = stop;
exports.link = link;

// init function
function init() {
	var modulename = 'lisk';
	var command = ["status/init"];
	// this module can provide assets (wallet)
	for (var asset in global.hybridd.asset) {
		if(typeof global.hybridd.asset[asset].module != 'undefined' && global.hybridd.asset[asset].module == modulename) {
			// check the status of the connection, and give init feedback
			var processID = scheduler.initproc(0);
			var target = global.hybridd.asset[asset]; target.name = asset;
			var subprocesses = []
      subprocesses.push('func("lisk","exec",'+JSON.stringify({target,command})+')');
			subprocesses.push('func("lisk","post",'+JSON.stringify({target,command})+')');
			scheduler.subqueue(processID,subprocesses);
		}
	}
	// this module can provide sources (daemon)
	for (var source in global.hybridd.source) {
		if(typeof global.hybridd.source[source].module != 'undefined' && global.hybridd.source[source].module == modulename) {
			// check the status of the connection, and give init feedback
			var processID = scheduler.initproc(0);
			var target = global.hybridd.source[source]; target.name = source;
			var subprocesses = modules.module.lisk.main.exec({"processID":processID,"target":target,"command":command});
			subprocesses.push('func("lisk","post",'+JSON.stringify({target,command})+')')
			scheduler.subqueue(processID,subprocesses);
		}
	}
}

// stop function
function stop() {
}

// scheduled ticker function
function tick(properties) {
}

// standard functions of an asset store results in a process superglobal -> global.hybridd.process[processID]
// child processes are waited on, and the parent process is then updated by the postprocess() function
function exec(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var source = properties.source;
	var target = properties.target;
	var type  = properties.type;
	var factor = (typeof properties.factor != 'undefined'?properties.factor:12);
	var subprocesses = [];	
	var command = [];
	var postprocessing = true;
	// set request to what command we are performing
	global.hybridd.proc[processID].request = properties.command;
	// shortcut to function link (see below)
	var link = 'modules.module.lisk.main.link';
	// handle standard cases here, and construct the sequential process list
	switch(properties.command[0]) {
		case 'status':
			// set up init probe command to check if Lisk API is responding and connected
			if(typeof properties.command[1] == 'undefined') {	// ignore this during init phase
				command = ['api/loader/status/sync'];	// get sync status
				subprocesses.push('func("lisk","link",'+JSON.stringify({target,command})+')');
				subprocesses.push('poke("liskA",data)');	// store the resulting data for post-process collage
				command = ['api/blocks/getStatus'];	// get milestone / difficulty
				subprocesses.push('func("lisk","link",'+JSON.stringify({target,command})+')');
				// DEPRECATED: subprocesses.push('modules.module.lisk.main.link('+JSON.stringify({processID,target,command})+')');
				subprocesses.push('poke("liskB",data)');	// store the resulting data for post-process collage
			}			
			command = ['api/peers/version'];	// get version
			subprocesses.push(link+'('+JSON.stringify({processID,target,command})+')');    // extended version: subprocesses.push('modules.module.counterparty.main.link({"processID":'+s_processID+',"target":'+s_target+',"command":'+JSON.stringify(command)+'});');
		break;
		case 'balance':
      // define the source address/wallet
      var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:'local');
      command = ['api/accounts/getBalance?address='+sourceaddr];
      subprocesses.push('func("lisk","link",'+JSON.stringify({target,command})+')');
		break;
		case 'transfer':
      // if local wallet
      if(type == 'local') {
        subprocesses.push('stop(0,"Error: local wallet not supported!")');
      } else {
				var deterministic_script = (typeof properties.command[1] != 'undefined'?properties.command[1]:false);
				if(deterministic_script) {
          // get the nethash to be able to send transactions
          command = ['/api/blocks/getNetHash'];
          subprocesses.push('func("lisk","link",'+JSON.stringify({target,command})+')');
          // shoot deterministic script object to peer node
          command = ['peer/transactions',deterministic_script];
          subprocesses.push('func("lisk","link",{target:'+JSON.stringify(target)+',command:'+JSON.stringify(command)+',nethash:data.nethash})');
        }
      }
    break;
		case 'factor':
      // directly relay factor, post-processing not required!
      subprocesses.push('stop(0,'+factor+')');     
		break;
      case 'confirm':
      confirms = 10;
      subprocesses.push('poke("i",4)');
      subprocesses.push('poke("j",5)');
      subprocesses.push('poke("k",6)');
      subprocesses.push('coll(0)');
      subprocesses.push('stop(0,data)');
      postprocessing = false;
		break;
		case 'transferlist':
      //if(typeof properties.command[1] != 'undefined') { if(properties.command[1] == 'pending') { var transfertype = 'unavailable' } else { var transfertype = 'available'; } } else { var transfertype = 'available'; }
      // /api/transactions?blockId=blockId&senderId=senderId&recipientId=recipientId&limit=limit&offset=offset&orderBy=field
      var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:'local');
      var limit = (typeof properties.command[2] != 'undefined'?'&limit='+properties.command[2]:'');
      var offset = (typeof properties.command[3] != 'undefined'?'&offset='+properties.command[3]:'');
      //var startdate = (typeof properties.command[1] != 'undefined'?properties.command[1]:(Date.now()-(86400*14)));
      //var enddate = (typeof properties.command[1] != 'undefined'?properties.command[1]:Date.now());
      var params = 'recipientId='+sourceaddr+limit+offset+'&orderBy=timestamp:desc';
      command = ['api/transactions?'+params];
      subprocesses.push('poke("sourceaddr","'+sourceaddr+'")');	// store the resulting data for post-process collage
      subprocesses.push('func("lisk","link",'+JSON.stringify({target,command})+')');
		break;
		default:
		 	subprocesses.push('stop(1,"Asset function not supported!")');
	}
	return subprocesses;
}

// standard function for postprocessing the data of a sequential set of instructions
function post(properties) {
	// decode our serialized properties
	var processID = properties.processID
	var procinfo = scheduler.procpart(properties.processID);
	var parentID = procinfo[0];
	var prevproc = procinfo[2];
	var target = properties.target;
	var factor = (typeof properties.factor != 'undefined'?properties.factor:12);
	var type  = (typeof properties.type != 'undefined'?properties.type:'deterministic');	
	var postvars = global.hybridd.proc[parentID].vars;
	var postdata = global.hybridd.proc[prevproc].data;
	// set data to what command we are performing
	global.hybridd.proc[processID].data = properties.command;
	// handle the command
	if (postdata == null) {
		var success = false;
	} else {
		var success = true;
		switch(properties.command[0]) {
			case 'status':
				if (typeof postdata.success != 'undefined') {
					// nicely cherrypick and reformat status data
					var collage = {};
					collage.module = 'lisk';
					if(postvars != null) {
						if(typeof postvars.liskA != 'undefined') {
							collage.synced = (typeof postvars.liskA.blocks != 'undefined'	? (postvars.liskA.blocks ? 0 : 1) : null);
							collage.blocks = (typeof postvars.liskA.height != 'undefined'	? postvars.liskA.height : null);
							// ADD blocktime
						}
						if(typeof postvars.liskB != 'undefined') {
							collage.fee = (typeof postvars.liskB.fee != 'undefined'					? postvars.liskB.fee : null);
							collage.supply = (typeof postvars.liskB.supply != 'undefined'			? postvars.liskB.supply : null);							
							collage.difficulty = (typeof postvars.liskB.milestone != 'undefined'	? postvars.liskB.milestone : null);
						}
						collage.testmode = 0;   // Lisk always runs realnet?
					} else {
						collage.synced = null;
						collage.blocks = null;
						collage.fee = null;
						collage.supply = null;
						collage.difficulty = null;
						collage.testmode = null;
					}
					collage.version = (typeof postdata.version != 'undefined' ? String(postdata.version+' (build '+(typeof postdata.build != 'undefined'?postdata.build.rTrim("\n"):'?')+')') : null);
					postdata = collage;
					// on init, report back to stdout
					if(properties.command[1] == 'init') {
						console.log(' [i] module lisk: connected to ['+target.name+'] host '+target.host+':'+target.port);
					}
				} else {
					console.log(' [!] module lisk: failed connection to ['+target.name+'] host '+target.host+':'+target.port);
					global.hybridd.proc[parentID].err = 1;
				}		
			break;
      case 'deterministic':
				global.hybridd.proc[prevproc].err = 1;
        if(typeof postdata.success != 'undefined') {
          if(postdata.success) {
            global.hybridd.proc[prevproc].err = 0;
          }
        }
      break;
			case 'balance':
				// if result is not a number, set the error flag!
				global.hybridd.proc[prevproc].err = 1;
        if(typeof postdata.success != 'undefined') {
          if(postdata.success) {
            // data returned looks like: {"success":true,"balance":"0","unconfirmedBalance":"0"}
            global.hybridd.proc[prevproc].err = 0;
            postdata = postdata.balance/Math.pow(10,factor);
          }
        }
			break;
			case 'transfer':
				global.hybridd.proc[prevproc].err = 1;
				if(typeof postdata.transactionId != 'undefined') {
					global.hybridd.proc[prevproc].err = 0;
					//postdata = functions.clean(postdata.result.tx_hash);
					postdata = functions.clean(postdata.transactionId);
				}
			break;
			case 'transferlist':
				global.hybridd.proc[prevproc].err = 1;
				if(typeof postdata.transactions != 'undefined') {
					if(typeof postdata.transactions == 'object') {
						global.hybridd.proc[prevproc].err = 0;
						var transactions = [];
						var cnt = 0;
						postdata.transactions.forEach(function(entry) {
							transactions.push({
								id:entry.id,
								amount:entry.amount/Math.pow(10,factor),
								send:(entry.senderId==sourceaddr?1:0),  // GET SOURCEADDR!
								txid:functions.clean(entry.blockId),
                time:entry.timestamp
							});
							cnt++;
						});
						postdata = transactions;
					}
				}
			break;
			default:
				success = false;		
		}
	}
  scheduler.stopproc(processID,{err:(success?1:0),data:postdata});
	// default is to transfer the datafield of the last subprocess to the main process
	if (success && !global.hybridd.proc[prevproc].err && typeof postdata != 'undefined') {
		if(DEBUG) { console.log(' [D] sending postprocessing data to parent '+parentID); }
    scheduler.stopproc(parentID,{err:0,data:postdata});
	} else {
		if(DEBUG) { console.log(' [D] error in '+prevproc+' during postprocessing for '+parentID); }
		postdata = (typeof postdata.error!='undefined'?postdata.error:null);
    scheduler.stopproc(parentID,{err:1,data:null});
	}
}

// data returned by this connector is stored in a process superglobal -> global.hybridd.process[processID]
function link(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var target = properties.target;
	var command = properties.command;
	if(DEBUG) { console.log(' [D] module lisk: sending REST call to ['+target.name+'] -> '+JSON.stringify(command)); }
	// separate method and arguments
	var mainpath = (typeof target.path == 'undefined'?'':'/'+target.path);
	var method = command.shift();
	var params = command.shift();
	var queryurl = target.host+':'+target.port+mainpath+'/'+method;	
  console.log(queryurl);
	// launch the asynchronous rest functions and store result in global.hybridd.proc[processID]
	if(typeof target.user != 'undefined' && typeof target.pass != 'undefined') {
		var options_auth={user:target.user,password:target.pass};
		restcoin = new Client(options_auth);
	} else { restcoin = new Client(); }
  // do a GET or PUT/POST based on the command input
  var args = {};
  if(typeof params!='undefined') {
    if(typeof params=='string') { try { params = JSON.parse(params); } catch(e) {} }
    //params.jsonrpc = '2.0';
		//params.id = 0;
    var nethash = (typeof properties.nethash!='undefined'?properties.nethash:'');
    if(method.substr(0,4)=='api/') {
      args = {
          headers:{'Content-Type':'application/json','version':'0.3.0','port':1,'nethash':properties.nethash},
          data:JSON.stringify(params)
      }
      var postresult = restcoin.put(queryurl,args,function(data,response){restaction({processID:processID,data:data});});
    } else {
      args = {
          headers:{'Content-Type':'application/json','version':'0.3.0','port':1,'nethash':properties.nethash},
          data:JSON.stringify({transaction:params})
      }
      var postresult = restcoin.post(queryurl,args,function(data,response){restaction({processID:processID,data:data});});
    }
  } else {
      var postresult = restcoin.get(queryurl,args,function(data,response){restaction({processID:processID,data:data});});
  }
	postresult.on('error', function(err){
    console.log(err);
    scheduler.stopproc(processID,{err:1});
	});
}

function restaction(properties) {
  var data = properties.data;
  if(data.code<0) { var err=1; } else { var err=data['code']; }
  try { data = JSON.parse(data); } catch(e) {}
  scheduler.stopproc(properties.processID,{err:err,data:data});
}
