// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - blockexplorer/module.js
// Module to connect to Block explorers

// Supported block explorer systems and their API's:
//  Insight:            https://blockexplorer.com/api-ref
//  Blockr:             http://blockr.io/documentation/api
//  ABE (open source):  http://explorer.litecoin.net/q
// Todo:
//  Blockchain.info:    https://blockchain.info/api/blockchain_api

// required libraries in this context
var Client = require('../../lib/rest').Client;
var http = require('http');

// exports
exports.init = init;
exports.tick = tick;
exports.exec = exec;
exports.stop = stop;
exports.link = link;
exports.post = post;

// initialization function
function init() {
	modules.initexec('blockexplorer',["init"]);
}

// stop function
function stop() {
}

// loop tick called by internal scheduler
function tick(properties) {
}

// standard functions of an asset store results in a process superglobal -> global.hybridd.process[processID]
// child processes are waited on, and the parent process is then updated by the postprocess() function
// standard functions of an asset store results in a process superglobal -> global.hybridd.process[processID]
// child processes are waited on, and the parent process is then updated by the postprocess() function
// http://docs.electrum.org/en/latest/protocol.html
function exec(properties) {
	// decode our serialized properties
	var processID = properties.processID;
  var target = properties.target;
	var mode  = (typeof target.mode!='undefined'?target.mode:null);
	var type  = (typeof target.type!='undefined'?target.type:null);
	var factor = (typeof target.factor != 'undefined'?target.factor:8);
  var command = properties.command;
	var subprocesses = [];	
	// set request to what command we are performing
	global.hybridd.proc[processID].request = properties.command;
	// handle standard cases here, and construct the sequential process list
	switch(type) {
    case 'blockr':
      switch(command[0]) {
        case 'init':
          subprocesses.push('stop(1,"NOT YET SUPPORTED!")');
        break;
        case 'balance':
          if(typeof command[1]!='undefined') {
            subprocesses.push('func("blockexplorer","link",{target:'+str(target)+',command:["address","balance","'+command[1]+'?confirmations=0"]})');
            subprocesses.push('test((typeof data.data!="undefined" && typeof data.data.balance!="undefined" && !isNaN(data.data.balance)),2,1,data)')
            subprocesses.push('stop(1,null)');
            subprocesses.push('stop(0, padFloat(data.data.balance,'+factor+') )');            
          } else {
            subprocesses.push('stop(1,"Please specify an address!")');
          }
        break;
        case 'unspent':
          // example: http://btc.blockr.io/api/v1/address/unspent/
          if(typeof command[1]!='undefined') {
            subprocesses.push('func("blockexplorer","link",{target:'+str(target)+',command:["address","unspent",'+str(command[1])+']})');
            subprocesses.push('func("blockexplorer","post",{target:'+str(target)+',command:'+str(command)+',data:data})');
          } else {
            subprocesses.push('stop(1,"Please specify an address!")');
          }
        break;
        default:
          subprocesses.push('stop(1,"Source function not supported!")');
      }
    break;
    case 'insight':
      switch(properties.command[0]) {
        case 'init':
          subprocesses.push('stop(1,"NOT YET SUPPORTED!")');
        break;
        case 'balance':
            subprocesses.push('func("blockexplorer","link",{target:'+str(target)+',command:["addr",'+str(command[1])+',"balance"]})');
            subprocesses.push('func("blockexplorer","link",{target:'+str(target)+',command:["addr",'+str(command[1])+',"unconfirmedBalance"]})');
            subprocesses.push('coll(2)');            
            subprocesses.push('stop( (isNaN(data[0])||isNaN(data[1])?1:0), fromInt((data[0]+data[1]),'+factor+') )');
        break;
        case 'unspent':
          // example: https://blockexplorer.com/api/addr/[:addr]/utxo
          if(typeof command[1]!='undefined') {
            subprocesses.push('func("blockexplorer","link",{target:'+str(target)+',command:["addr",'+str(command[1])+',"utxo"]})');
            subprocesses.push('func("blockexplorer","post",{target:'+str(target)+',command:'+str(command)+',data:data})');
          } else {
            subprocesses.push('stop(1,"Please specify an address!")');
          }
        break;
        default:
          subprocesses.push('stop(1,"Source function not supported!")');
      }
    break;
    case 'abe':
      switch(properties.command[0]) {
        case 'init':
          subprocesses.push('stop(1,"NOT YET SUPPORTED!")');
        break;
        case 'balance':
          subprocesses.push('stop(1,"NOT YET SUPPORTED!")');
          /*
          request = 'POST';
          if(command.shift()=='balance') {	// rewrite command for literal link
            actionpath = 'addressbalance/'+command.shift();
          }*/
        break;
        case 'unspent':
          // example: http://explorer.litecoin.net/unspent/LYmpJZm1WrP5FSnxwkV2TTo5SkAF4Eha31
          if(typeof command[1]!='undefined') {
            subprocesses.push('func("blockexplorer","link",{target:'+str(target)+',command:["unspent",'+str(command[1])+'],nopath:true})');
            subprocesses.push('func("blockexplorer","post",{target:'+str(target)+',command:'+str(command)+',data:data})');
          } else {
            subprocesses.push('stop(1,"Please specify an address!")');
          }
        break;
        default:
          subprocesses.push('stop(1,"Source function not supported!")');
      }
    break;
		default:
		 	subprocesses.push('stop(1,"Configured source type is not supported!")');
	}
  // fire the Qrtz-language program into the subprocess queue
  scheduler.fire(processID,subprocesses);  
}

