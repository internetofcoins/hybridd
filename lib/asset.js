// asset.js -> handle asset calls
//
// (c)2016 metasync r&d / internet of coins project - Amadeus de Koning / Joachim de Koning
//

// export every function
exports.process = process;

// functions start here

function process(request) {
	// DEBUG console.log(' [i] returning asset on request '+JSON.stringify(xpath));
	if (xpath.length == 1) {
		result = assetlist();
	} else {
		var asset=xpath[1];
		if(asset in assetlist().data) {
			var target = global.hybridd.asset[asset];
			target.name = (typeof asset != 'undefined'?asset:null);
      // possible asset functions
			var paths_assetexec = ['address','balance','confirm','chart','factor','fee','history','push','status','test','transfer','unspent'];
			// commands for (example RPC) connected clients
			if(xpath[2] == 'command' && !request.public) {
				result = directcommand(target,xpath,modules);
			} else if ( paths_assetexec.indexOf(xpath[2])>-1 ) {
        var cacheVal = (typeof target.cache!='undefined'?target.cache:12000);
        var cacheIdx = xpath.join('/');
        result = proc.cacheGet(cacheIdx,cacheVal);
        if(!result) {
          result = assetexec(target,xpath,modules);
        }
        if(result.error==0) {
          proc.cacheAdd(cacheIdx,result);
        }
			} else {
				result = {error:1,info:'Please use an asset function!', id:'asset/'+asset, data:paths_assetexec};
			}
		} else {
			result = {error:1, info:'Asset not found!', id:'asset/'+asset};
		}
	}
	return result;
}

// asset specific functions start here
function assetlist() {
  var assetcnt = 0;
  var asset = {};
  for (var key in global.hybridd.asset) {
    asset[key] = (typeof global.hybridd.asset[key].mode!='undefined'?global.hybridd.asset[key].mode:global.hybridd.asset[key].module);
    assetcnt++;
  }
	return {error:0, info:'List of available assets and their modes.', id:'asset', count:assetcnt, data:asset};
}

function assetexec(target,lxpath) {
	// init new process
	var processID = scheduler.init(0);
  
	// add up all arguments into a flexible standard result
	var cnta = 1;
	var cntb = 3;
	var arguments = [];
	arguments[0] = lxpath[2];
	while(typeof lxpath[cntb] != 'undefined') {
		arguments[cnta] = lxpath[cntb];
		cnta++;
		cntb++;
	}
	var command = arguments;
	// activate module exec function - disconnects and sends results to processID!
  // run the module connector function - disconnects and sends results to processID!
	if(typeof modules.module[global.hybridd.asset[target.name].module] != 'undefined') {
    modules.module[global.hybridd.asset[target.name].module].main.exec({processID,target,command});
    var result = {error:0, info:'Command process ID.', id:'id', request:command, data:processID};
  } else {
    console.log(' [!] module '+module+': not loaded, or disfunctional!');
    var result = {error:1, info:'Module not found or disfunctional!'};
  }
  return result;
}

function directcommand(target,lxpath,modules) {
	if(lxpath[3]) {
		// init new process
		var processID = scheduler.init(0);
		// add up all arguments into a flexible command result
		var cnta = 1;
		var cntb = 4;
		var arguments = [];
		arguments[0] = lxpath[3];
		while(typeof lxpath[cntb] != 'undefined') {
			arguments[cnta] = lxpath[cntb];
			cnta++;
			cntb++;
		}
		var command = arguments;
		// run the module connector function - disconnects and sends results to processID!
		if(typeof modules.module[target.module] != 'undefined') {
      if(typeof global.hybridd.asset[target.name].mode != 'undefined') { var mode = global.hybridd.asset[target.name].mode; } else { mode = null; }
      if(typeof global.hybridd.asset[target.name].type != 'undefined') { var type = global.hybridd.asset[target.name].type; } else { type = null; }
      if(typeof global.hybridd.asset[target.name].factor != 'undefined') { var factor = global.hybridd.asset[target.name].factor; } else { factor = 8; }
			modules.module[target.module].main.link({processID,target,mode,type,factor,command});
			var result = {error:0, info:'Command process ID.', id:'id', request:command, data:processID};
		} else {
			console.log(' [!] module '+target.module+': not loaded, or disfunctional!');
			var result = {error:1, info:'Module not found or dysfunctional!'};
		}
	} else {
		var result = {error:1, info:'You must give a command! (Example: http://'+global.hybridd.restbind+':'+global.hybridd.restport+'/asset/btc/command/help)'};
	}
	return result;
}
