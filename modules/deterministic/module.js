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
  var hashes = {};
  var mode = '';
  for (var asset in global.hybridd.asset) {
    mode = (typeof global.hybridd.asset[asset].mode!='undefined'?global.hybridd.asset[asset].mode:false);
    if( mode ) {
      // index the modes
      assets[asset] = mode;
      if(typeof modes[mode]=='undefined') { modes[mode.split('.')[0]]=[]; }
      modes[mode.split('.')[0]].push(asset);
      // hash the deterministic packages
      var filename = '../modules/deterministic/'+mode.split('.')[0]+'/deterministic.js.lzma';
      if (typeof hashes[mode.split('.')[0]]=='undefined' && fs.existsSync(filename)) {
        hashes[mode.split('.')[0]] = DJB2.hash(String(fs.readFileSync(filename)));
        console.log(' [i] module deterministic: hashed mode '+mode.split('.')[0]);
      }
    }
  }
  global.hybridd.source['deterministic']={module:'deterministic',assets:assets,modes:modes,hashes:hashes};
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
    case 'assets':
        subprocesses.push('stop(0,'+jstr(global.hybridd.source['deterministic'].assets)+')');
    break;
    case 'modes':
        subprocesses.push('stop(0,'+jstr(global.hybridd.source['deterministic'].modes)+')');
    break;
    case 'hashes':
        subprocesses.push('stop(0,'+jstr(global.hybridd.source['deterministic'].hashes)+')');
    break;
    case 'hash':
      if(typeof global.hybridd.source['deterministic'].hashes[command[1]]!='undefined') {
        subprocesses.push('stop(0,"'+global.hybridd.source['deterministic'].hashes[command[1]]+'")');
      } else {
        subprocesses.push('stop(404,"Error: Mode does not exist!")');
      }
    break;
    case 'code':
      if(typeof command[1]!='undefined' && command[1]) {
        var filename = '../modules/deterministic/'+command[1]+'/deterministic.js.lzma';
        if (fs.existsSync(filename)) {
          // read deterministic.js and push data into process scheduler
          var lzmapack = fs.readFileSync(filename);
          // return compressed deterministic code object
          subprocesses.push('time(8000)');          
          subprocesses.push('stop(0,"'+lzmapack+'")');          
        } else {
          subprocesses.push('stop(404,"Error: Mode does not exist!")');
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
