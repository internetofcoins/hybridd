// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - altcoin/module.js
// Module to connect to CounterParty or any of its derivatives

// required libraries in this context
var Client = require('../../lib/rest').Client;

// exports
exports.init = init;
exports.tick = tick;
exports.exec = exec;
exports.post = post;
exports.stop = stop;
exports.link = link;

// include node-altcoin.js
function init() {
	var modulename = 'counterparty';
	var command = ["status","init"];
	// this module can provide assets
	for (var asset in global.hybridd.asset) {
		if(typeof global.hybridd.asset[asset].module != 'undefined' && global.hybridd.asset[asset].module == modulename) {
			// check the status of the connection
			var processID = scheduler.initproc(0);
			var target = global.hybridd.asset[asset]; target.name = asset;
			var subprocesses = modules.module.counterparty.main.exec({"processID":processID,"target":target,"command":command});
			subprocesses.push('modules.module.counterparty.main.post('+JSON.stringify({processID,target,command})+');')
			scheduler.subqueue(processID,subprocesses);
		}
	}
	// this module can provide sources
	for (var source in global.hybridd.source) {
		if(typeof global.hybridd.source[source].module != 'undefined' && global.hybridd.source[source].module == modulename) {
			// check the status of the connection
			var processID = scheduler.initproc(0);
			var target = global.hybridd.source[source]; target.name = source;
			var subprocesses = modules.module.counterparty.main.exec({"processID":processID,"target":target,"command":command});
			subprocesses.push('modules.module.counterparty.main.post('+JSON.stringify({processID,target,command})+');')
			scheduler.subqueue(processID,subprocesses);
		}
	}
}

// stop function
function stop() {
}

