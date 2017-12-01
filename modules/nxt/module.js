// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - nxt/module.js
// Module to connect to NXT or any of its derivatives

// required libraries in this context
var fs = require('fs');
var Client = require('../../lib/rest').Client;
var functions = require('../../lib/functions');

// exports
exports.init = init;
exports.tick = tick;
exports.exec = exec;
exports.stop = stop;
exports.link = link;
exports.post = post;

// initialization function
function init() {
  modules.initexec('nxt',['init']);
}

// stop function
function stop() {
}

// scheduled ticker function
function tick(properties) {
}

// standard functions of an asset store results in a process superglobal -> global.hybridd.process[processID]
// child processes are waited on, and the parent process is then updated by the postprocess() function
// http://docs.nxt.org/en/latest/protocol.html
function exec(properties) {
	// decode our serialized properties
	var processID = properties.processID;
	var target = properties.target;
  var base = target.symbol.split('.')[0];     // in case of token fallback to base asset
	var mode  = target.mode;
	var factor = (typeof target.factor != 'undefined'?target.factor:null);
	var fee = (typeof target.fee != 'undefined'?target.fee:1);
	var subprocesses = [];	
	// set request to what command we are performing
	global.hybridd.proc[processID].request = properties.command;
  // define the source address/wallet
  var sourceaddr = (typeof properties.command[1] != 'undefined'?properties.command[1]:false);
	// handle standard cases here, and construct the sequential process list
	switch(properties.command[0]) {
		case 'init':
      if(!isToken(target.symbol)) {
        // set up REST API connection
        if(typeof target.user != 'undefined' && typeof target.pass != 'undefined') {
          var options_auth={user:target.user,password:target.pass};
          global.hybridd.asset[target.symbol].link = new Client(options_auth);
        } else { global.hybridd.asset[target.symbol].link = new Client(); }

        if(typeof global.hybridd.asset[target.symbol].fee==='undefined') {
          global.hybridd.asset[target.symbol].fee = 1;
        }

        // initialize deterministic code for smart contract calls?? --> NEEDED FOR NXT???
        //var dcode = String(fs.readFileSync('../modules/deterministic/nxt/deterministic.js.lzma'));
        //global.hybridd.asset[target.symbol].dcode = functions.activate( LZString.decompressFromEncodedURIComponent(dcode) );
        
        //subprocesses.push('func("nxt","post",{target:'+jstr(target)+',command:["init"],data:data,data})');

        // ?requestType=getBlockchainStatus&random=0.07594151768324142
        
        // set up init probe command to check if RPC and block explorer are responding and connected
        subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["getBlockchainStatus"]})');
        subprocesses.push('pass( (data !== null && typeof data.blockchainState=="string"?1:0) )');      
        subprocesses.push('logs(1,"module nxt: "+(data?"connected":"failed connection")+" to ['+target.symbol+'] host '+target.host+'")');      
      }
		break;
		case 'X status':
			// set up init probe command to check if Altcoin RPC is responding and connected      
			//subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["eth_protocolVersion"]})');
			//subprocesses.push('func("nxt","post",{target:'+jstr(target)+',command:["status"],data:data})');
      
		break;
		case 'factor':
      // directly return factor, post-processing not required!
      subprocesses.push('stop(0,"'+factor+'")');
		break;
		case 'fee':
      // directly return fee, post-processing not required!
      if(!isToken(target.symbol)) {
        var fee = (typeof target.fee!='undefined'?target.fee:null);
      } else {
        var fee = (typeof global.hybridd.asset[base].fee != 'undefined'?global.hybridd.asset[base].fee:null);
        factor = (typeof global.hybridd.asset[base].factor != 'undefined'?global.hybridd.asset[base].factor:null);
      }
      subprocesses.push('stop(('+jstr(fee)+'!=null && '+jstr(factor)+'!=null?0:1),'+(fee!=null && factor!=null?'"'+padFloat(fee,factor)+'"':null)+')');
		break;
		case 'balance':
      if(sourceaddr) {
        if(!isToken(target.symbol)) {
          subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["getBalance",["account='+sourceaddr+'"]]})'); // send balance query
          subprocesses.push('stop((data!==null && ((typeof data.errorCode!=="undefined" && data.errorCode==5)|| typeof data.unconfirmedBalanceNQT!=="undefined")?0:1),(data!==null && typeof data.unconfirmedBalanceNQT!=="undefined"? padFloat( fromInt(data.unconfirmedBalanceNQT,'+factor+'),'+factor+') : ((data!==null && (typeof data.errorCode!=="undefined" && data.errorCode==5))?0:null) ))');
        } else {
          subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["getAccount",["account='+sourceaddr+'","includeAssets=true","includeCurrencies=true"]]})'); // send balance query
          subprocesses.push('func("nxt","post",{target:'+jstr(target)+',command:["balance"],data:data})');
        }
      } else {
        subprocesses.push('stop(1,"Error: missing address!")');
      }
		break;
		case 'push':
      var deterministic_script = (typeof properties.command[1] != 'undefined'?properties.command[1]:false);
      if(deterministic_script) {
        subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["broadcastTransaction",["transactionBytes='+deterministic_script+'"]]})');
        // returns: { "requestProcessingTime": 4, "fullHash": "3a304584f20cf3d2cbbdd9698ff9a166427005ab98fbe9ca4ad6253651ee81f1", "transaction": "15200507403046301754" }
        subprocesses.push('stop((typeof data.transaction==="undefined"?1:0),(typeof data.transaction==="undefined"?null:data.transaction))');
      } else {
        subprocesses.push('stop(1,"Missing or badly formed deterministic transaction!")');
      }
    break;
    // NXT has no concept of unspents, instead we have to prepare an unsigned transaction here
    // this is then returned to the deterministic library in the browser for signing, and pushing (broadcast)
		case 'unspent':
      var amount = Number(properties.command[2]);
      var targetaddr = properties.command[3];
      var publicKey = properties.command[4];
      if(sourceaddr) {
        if(typeof amount==='undefined' || !amount) {
          subprocesses.push('stop(1,"Error: please specify an amount above zero!")');
        } else {
          if(targetaddr) {
            if(publicKey) {
              publicKey = '"publicKey='+publicKey+'"';
            } else {
              publicKey = '"publicKey="+data.publicKey';
              subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["getAccount",["account='+sourceaddr+'"]]})'); // send balance query
              subprocesses.push('test((typeof data.publicKey!=="undefined" && data.publicKey),2,1,data)');
              subprocesses.push('stop(1,"Error: missing NXT public key!")');
            }
            if(!isToken(target.symbol)) {
              amount -= fee;  // with NXT the unspent function is a transaction preparation, so must subtract the fee
              subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["sendMoney",["recipient='+targetaddr+'",'+publicKey+',"amountNQT='+toInt(amount,factor)+'","feeNQT='+toInt(fee,factor)+'","deadline=300","doNotSign=1","broadcast=false"] ]})');
            } else {
              var fee = (typeof global.hybridd.asset[base].fee != 'undefined'?global.hybridd.asset[base].fee:null);
              var feefactor = (typeof global.hybridd.asset[base].factor != 'undefined'?global.hybridd.asset[base].factor:null);
              amount -= fee;  // with NXT the unspent function is a transaction preparation, so must subtract the fee
              subprocesses.push('func("nxt","link",{target:'+jstr(target)+',command:["transferAsset",["recipient='+targetaddr+'","asset='+target.contract+'",'+publicKey+',"quantityQNT='+toInt(amount,factor)+'","feeNQT='+toInt(fee,feefactor)+'","deadline=300","doNotSign=1","broadcast=false"] ]})');
            }
            subprocesses.push('stop((typeof data.errorCode==="undefined"?0:data.errorCode),(typeof data.errorCode==="undefined"?data:null))');
          } else {
            subprocesses.push('stop(1,"Error: missing target address!")');
          }
        }
      } else {
        subprocesses.push('stop(1,"Error: missing source address!")');
      }
    break;
		case 'contract':
      // directly return factor, post-processing not required!
      var contract = (typeof target.contract !== 'undefined'?target.contract:null);
      subprocesses.push('stop(0,"'+contract+'")');
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
      break;
			case 'status':
        // nicely cherrypick and reformat status data
        var collage = {};
        collage.module = 'nxt';
        collage.synced = null;
        collage.blocks = null;
        collage.fee = null;
        collage.supply = null;
        collage.difficulty = null;
        collage.testmode = null;
        collage.version = (typeof postdata.result==='string' ? postdata.result : null);
        postdata = collage;
			break;
      case 'balance':
        var balance = 0;
        if(typeof postdata.unconfirmedAssetBalances!=='undefined' && Array.isArray(postdata.unconfirmedAssetBalances)) {
          //subprocesses.push('stop((data===null || typeof data.assetBalances==="undefined"?1:0),(data===null || typeof data.assetBalances==="undefined"?data.assetBalances:[]))');
          for (var i = 0; i < postdata.unconfirmedAssetBalances.length; i++) {
            if(postdata.unconfirmedAssetBalances[i].asset === target.contract) {
              balance+=postdata.assetBalances[i].balanceQNT;
            }
          }
        }
        postdata = padFloat(fromInt(balance,factor),factor);
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
  var target = properties.target;
  var base = target.symbol.split('.')[0];     // in case of token fallback to base asset
  // decode our serialized properties
  var processID = properties.processID;
  var command = properties.command;
  if(DEBUG) { console.log(' [D] module nxt: sending REST call for ['+target.symbol+'] -> '+JSON.stringify(command)); }
  // separate method and arguments
  var method = command.shift();
  var params = command.shift();
  // launch the asynchronous rest functions and store result in global.hybridd.proc[processID]
  // do a GET or PUT/POST based on the command input
  var type;
  if(typeof params==='object') {
    type = 'POST';
    var upath = '?requestType='+method
    var args = {
        headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}, 
        data:params.join('&')+'&random='+Math.random(),
        path:upath
    }
  } else {
    type = 'GET';
    var upath = '?requestType='+method+(typeof params==='undefined'?'':'&'+params)+'&random='+Math.random();
    var args = {
        headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}, 
        path:upath
    }
  }
  // construct the APIqueue object
  APIqueue.add({ 'method':type,
                 'link':'asset["'+base+'"]',  // make sure APIqueue can use initialized API link
                 'host':(typeof target.host!=='undefined'?target.host:global.hybridd.asset[base].host),  // in case of token fallback to base asset hostname
                 'args':args,
                 'throttle':(typeof target.throttle!=='undefined'?target.throttle:global.hybridd.asset[base].throttle),  // in case of token fallback to base asset throttle
                 'pid':processID,
                 'target':target.symbol });
}
