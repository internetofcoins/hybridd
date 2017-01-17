/******************************************************************************
 * Internet of Coins                                                          *
 * source.js - dispatcher for source requests                                 *
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

// public functions start here
function process(request) {
	// DEBUG console.log(' [i] returning view on request '+JSON.stringify(xpath));
	if (xpath.length == 1) {
		result = sourcelist();
	} else {
		var source=xpath[1];
		if(sourcelist().data.indexOf(source)!=-1) {
			var target = global.hybridd.source[source];
			target.name = (typeof source != 'undefined'?source:null);
			var paths_sourceexec = ['status'];
			// commands for (example RPC) connected clients
			if(xpath[2] == 'command'  && !request.public) {
				result = directcommand(target,xpath,modules);
			} else if ( paths_sourceexec.indexOf(xpath[2])>-1 ) {
				result = {error:1, info:'Please use a source function!', data:paths_sourceexec};
			}
		} else {
			result = {error:1, info:'Source not found!'};
		}
	}
	return result;
}

// source specific functions start here
function directcommand(target,lxpath,modules) {
	if(lxpath[3]) {
		var command = lxpath[3];
		// init new process
		var processID = functions.initproc(0);
		// add up all arguments into a flexible command result
		var cnta = 1;
		var cntb = 4;
		var arguments = [];
		arguments[0] = command;
		while(typeof lxpath[cntb] != 'undefined') {
			arguments[cnta] = lxpath[cntb];
			cnta++;
			cntb++;
		}
		command = arguments;
		// run the module connector function - disconnects and sends results to processID!
		modules.module[target.module].main.connector({processID,target,command});
		var result = {error:0, info:'Command process ID.', id:'id', data:processID};
	} else {
		var result = {error:1, info:'You must give a command! (Example: http://'+global.hybridd.restbind+':'+global.hybridd.restport+'/source/eub/command/help)'};
	}
	return result;
}

function sourcelist() {
	var sourcecnt = 0;
	var source = [];
	for (var key in global.hybridd.source) {
		source[sourcecnt] = key;
		sourcecnt++;
	}
	return {error:0, info:'List of available sources.', id:'source', count:sourcecnt, data:source};
}