// standard function for postprocessing the data of a sequential set of instructions
function post(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var target = properties.target;
	var type  = target.type;
	var factor = (typeof target.factor != 'undefined'?target.factor:8);
	var postdata = properties.data;
	// DEPRECATED? - var factor = (typeof properties.factor != 'undefined'?properties.factor:12);
	// set data to what command we are performing
	global.hybridd.proc[processID].data = properties.command;
	// handle the command
  var result = null;
  var success = true;
  switch(type) {
    case 'blockr':
      switch(properties.command[0]) {
        case 'unspent':
          if(typeof postdata.data!='undefined' && typeof postdata.data.unspent=='object') {
            postdata = postdata.data.unspent;
            result = [];
            for (var i in postdata) {
              result.push({amount:padFloat(postdata[i].amount,factor),txid:postdata[i].tx,txn:postdata[i].n});
            }
          } else { success = false;	}
        break;
        default:
          success = false;		
      }
    break;
    case 'insight':
      switch(properties.command[0]) {
        case 'unspent':
          if(postdata!=null) {
            result = [];
            for (var i in postdata) {
              result.push({amount:padFloat(postdata[i].amount,factor),txid:postdata[i].txid,txn:postdata[i].vout});
            }
          } else { success = false; }
        break;
        default:
          success = false;
      }
    break;
    case 'abe':
      switch(properties.command[0]) {
        case 'unspent':
          if(typeof postdata!='undefined' && typeof postdata.unspent_outputs=='object') {
            postdata = postdata.unspent_outputs;
            result = [];
            for (var i in postdata) {
              result.push({amount:fromInt(postdata[i].value,factor),txid:postdata[i].tx_hash,txn:postdata[i].tx_output_n});
            }
          } else { success = false;	}
        break;
        default:
          success = false;
      }
    break;
    default:
      success = false;		
  }
  // handle sorting and filtering
  global.hybridd.proc[processID].progress = 0.5;
  switch(properties.command[0]) {
    case 'unspent':
      if(typeof properties.command[2]!='undefined') {
        var amount = toInt(properties.command[2],factor);
        if(amount.greaterThan(0)) {
          result = functions.sortArrayByObjKey(result,"amount",true);
          global.hybridd.proc[processID].progress = 0.75;
          unspentscnt = toInt(0,factor);
          var usedinputs = [];
          var unspents = [];
          // pull together the smaller amounts
          for (var i in result) {
            entry = toInt(result[i].amount,factor)
            if(unspentscnt.lessThan(amount) && amount.greaterThanOrEqualTo(entry)) {
              unspents.push(result[i]);
              usedinputs.push(i);
              unspentscnt = unspentscnt.plus( entry );
            }
          }
          // add up the bigger amounts
          if(unspentscnt.minus(amount)<0) {
            for (var i in result) {
              entry = toInt(result[i].amount,factor)
              if(unspentscnt.lessThan(amount) && amount.lessThanOrEqualTo(entry)) {
                unspents.push(result[i]);
                usedinputs.push(i);
                unspentscnt = unspentscnt.plus( entry );
              }
            }
          }
          var unspentsout = unspentscnt.minus(amount);
          result = {unspents:unspents,change:fromInt((unspentsout>0?unspentsout:0),factor)}
        }
      }
    break;
  }
  // stop and send data to parent
  scheduler.stop(processID,{err:(success?0:1),data:result});
}

