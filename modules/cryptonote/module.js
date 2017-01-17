// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - cryptonote/module.js
// Module to connect to CryptoNote currencies like Monero/Bytecoin or any of their derivatives

// required libraries in this context
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
	var modulename = 'cryptonote';
	var command = ["status","init"];
	// this module can provide assets (wallet)
	for (var asset in global.hybridd.asset) {
		if(typeof global.hybridd.asset[asset].module != 'undefined' && global.hybridd.asset[asset].module == modulename) {
			// check the status of the connection, and give init feedback
			var processID = scheduler.initproc(0);
			var target = global.hybridd.asset[asset]; target.name = asset;
			var subprocesses = modules.module.cryptonote.main.exec({"processID":processID,"target":target,"command":command});
			subprocesses.push('modules.module.cryptonote.main.post('+JSON.stringify({processID,target,command})+');')
			scheduler.subqueue(processID,subprocesses);
		}
	}
	// this module can provide sources (daemon)
	for (var source in global.hybridd.source) {
		if(typeof global.hybridd.source[source].module != 'undefined' && global.hybridd.source[source].module == modulename) {
			// check the status of the connection, and give init feedback
			var processID = scheduler.initproc(0);
			var target = global.hybridd.source[source]; target.name = source;
			var subprocesses = modules.module.cryptonote.main.exec({"processID":processID,"target":target,"command":command});
			subprocesses.push('modules.module.cryptonote.main.post('+JSON.stringify({processID,target,command})+');')
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
	// this is our link
	var link = 'modules.module.cryptonote.main.link';
	// handle standard cases here, and construct the sequential process list
	switch(properties.command[0]) {
		 case 'status':
			// set up init probe command to check if monerod and simplewallet are responding and connected
			if(type == 'local') {
				var s_target = global.hybridd.source[target.name]; // override target to point to source daemon
					s_target.name = target.name;
				if(typeof properties.command[1] == 'undefined') {	// ignore this during init phase
					subprocesses.push(link+'({"processID":'+JSON.stringify(processID)+',"target":'+JSON.stringify(s_target)+',"command":{"method":"getlastblockheader"}})');
					subprocesses.push('poke("cryptonoted",data)');	// store the resulting data for post-process mixing
				}
				subprocesses.push(link+'({"processID":'+JSON.stringify(processID)+',"target":'+JSON.stringify(s_target)+',"command":{"method":"get_info"}})');
			}
		 break;		 
		 case 'address':
		 	// define the source address/wallet
			var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:'local');
			// if local wallet
			if(type == 'local') {
				command = {"method":"getaddress"};
				subprocesses.push(link+'('+JSON.stringify({processID,target,command})+');');
			} else {
				// if new address wanted TODO!
				if(sourceaddr == 'new') {
					subprocesses.push('stop(1,"Creating address not yet supported!");');
				} else {
					subprocesses.push('stop(1,"Deterministic function for frontend!");');
				// deterministic address(es) listing
				}
			}
		 break;
		 case 'balance':
		 	// define the source address/wallet
			var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:'local');
			// if local wallet
			if(type == 'local') {
				//var target = global.hybridd.asset[asset]; // note we want to use multiple sources later on!
				command = {"method":"getaddress"};
				subprocesses.push(link+'('+JSON.stringify({processID,target,command})+')');
				//subprocesses.push('poke("address",data)');
				// this subprocess is written in expanded notation to handle the previous process data
				subprocesses.push(link+'({"processID":'+JSON.stringify(processID)+',"target":'+JSON.stringify(target)+',"command": {"method":"getbalance","params":data} })');
				//subprocesses.push('if(global.hybridd.proc["'+processID+'.0"].data == "'+String(sourceaddr)+'") { modules.module.cryptonote.main.link('+JSON.stringify({processID,target,command})+'); }');

			// if deterministic wallet
			} else {
				// TODO: is this even possible on Bytecoin/Monero ?
				subprocesses.push('stop(1,"Error: non-local!")');
			}
		 break;
		 case 'transfer':
			var txamount = properties.command[2]*Math.pow(10,factor);
			var targetaddr = properties.command[3];
			var payment_id = functions.randomstring(64,'abcdef1234567890')	// create a random number/lowercase string
			var mixin_cnt = (typeof properties.mixin != 'undefined'?parseInt(properties.mixin):3);
			// if local wallet
			if(type == 'local') {
				// more info: https://www.monerobase.com/Simplewallet#Sending_monero
				// transfer mixin_count target_addr amount payment_id
				// transfer 3 493JYDeY6taJV2bXYsa4vh2kkub7URErJ4B3cN7NKeNG5JFlNr3iTo4jJbS35AxcTgErouA8x8gLo9C2AiBu27i4KFMXXcp 5.32 93af87e91c0f2a14ay0a7198f45a458673d724b9c110d355c9effe81a64de4f7
				var destinations = [{amount:Number(txamount),address:String([targetaddr])}];
				command = {"method":"transfer",
							"params": {
								"destinations": destinations,
								"mixin": mixin_cnt,
								"unlock_time": 0,
								"payment_id":payment_id
							}
				}				
				subprocesses.push(link+'('+JSON.stringify({processID,target,command})+')');
				//subprocesses.push('poke("i","'+payment_id+'")'); // poke payment_id into information field
			} else {
				// TODO: is this even possible on Bytecoin/Monero ?
				subprocesses.push('stop(1,"Error: non-local!")');
			}
		 break;
		 case 'confirm':
			confirms = 10;
		 	subprocesses.push('prog(0,'+confirms+')');
		 	subprocesses.push('poke("i",0)');
		 	subprocesses.push('prog(peek("i"),'+confirms+')');
		 	subprocesses.push('wait(2000)');
		 	subprocesses.push('push({count:peek("i"),total:'+confirms+'})');
		 	subprocesses.push('poke("i",peek("i")+1)');
		 	subprocesses.push('test(peek("i")<'+confirms+',-4)');
		 	subprocesses.push('stop(0,{count:peek("i"),total:'+confirms+'})');
		 	postprocessing = false;
		 break;
		 case 'listtransactions':
			// if local wallet
			if(type == 'local') {
				if(typeof properties.command[1] != 'undefined') { if(properties.command[1] == 'pending') { var transfertype = 'unavailable' } else { var transfertype = 'available'; } } else { var transfertype = 'available'; }
				command = {"method":"incoming_transfers","params":{"transfer_type":"all"}};
				subprocesses.push(link+'('+JSON.stringify({processID,target,command})+');');
			} else {
				subprocesses.push('stop(1,"Deterministic function for frontend!");');
				// deterministic address(es) listing
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
	var posttemp = global.hybridd.proc[parentID].temp;
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
				if (typeof postdata.result != 'undefined') {
					// copy older process data into prevdata for cherry picking
					//if(procinfo[1]>1) { prevdata = global.hybridd.proc[parentID+'.'+(procinfo[1]-2)].data; }
					// nicely cherrypick and reformat status data
					if(typeof postdata.result != 'undefined') {
						var collage = {};
						if(typeof postdata.result.status != 'undefined') { collage.synced = (postdata.result.status=='OK'?1:0); } else { collage.synced = null; }
						if(typeof postdata.result.height != 'undefined') { collage.blocks = postdata.result.height; } else { collage.blocks = null; }
						if(posttemp != null && typeof posttemp.cryptonoted != 'undefined') {
							if(typeof posttemp.cryptonoted.result.block_header.timestamp != 'undefined') { collage.blocktime = posttemp.cryptonoted.result.block_header.timestamp; } else { collage.blocktime = null; }
							if(typeof posttemp.cryptonoted.result.block_header.difficulty != 'undefined') { collage.difficulty = posttemp.cryptonoted.result.block_header.difficulty; } else { collage.difficulty = null; }
							if(typeof posttemp.cryptonoted.result.block_header.major_version != 'undefined' && typeof posttemp.cryptonoted.result.block_header.minor_version != 'undefined') { collage.version = String(posttemp.cryptonoted.result.block_header.major_version+'.'+(typeof posttemp['cryptonoted'].result.block_header.minor_version != 'undefined'?posttemp['cryptonoted'].result.block_header.minor_version:0)); } else { collage.version = null; }
							collage.testmode = null;   //if(typeof postdata.result.running_testnet != 'undefined' && typeof postdata.result.running_testcoin != 'undefined') { collage.testmode = (postdata.result.running_testnet||postdata.result.running_testcoin?1:0); } else { collage.testmode = null; }
						} else { collage.blocktime = null; collage.difficulty = null; collage.version = null; }
						postdata = collage;
					} else { global.hybridd.proc[prevproc].err=1; }
					// on init, report back to stdout
					if(properties.command[1] == 'init') {
						console.log(' [i] module cryptonote: connected to ['+target.name+'] host '+target.host+':'+target.port);
					}
				} else {
					console.log(' [!] module cryptonote: failed connection to ['+target.name+'] host '+target.host+':'+target.port);
					global.hybridd.proc[parentID].err = 1;
				}		
			break;		
			case 'address':
				if(typeof postdata.result != 'undefined') {
					if(typeof postdata.result.address != 'undefined') {
						postdata = postdata.result.address;
						global.hybridd.proc[prevproc].err = 0;
					} else { global.hybridd.proc[prevproc].err = 1; }
				} else { global.hybridd.proc[prevproc].err = 1; }
			break;
			case 'balance':
				// if result is not a number, set the error flag!
				global.hybridd.proc[prevproc].err = 1;
				if(typeof postdata.result != 'undefined') {
					if(typeof postdata.result.balance != 'undefined') {
						global.hybridd.proc[prevproc].err = 0;
						postdata = postdata.result.balance/Math.pow(10,factor);
					}
				}
			break;
			case 'transfer':
				global.hybridd.proc[prevproc].err = 1;
				if(typeof postdata.result != 'undefined') {
					global.hybridd.proc[prevproc].err = 0;
					postdata = functions.clean(postdata.result.tx_hash);
				}
			break;
			case 'listtransactions':
				global.hybridd.proc[prevproc].err = 1;
				if(typeof postdata.result != 'undefined') {
					if(typeof postdata.result.transfers == 'object') {
						global.hybridd.proc[prevproc].err = 0;
						var transactions = [];
						var cnt = 0;
						postdata.result.transfers.forEach(function(entry) {
							transactions.push({
								index:entry.global_index,
								amount:entry.amount/Math.pow(10,factor),
								send:(entry.spent?1:0),
								txid:functions.clean(entry.tx_hash)
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

// data returned by this link is stored in a process superglobal -> global.hybridd.process[processID]
function link(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var target = properties.target;
	var command = properties.command;
	if(DEBUG) { console.log(' [D] module cryptonote: sending REST call to ['+target.name+'] -> '+JSON.stringify(command)); }
	// separate method and arguments
	var mainpath = 'json_rpc';
	var method = command.method;
	// launch the asynchronous rest functions and store result in global.hybridd.proc[processID]
	var options_auth={user:target.user,password:target.pass};
	restcoin = new Client(options_auth);
	var params = command.params;
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
	// DEBUG: console.log('==== '+JSON.stringify(args));
	var postresult = restcoin.post('http://'+target.host+':'+target.port+'/'+mainpath, args,  function(data, response) {
							if(data.code<0) { var err=1; } else { var err=data['code']; }
						});
	postresult.on('error', function(err){
		err = 1;
	});
}
