// asset.js -> handle asset calls
//
// (c)2016 metasync r&d / internet of coins project - Amadeus de Koning / Joachim de Koning
//

// export every function
exports.process = process;

// public functions start here
function process(request) {
	// DEBUG console.log(' [i] returning view on request '+JSON.stringify(xpath));
	if (xpath.length == 1) {
		//result = sourcelist();
    result = {error:0, info:'List of available sources.', id:'source', count:2, data:['deterministic','blockexplorer']};
	} else {
      result = null;
      // possible source functions (depending on its class)
      var paths_sourceexec = [];
      var command = null;
      switch(xpath[1]) {
        case 'deterministic':
          command = xpath[2];
          paths_sourceexec = ['assets','modes','code','hash'];
          target = {module:'deterministic',name:'deterministic'};
        break;
        case 'blockexplorer':
          command = xpath[3];
          paths_sourceexec = ['status','balance','unspent','command'];
          if(typeof xpath[2] != 'undefined') {
            // when requested for wildcard target, choose any available explorer
            if(typeof xpath[2]=='string' && xpath[2].substr(0,1)=='*') {
              if(typeof xpath[3] != 'undefined') {
                var target = modules.getsource(xpath[3]);
                if(!target) { return {error:1, info:'An existing mode must be specified after wildcard! Example: */bitcoin/unspent/ADDRESS', id:'source/*'} }
              } else {
                return modelist(xpath[1]);
              }
              command = xpath[4];
              xpath.shift();
              xpath[1]=xpath[0];
            } else {
              target = global.hybridd.source[xpath[2]];
            }
          } else {
            return sourcelist(xpath[1]);
          }
          xpath.shift();
          xpath[1]=xpath[0];
        break;
      }
      if(['deterministic','blockexplorer'].indexOf(xpath[1])>-1 || Object.keys(sourcelist(xpath[1],xpath[2]).data).indexOf(command)>-1) {
        // commands for (example RPC) connected clients
        if(xpath[2] == 'command'  && !request.public) {
          result = directcommand(target,xpath,modules);
        } else if ( paths_sourceexec.indexOf(command)>-1 ) {
          var cacheVal = (typeof target.cache!='undefined'?target.cache:12000);
          var cacheIdx = xpath.join('/');
          result = proc.cacheGet(cacheIdx,cacheVal);
          if(!result) {
            result = sourceexec(target,xpath,modules);
          }
          if(result.error==0) {
            proc.cacheAdd(cacheIdx,result);
          }
        } else {
          result = {error:0, info:'Please use a source function!', id:'source/'+xpath[1], data:paths_sourceexec};
        }
      } else {
        result = {error:1, info:'Source not found!', id:'source/'+xpath[1]};
      }
	}
	return result;
}

function sourceexec(target,lxpath) {
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
	if(typeof modules.module[global.hybridd.source[target.name].module] != 'undefined') {
    modules.module[global.hybridd.source[target.name].module].main.exec({processID,target,command});
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
			modules.module[target.module].main.link({processID,target,command});
			var result = {error:0, info:'Command process ID.', id:'id', request:command, data:processID};
		} else {
			console.log(' [!] module '+target.module+': not loaded, or disfunctional!');
			var result = {error:1, info:'Module not found or dysfunctional!'};
		}
	} else {
		var result = {error:1, info:'You must give a command! (Example: http://'+global.hybridd.restbind+':'+global.hybridd.restport+'/source/blockexplorer/command/help)'};
	}
	return result;
}

function sourcelist(module,mode) {
	var sourcecnt = 0;
	var source = {};
	for (var key in global.hybridd.source) {
    if(typeof global.hybridd.source[key].module!='undefined' && global.hybridd.source[key].module==module) {
      source[key] = (typeof global.hybridd.source[key].mode!='undefined'?global.hybridd.source[key].mode:(key!=global.hybridd.source[key].module?global.hybridd.source[key].module:''));
      sourcecnt++;
    }
	}
	return {error:0, info:'List of available sources and their modes.', id:'source/'+module, count:sourcecnt, data:source};
}

function modelist(module) {
	var modecnt = 0;
	var mode = [];
	for (var key in global.hybridd.source) {
    if(typeof global.hybridd.source[key].module!='undefined' && global.hybridd.source[key].module==module) {
      if(typeof global.hybridd.source[key].mode!='undefined' && mode.indexOf(global.hybridd.source[key].mode)==-1) {
        mode.push(global.hybridd.source[key].mode);
        modecnt++;
      }
    }
	}
	return {error:0, info:'List of available modes.', id:'source/'+module+'/*', count:modecnt, data:mode};
}
