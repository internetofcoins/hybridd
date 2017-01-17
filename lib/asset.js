/******************************************************************************
 * Internet of Coins                                                          *
 * asset.js - process scheduler of the hybridd engine                         *
 * Copyright © 2016-2017 Joachim de Koning, Amadeus de Koning                 *
 *                                                                            *
 * This work is licensed under the GPLv3. See the LICENSE files at            *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * this software, including this file, may be copied, modified, propagated,   *
 * or distributed except according to the terms contained in the LICENSE      *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

// export every function
exports.process = process;

// functions start here

function process(request) {
	// DEBUG console.log(' [i] returning asset on request '+JSON.stringify(xpath));
	if (xpath.length == 1) {
		result = assetlist();
		result.data.pop();
	} else {
		var asset=xpath[1];
		if(assetlist().data.indexOf(asset)!=-1) {
			var target = global.hybridd.asset[asset];
			target.name = (typeof asset != 'undefined'?asset:null);
			//var paths_assetexec = ['address','balance','status','transfer','confirm','listtransactions','chart'];
			var paths_assetexec = ['address','balance','confirm','chart','deterministic','factor','transferlist','status','transfer'];
			// commands for (example RPC) connected clients
			if(xpath[2] == 'command' && !request.public) {
				result = directcommand(target,xpath,modules);
			} else if ( paths_assetexec.indexOf(xpath[2])>-1 ) {
				result = assetexec(target,xpath,modules);
			} else {
				result = {error:1, info:'Please use an asset function!', data:paths_assetexec};
			}
		} else {
			result = {error:1, info:'Asset not found!'};
		}
	}
	return result;
}

// asset specific functions start here
function assetlist() {
	var assetcnt = 0;
	var asset = [];
	for (var key in global.hybridd.asset) {
		asset[assetcnt] = key;
		assetcnt++;
	}
	return {error:0, info:'List of available assets.', id:'asset', count:assetcnt-1, data:asset};
}

function assetexec(target,lxpath,modules) {
	// init new process
	var processID = scheduler.initproc(0);
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
	if(typeof global.hybridd.asset[target.name].source != 'undefined') { var source = global.hybridd.asset[target.name].source; } else { source = undefined; }
	if(typeof global.hybridd.asset[target.name].type != 'undefined') { var type = global.hybridd.asset[target.name].type; } else { type = 'deterministic'; }
	if(typeof global.hybridd.asset[target.name].factor != 'undefined') { var factor = global.hybridd.asset[target.name].factor; } else { factor = 12; }
	// run a module standard function - disconnects and sends results to processID!
	if(typeof modules.module[global.hybridd.asset[target.name].module] != 'undefined') {
		// exec routine
		var subprocesses = modules.module[global.hybridd.asset[target.name].module].main.exec({processID,target,source,type,factor,command});
    // append post-processing function
		subprocesses.push('func("'+global.hybridd.asset[target.name].module+'","post",'+JSON.stringify({target,factor,command})+');');   // longhand: subprocesses.push('modules.module.'+global.hybridd.asset[target.name].module+'.main.post('+JSON.stringify({processID,target,command})+');');
		scheduler.subqueue(processID,subprocesses);		
		return {error:0, info:lxpath[2].Capitalize()+' process ID.', id:'id', data:processID};
	} else {
		console.log(' [!] module '+global.hybridd.asset[target.name].module+': not loaded, or disfunctional!');
		return {error:1, info:'Module not found or dysfunctional!'};
	}
}

function directcommand(target,lxpath,modules) {
	if(lxpath[3]) {
		// init new process
		var processID = scheduler.initproc(0);
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
		var result = {error:1, info:'You must give a command! (Example: http://'+global.hybridd.restbind+':'+global.hybridd.restport+'/asset/btc/command/help)'};
	}
	return result;
}