function link(properties) {
	var processID = properties.processID;
	var target = properties.target;
	var mode = target.mode;
	var type = target.type;
  var request = (properties.request!='undefined' ?properties.request:'GET');
  var nopath = (properties.nopath!='undefined' && properties.nopath?true:false);
	var command = properties.command;
  console.log(' [.] module blockexplorer: sending '+mode+' query for ['+target.name+'] -> '+command.join(' '));
	var queryurl = target.host+':'+target.port+'/';
  if(!nopath) {
    queryurl = queryurl + (typeof target.path != 'undefined' && target.path?target.path+'/':'');
  }
	if(DEBUG) { console.log(' [D] query to: '+queryurl); }
		// WITH AUTH: launch the asynchronous rest functions and store result in global.hybridd.proc[processID]
	//var options_auth={user:global.hybridd.asset[asset].user,password:global.hybridd.asset[asset].pass};
	//restapi = new Client(options_auth);
	// WITHOUT AUTH: launch the asynchronous rest functions and store result in global.hybridd.proc[processID]
	restapi = new Client();  
  if(request=='POST') {
    // validate the JSON data with a regex after the REST method path
    var args = {
        data: {
            "method": null,
            "params": functions.JSONvalid(command),
            "jsonrpc": "2.0",
            "id": 0
          },
        headers:{"Content-Type": "application/json"} 
    }
    if(DEBUG) { console.log(' [D] POST query: '+queryurl); }
    var postresult = restapi.post(queryurl, args,  function(data, response) {
                var result = validate({type:type,data:data});								
                // if(DEBUG) { console.log(' [D] result data: '+data); }
                // stop and send data to parent
                scheduler.stop(processID,{err:result.err,data:result.data});                
             });
  } else {
    // validate the JSON data with a regex after the REST method path
    var	args = { headers:{"Content-Type": "text/html"} }
    queryurl = queryurl+command.join('/'); //.replace(/'/gi,'"');
    if(DEBUG) { console.log(' [D] GET query: '+queryurl); }
    var postresult = restapi.get(queryurl, args,  function(data, response) {
                var result = validate({type:type,data:data});								
                // if(DEBUG) { console.log(' [D] result data: '+data); }
                // stop and send data to parent
                scheduler.stop(processID,{err:result.err,data:result.data});                
             });
  }
  postresult.on('error', function(err){
    // stop and send data to parent
    scheduler.stop(processID,{err:1,data:'Rest API error!'});
    if(DEBUG) { console.log(' [D] result error: '+err); }
  });  
}

function validate(properties) {
  type = properties.type;
  data = properties.data;
  var err=1;
  switch(type) {
    case 'blockr':
      if(typeof data.status!='undefined' && data.status=='success') { err=0; }
    break;
    case 'insight':
      if(typeof data!='undefined' && typeof data=='string') {
        try { data = JSON.parse(data); } catch(e) { data = null; }
        if(typeof data=='array' && data.length>0) { err=0; }
      }
    break;
    case 'abe':
      if(typeof data!='undefined') {
        if(typeof data=='string' && data.substr(0,32).indexOf("<html")>-1) {
          err=1;
        } else {
          try { data = JSON.parse(data); } catch(e) { data = null; }
          if(typeof data=='object') { err=0; }
        }
      }
    break;
  }
  return {err:err,data:data};
}

// helper functions
function authconnect(properties) {
  var source = properties.source;
  var key = properties.key;
  // TODO
	if (module.busy) {
		// only allow one REST connection at a time
		setTimeout(function(){authconnect(source,key)},3000);
	} else {
		module.busy = true;			
		//if(global.hybridd.source[source].module == 'blockexplorerapi') {
		//}

		// configure basic http auth for every request
		var blckexpl = new Client();
		var args = {
			  data: {},
			headers:{"Content-Type": "application/text"}
		}
		var startdate = new Date();
		var postresult = blckexpl.get(global.hybridd.source[source][key].host+':'+global.hybridd.source[source][key].port+global.hybridd.source[source][key].path+'/getdifficulty', args,  function(data, response) {
								var alivedate = new Date();
								if(!global.hybridd.source[source][key].ping) { console.log(' [i] module blockexplorerapi: connected to ['+source+']['+key+'] host '+global.hybridd.source[source][key].host+':'+global.hybridd.source[source][key].port); }
								global.hybridd.source[source][key].ping = alivedate-startdate;
								global.hybridd.source[source][key].alive = functions.timestamp(alivedate);
								module.busy=false;
							});
		postresult.on('error', function(err){
			console.log(' [!] module blockexplorerapi: failed connection to ['+source+']['+key+'] host '+global.hybridd.source[source][key].host+':'+global.hybridd.source[source][key].port);
			global.hybridd.source[source][key].ping = false;
			module.busy=false;
		});
	}
}
