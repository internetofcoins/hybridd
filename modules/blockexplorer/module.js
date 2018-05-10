// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - blockexplorer/module.js
// Module to connect to Block explorers

// Supported block explorer systems and their API's:
//  Insight:            https://blockexplorer.com/api-ref
//  Blockr:             http://blockr.io/documentation/api  NB blockr has been depreciated, left here for reference
//  ABE (open source):  http://explorer.litecoin.net/q

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
  var target = {};

  if(typeof properties.target.symbol !== 'undefined'){ // If no explicit target properties are passed, retrieve them using symbol
    var candidates = []; // List of block explorer sources that can handle this symbol
    for(var id in global.hybridd.source){ //find the block explorer sources that can handle this symbol
      if(id.split('.')[1]===properties.target.symbol){
        candidates.push(global.hybridd.source[id]);
      }
    }
    if(candidates.length){
      target = candidates[Math.floor((Math.random() * candidates.length))]; // Choose random candidate TODO sort based on a scoring
    }
  }

  Object.assign(target, properties.target); // Overwrite candidate properties with explicitly defined target properties

  var mode  = (typeof target.mode!=='undefined'?target.mode:null);
  var factor = (typeof target.factor !== 'undefined'?target.factor:8);
  var command = properties.command;
  var subprocesses = [];
  // set request to what command we are performing
  global.hybridd.proc[processID].request = properties.command;
  // initialization
  if(command[0]==='init') {
    // set up REST API connection
    if(typeof target.user !== 'undefined' && typeof target.pass !== 'undefined') {
      var options_auth={user:target.user,password:target.pass};
      global.hybridd.source[target.id].link = new Client(options_auth);
    } else { global.hybridd.source[target.id].link = new Client(); }
    subprocesses.push('logs(1,"module blockexplorer: initialized '+target.id+'")');
  } else {
    // handle standard cases here, and construct the sequential process list
    switch(mode.split('.')[1]) {
    case 'blockr': // NB blockr has been depreciated, left here for reference
      switch(command[0]) {
      case 'balance':
        if(typeof command[1]!=='undefined') {
          subprocesses.push('func("blockexplorer","link",{target:'+jstr(target)+',command:["/address/balance/'+command[1]+'?confirmations=0"]})');
          subprocesses.push('test((typeof data.data!=="undefined" && typeof data.data.balance!=="undefined" && !isNaN(data.data.balance)),2,1,data)')
          subprocesses.push('stop(1,null)');
          subprocesses.push('stop(0, padFloat(data.data.balance,'+factor+') )');
        } else {
          subprocesses.push('stop(1,"Please specify an address!")');
        }
        break;
      case 'unspent':
        // example: http://btc.blockr.io/api/v1/address/unspent/
        if(typeof command[1]!=='undefined') {
          subprocesses.push('func("blockexplorer","link",{target:'+jstr(target)+',command:["/address/unspent/'+command[1]+'"]})');
          subprocesses.push('func("blockexplorer","post",{target:'+jstr(target)+',command:'+jstr(command)+',data:data})');
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
      case 'balance':
        subprocesses.push('func("blockexplorer","link",{target:'+jstr(target)+',command:["/addr/'+command[1]+'/balance"]})');
        subprocesses.push('func("blockexplorer","link",{target:'+jstr(target)+',command:["/addr/'+command[1]+'/unconfirmedBalance"]})');
        subprocesses.push('coll(2)');
        subprocesses.push('stop( (isNaN(data[0])||isNaN(data[1])?1:0), fromInt((data[0]+data[1]),'+factor+') )');
        break;
      case 'unspent':
        // example: https://blockexplorer.com/api/addr/[:addr]/utxo
        if(typeof command[1]!=='undefined') {
          subprocesses.push('func("blockexplorer","link",{target:'+jstr(target)+',command:["/addr/'+command[1]+'/utxo"]})');
          subprocesses.push('func("blockexplorer","post",{target:'+jstr(target)+',command:'+jstr(command)+',data:data})');
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
      case 'balance':
        subprocesses.push('stop(1,"NOT YET SUPPORTED!")');
        /*
          request = 'POST';
          if(command.shift()==='balance') {	// rewrite command for literal link
          actionpath = 'addressbalance/'+command.shift();
          }*/
        break;
      case 'unspent':
        // example: http://explorer.litecoin.net/unspent/LYmpJZm1WrP5FSnxwkV2TTo5SkAF4Eha31
        if(typeof command[1]!=='undefined') {
          subprocesses.push('func("blockexplorer","link",{target:'+jstr(target)+',command:["/unspent/'+command[1]+'"]})');
          subprocesses.push('func("blockexplorer","post",{target:'+jstr(target)+',command:'+jstr(command)+',data:data})');
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
  }
  // fire the Qrtz-language program into the subprocess queue
  scheduler.fire(processID,subprocesses);
}

// standard function for postprocessing the data of a sequential set of instructions
function post(properties) {
  // decode our serialized properties
  var processID = properties.processID;
  var target = properties.target;
  var mode  = target.mode;
  var factor = (typeof target.factor !== 'undefined'?target.factor:8);
  // first do a rough validation of the data
  var postdata = properties.data;
  // set data to what command we are performing
  global.hybridd.proc[processID].data = properties.command;
  // handle the command
  var result = null;
  var success = true;
  switch(mode.split('.')[1]) {
  case 'blockr': // NB blockr has been depreciated, left here for reference
    switch(properties.command[0]) {
    case 'unspent':
      if(typeof postdata.data!=='undefined' && typeof postdata.data.unspent==='object') {
        postdata = postdata.data.unspent;
        result = [];
        for (var i in postdata) {
          //TODO script is missing
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
      if(typeof postdata!=='undefined' && postdata!==null) {
        result = [];
        for (var i in postdata) {
          result.push({script:postdata[i].scriptPubKey,amount:padFloat(postdata[i].amount,factor),txid:postdata[i].txid,txn:postdata[i].vout});
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
      if(typeof postdata!=='undefined' && postdata!==null && typeof postdata.unspent_outputs==='object') {
        postdata = postdata.unspent_outputs;
        result = [];
        for (var i in postdata) {
          result.push({script:postdata[i].script,amount:fromInt(postdata[i].value,factor),txid:postdata[i].tx_hash,txn:postdata[i].tx_output_n});
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
    if(typeof properties.command[2]!=='undefined') {
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
        result = {unspents:unspents,change:fromInt((unspentsout>0?unspentsout:0),factor)};
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
  var type = 'GET'; // for now everything is GET
  //var nopath = (properties.nopath!=='undefined' && properties.nopath?true:false);
  var command = properties.command;
  console.log(' [.] module blockexplorer: sending query ['+target.id+'] -> '+command.join(' '));

  var upath = command.shift();
  var params = command.shift();
  var args = {};

  if(DEBUG) { console.log(' [D] query to: '+queryurl); }
  // if POST -- FIXME
  /* var args = {
     data: {
     "method": null,
     "params": command,
     "jsonrpc": "2.0",
     "id": 0
     },
     headers:{"Content-Type": "application/json"},
     path:command
     }*/
  var args = {
    headers:{"Content-Type": "application/json"},
    path:upath
  }
  // construct the APIqueue object
  APIqueue.add({ 'method':type,
                 'link':'source["'+target.id+'"]',  // make sure APIqueue can use initialized API link
                 'host':target.host,
                 'args':args,
                 'throttle':target.throttle,
                 'pid':processID,
                 'target':target.id });
}
