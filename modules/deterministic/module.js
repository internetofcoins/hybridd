// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - deterministic/module.js
// Module to provide deterministic cryptography tools

// exports
exports.init = init;
exports.tick = tick;
exports.exec = exec;
exports.stop = stop;
//exports.link = link;
//exports.post = post;

// initialization function
function init() {
  // initialize available modes
  var assets = {};
  var modes = {};
  var mode = '';
  for (var asset in global.hybridd.asset) {
    mode = (typeof global.hybridd.asset[asset].mode!='undefined'?global.hybridd.asset[asset].mode:false);
    if( mode ) {
      assets[asset] = mode;
      modes[mode] = asset;
    }
  }
  global.hybridd.source['deterministic']={module:'deterministic',assets:assets,modes:modes};
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
	//var source = properties.source;
	var target = properties.target;
	var mode  = target.mode;
	var type  = target.type;
	var factor = (typeof target.factor != 'undefined'?target.factor:8);
  var command = properties.command;
	var subprocesses = [];	
	// set request to what command we are performing
	global.hybridd.proc[processID].request = properties.command;
	// handle standard cases here, and construct the sequential process list
  switch(command[0]) {
    case 'code':
      if(typeof command[1]!='undefined' && command[1]) {
        var script = '../modules/deterministic/'+command[1]+'/deterministic.js.lzma';
        if (fs.existsSync(script)) {
          // read deterministic.js and push data into process scheduler
          var lzmapack = fs.readFileSync(script);
          // return compressed deterministic code object for Lisk
          subprocesses.push('stop(0,"'+lzmapack+'")');          
        } else {
          subprocesses.push('stop(1,"Error: Mode does not exist!")');
        }
      } else {
        subprocesses.push('stop(1,"Error: Please specify a mode! Example: /source/deterministic/code/altcoin")');
      }    
    break;
    default:
      subprocesses.push('stop(1,"Source function not supported!")');
  }
  // fire the Qrtz-language program into the subprocess queue
  scheduler.fire(processID,subprocesses);
}
