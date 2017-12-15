// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd - modules.js
// Scans for and loads modules dynamically from files

// required standard libraries
var fs = require("fs");
var path = require("path");

// wide scoped variables
var modulesdirectory = path.normalize(process.cwd()+"/../modules/");
var modulelist = [];
var module = [];// exports
exports.init = init;
exports.initexec = initexec;
exports.module = module;
exports.getsource = getsource;

// initialize all modules
function init() {
	// scan and load modules
	fs.readdir(modulesdirectory, (err1, files) => {
		if(err1) {
			console.log(" [!] warning: error when reading " + err1);
		} else {
			// scan modules
			console.log(" [.] scanning modules in "+modulesdirectory);
			files.sort().forEach(scanmodules);
			// load modules		// DEBUG: console.log('     - moduleslist: ' + moduleslist);
			modulelist.forEach( (element, index, array) => {
				console.log(" [.] loading module " + element);
				module[element] = [];
				if( fs.existsSync( path.join(modulesdirectory + element + "/package.json") ) ) {
					module[element].info = function() { return JSON.parse(fs.readFileSync(modulesdirectory + element + "/package.json", "utf8")); };
				} else {
					// get module meta-data
					console.log(" [!] warning: non-existing " + modulesdirectory + element + "/package.json");
					module[element].info = null;
				}
				// activate module
				module[element].main = require(modulesdirectory + element + "/module.js");
				module[element].main.init();
			});
		}
	});
  return 1;
}

// scan modules
function scanmodules(element, index, array) {
	if( fs.statSync( path.join(modulesdirectory + element) ).isDirectory() ) {
		if( fs.existsSync( path.join(modulesdirectory + element + "/module.js") ) ) {
			modulelist.push(element);
			console.log(" [i] found module " + element);
		} else {
			console.log(" [!] cannot load module " + element + "!");
		}
	}
  return 1;
}

// execute initialization asset and source functions for a module type
function initexec(modulename,command) {
	// this module can provide assets (wallet)
	for (var asset in global.hybridd.asset) {
		if(typeof global.hybridd.asset[asset].module != "undefined" && global.hybridd.asset[asset].module == modulename) {
			// check the status of the connection, and give init feedback
			var processID = scheduler.init(0);
			var target = global.hybridd.asset[asset]; target.symbol = asset;
      var mode = (typeof asset.mode!="undefined"?asset.mode:null);
      var factor = (typeof asset.factor!="undefined"?asset.factor:8);
      modules.module[global.hybridd.asset[target.symbol].module].main.exec({processID:processID,target:target,mode:mode,factor:factor,command:command});
		}
	}
	// this module can provide sources (daemon)
	for (var source in global.hybridd.source) {
		if(typeof global.hybridd.source[source].module != "undefined" && global.hybridd.source[source].module == modulename) {
			// check the status of the connection, and give init feedback
			var processID = scheduler.init(0);
			var target = global.hybridd.source[source]; target.id = source;
      var mode = (typeof source.mode!="undefined"?source.mode:null);
      modules.module[global.hybridd.source[target.id].module].main.exec({processID:processID,target:target,mode:mode,factor:factor,command:command});  
		}
	}
  return 1;
}

// find any available source with the correct mode
function getsource(mode) {
  mode = mode.split(".")[1];
  var targets = [];
  var targetscnt = 0;
  for (var key in global.hybridd.source) {
    if(typeof global.hybridd.source[key].mode !== "undefined" && global.hybridd.source[key].mode.split(".")[0] === mode) {
      targets.push(key);
      targetscnt+=1;
    }
  }
  var choice = targets[Math.floor(Math.random()*(targetscnt))];
  return(global.hybridd.source[choice]);
}