// loop tick called by internal scheduler
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
	// this is our link
	var link = 'modules.module.counterparty.main.link';
	// handle standard cases here, and construct the sequential process list
	switch(properties.command[0]) {
		 case 'status':
			// set up init probe command to check if counterblockd and counterpartyd are responding and connected
			command = ['proxy_to_counterpartyd',{"method":"get_running_info","params":{}}];
			subprocesses.push(link+'('+JSON.stringify({processID,target,command})+');');    // extended version: subprocesses.push('modules.module.counterparty.main.link({"processID":'+s_processID+',"target":'+s_target+',"command":'+JSON.stringify(command)+'});');
		 break;
		 case 'address':
		 	// define the source address/wallet
			var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:'local');
			// if local wallet
			if(sourceaddr == 'local') {
				// TODO: WHAT IS NEEDED IS TO GET THE LOCAL BITCOIN WALLET ADDRESS 
				//       IF AVAILABLE, AND USE IT TO CHECK ON THE XCP ADDRESS!
				subprocesses.push('stop(0,"Not yet supported!")');
			} else {
				// if new address wanted
				if(sourceaddr == 'new') {
					subprocesses.push('stop(1,"TODO: Function still to be implemented!");');
				} else {
					subprocesses.push('stop(0,"Not yet supported!")');
				// deterministic address(es) listing
				}
			}
		 break;		 
		 case 'balance':
		 	// define the source address/wallet
			var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:'local');
			// TODO: perhaps try method  is_ready  as well? and  get_chain_address_info / get_normalized_balances  for more info? 
			//command[0] = 'get_balances'; command[1] = {"filters":{"field":"address","op":"==","value":"14qqz8xpzzEtj6zLs3M1iASP7T4mj687yq"}};
			var asset = String(target.name).toUpperCase();
			// if local wallet
			if(sourceaddr == 'local') {
				// TODO: WHAT IS NEEDED IS TO GET THE LOCAL BITCOIN WALLET ADDRESS 
				//       IF AVAILABLE, AND USE IT TO CHECK ON LOCAL XCP FUNDS!
				//var target = global.hybridd.asset[asset]; // note we want to use multiple sources later on!
				//command = ['get_address'];
				//subprocesses.push(link+'('+JSON.stringify({processID,target,command})+');');
				// this subprocess is written in expanded notation to handle the previous process data
				//subprocesses.push(link+'({"processID":'+JSON.stringify(processID)+',"target":'+JSON.stringify(target)+',"command":[\'proxy_to_counterpartyd\',{"method":"get_balances","params": {"filters":[{"field":"address","op":"==","value":lastdata},{"field":"asset","op":"==","value":"'+asset+'"}]} }]});');
				subprocesses.push('stop(1,"N/A");');
			} else {
				// if deterministic wallet
				command = ['proxy_to_counterpartyd',{"method":"get_balances","params": {"filters":[{"field":"address","op":"==","value":sourceaddr},{"field":"asset","op":"==","value":asset}]} }];
				subprocesses.push(link+'('+JSON.stringify({processID,target,source,command})+');');
			}
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
	//var posttemp = global.hybridd.proc[parentID].temp;
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
				//if (typeof global.hybridd.proc[prevproc].data.result != 'undefined') {
				// nicely cherrypick and reformat status data
				if(typeof postdata.result != 'undefined') {
					var collage = {};
					if(typeof postdata.result.db_caught_up != 'undefined') { collage.synced = (postdata.result.db_caught_up?1:0); } else { collage.synced = null; }
					if(typeof postdata.result.bitcoin_block_count != 'undefined') { collage.blocks = postdata.result.bitcoin_block_count; } else { collage.blocks = null; }
					if(typeof postdata.result.last_block != 'undefined') {
						 if(typeof postdata.result.last_block.block_time != 'undefined') { collage.blocktime = postdata.result.last_block.block_time; } else { collage.blocktime = null; }
						 if(typeof postdata.result.last_block.difficulty != 'undefined') { collage.difficulty = postdata.result.last_block.difficulty; } else { collage.difficulty = null; }
					} else { collage.blocktime = null; collage.difficulty = null; }
					if(typeof postdata.result.running_testnet != 'undefined' && typeof postdata.result.running_testcoin != 'undefined') { collage.testmode = (postdata.result.running_testnet||postdata.result.running_testcoin?1:0); } else { collage.testmode = null; }
					if(typeof postdata.result.version_major != 'undefined' && typeof postdata.result.version_minor != 'undefined') { collage.version = String(postdata.result.version_major+'.'+(typeof postdata.result.version_minor != 'undefined'?postdata.result.version_minor:0)); } else { collage.version = null; }
					postdata = collage;
					// on init, report back to stdout
					if(properties.command[1] == 'init') {
						console.log(' [i] module counterparty: connected to ['+target.name+'] host '+target.host+':'+target.port);
					}
				} else {
					console.log(' [!] module counterparty: failed connection to ['+target.name+'] host '+target.host+':'+target.port);
					global.hybridd.proc[parentID].err = 1;
				}		
			break;
			case 'balance':
				global.hybridd.proc[prevproc].err=1;
				if (postdata && typeof postdata.result != 'undefined') {
					if (typeof postdata.result[0] != 'undefined') {
						if (typeof postdata.result[0].quantity != 'undefined') {
							postdata = String(postdata.result[0].quantity);
							global.hybridd.proc[prevproc].err=0;
						}
					}
				}
			break;
			default:
				success = false;		
		}
	}
	// default is to transfer the datafield of the last subprocess to the main process
	if (success && !global.hybridd.proc[prevproc].err && typeof postdata != 'undefined') {
		// TODO: here we only get the balance from the 1st visible address!
		global.hybridd.proc[parentID].data = postdata;
		if(DEBUG) { console.log(' [D] sending postprocessing data to parent '+parentID); }
	} else {
		if(DEBUG) { console.log(' [D] error in '+prevproc+' during postprocessing for '+parentID); }
		global.hybridd.proc[parentID].data = null;
		global.hybridd.proc[parentID].err = 1;
	}
	global.hybridd.proc[processID].stopped=Date.now();
	global.hybridd.proc[processID].progress=1;
}

// data returned by this connector is stored in a process superglobal -> global.hybridd.process[processID]
function link(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var target = properties.target;
	var command = properties.command;
	if(DEBUG) { console.log(' [D] module counterparty: sending REST call to ['+target.name+'] -> '+JSON.stringify(command)); }
	// separate method and arguments
	if(typeof target.path == 'undefined') { target.path = 'api'; }
	var mainpath = '/'+target.path;
	var args = {};
	// separate method and arguments
	// launch the asynchronous rest functions and store result in global.hybridd.proc[processID]
	var queryurl = target.host+':'+target.port+mainpath;
	if(DEBUG) { console.log(' [D] query: '+queryurl); }
	
	if(typeof target.user != 'undefined' && typeof target.pass != 'undefined') {
		var options_auth={user:target.user,password:target.pass};
		restcoin = new Client(options_auth);
	} else { restcoin = new Client(); }
	var method = command.shift();
	var params = command.shift();
	// validate the JSON data with a regex after the REST method path
	var args = {
		  data: {
				  "method": method,
				  "params": params,
				  "jsonrpc": "2.0",
				  "id": 0
				},
		headers:{"Content-Type": "application/json"} 
	}
	//if(DEBUG) { console.log(' [D] ARGS: '+JSON.stringify(args)); }
	var postresult = restcoin.post(queryurl, args,  function(data, response) {
							if(data.code<0) { var err=1; } else { var err=data['code']; }
              scheduler.stopproc(processID,{err:err,data:data});
						});
	postresult.on('error', function(err){
    scheduler.stopproc(processID,{err:1});
	});
}
