// asset.js -> handle asset calls
//
// (c)2016 metasync r&d / internet of coins project - Amadeus de Koning / Joachim de Koning
//

/* global DEBUG DJB2 functions modules proc scheduler:true*/

var sourcelist = function sourcelist (module) {

    var sourcecnt = 0;
    var source = {};
    for (var key in global.hybridd.source) {

        if (typeof global.hybridd.source[key].module !== "undefined" && global.hybridd.source[key].module === module) {

            if (typeof global.hybridd.source[key].mode === "undefined") {

                if (key === global.hybridd.source[key].module) {

                    source[key] = "";

                } else {

                    source[key] = global.hybridd.source[key].module;

                }

            } else {

                source[key] = global.hybridd.source[key].mode;

            }
            sourcecnt += 1;

        }

    }

    return {
        "error": 0,
        "info": "List of available sources and their modes.",
        "id": `source/${module}`,
        "count": sourcecnt,
        "data": functions.sortObjectByKey(source)
    };

};

var modelist = function modelist (module) {

    var modecnt = 0;
    var mode = [];
    for (var key in global.hybridd.source) {

        if (typeof global.hybridd.source[key].module !== "undefined" && global.hybridd.source[key].module === module) {

            if (typeof global.hybridd.source[key].mode !== "undefined" && mode.indexOf(global.hybridd.source[key].mode) === -1) {

                mode.push(global.hybridd.source[key].mode);
                modecnt += 1;

            }

        }

    }

    return {
        "count": modecnt,
        "data": mode,
        "error": 0,
        "id": `source/${module}`,
        "info": "List of available modes."
    };

};

var directcommand = function directcommand (target, lxpath, sessionID) {

    if (lxpath[3]) {

        // init new process
        var processID = scheduler.init(0, {sessionID});
        // add up all arguments into a flexible command result
        var cnta = 1;
        var cntb = 4;
        var command = [];
        command[0] = lxpath[3];
        while (typeof lxpath[cntb] !== "undefined") {

            command[cnta] = lxpath[cntb];
            cnta += 1;
            cntb += 1;

        }
        // run the module connector function - disconnects and sends results to processID!
        if (typeof modules.module[target.module] === "undefined") {

            console.log(` [!] module ${target.module}: not loaded, or disfunctional!`);
            var result = {
                "error": 1,
                "info": "Module not found or dysfunctional!"
            };

        } else {

            modules.module[target.module].main.link({
                command,
                processID,
                target
            });
            result = {
                "data": processID,
                "error": 0,
                "id": "id",
                "info": "Command process ID.",
                "request": command
            };

        }

    } else {

        result = {
            "error": 1,
            "info": `You must give a command! (Example: http://${global.hybridd.restbind}:${global.hybridd.restport}/source/blockexplorer/command/help)`
        };

    }

    return result;

};

var sourceexec = function sourceexec (target, lxpath, sessionID) {

    // init new process
    var processID = scheduler.init(0, {sessionID});

    // add up all arguments into a flexible standard result
    var cnta = 1;
    var cntb = 3;
    var command = [];
    command[0] = lxpath[2];
    while (typeof lxpath[cntb] !== "undefined") {

        command[cnta] = lxpath[cntb];
        cnta += 1;
        cntb += 1;

    }
    // activate module exec function - disconnects and sends results to processID!
    // run the module connector function - disconnects and sends results to processID!
    if (typeof global.hybridd.source[target.id] === "undefined" || typeof modules.module[global.hybridd.source[target.id].module] === "undefined") {

        console.log(` [!] module ${module}: not loaded, or disfunctional!`);
        var result = {
            "error": 1,
            "info": "Module not found or disfunctional!"
        };

    } else {

        modules.module[global.hybridd.source[target.id].module].main.exec({
            command,
            processID,
            target
        });
        result = {
            "data": processID,
            "error": 0,
            "id": "id",
            "info": "Command process ID.",
            "request": command
        };

    }

    return result;

};

var process = function process (request, xpath) {

    var result = null;
    var target = {};
    if (xpath.length === 1) {

        // result = sourcelist();
        result = {
            "count": 2,
            "data": [
                "deterministic",
                "blockexplorer"
            ],
            "error": 0,
            "id": "source",
            "info": "List of available sources."
        };

    } else {

        // possible source functions (depending on its class)
        var pathsSourceExec = [];
        var command = null;
        switch (xpath[1]) {

        case "deterministic":
            command = xpath[2];
            pathsSourceExec = [
                "assets",
                "code",
                "hash",
                "hashes",
                "modes"
            ];
            target = {
                "id": "deterministic",
                "module": "deterministic"
            };
            break;
        case "blockexplorer":
            command = xpath[3];
            pathsSourceExec = [
                "balance",
                "command",
                "status",
                "unspent"
            ];
            if (typeof xpath[2] === "undefined") {

                return sourcelist(xpath[1]);

            }

            // when requested for wildcard target, choose any available explorer
            if (typeof xpath[2] === "string" && xpath[2].substr(0, 1) === "*") {

                if (typeof xpath[3] === "undefined") {

                    return modelist(xpath[1]);

                }

                target = modules.getsource(xpath[3]);
                if (!target) {

                    return {
                        "error": 1,
                        "id": "source/*",
                        "info": "An existing mode must be specified after wildcard! Example: */bitcoin/unspent/ADDRESS"
                    };

                }


                command = xpath[4];
                xpath.shift();
                xpath[1] = xpath[0];

            } else {

                target = global.hybridd.source[xpath[2]];

            }


            xpath.shift();
            xpath[1] = xpath[0];
            break;
        default:
            break;

        }
        if ([
            "deterministic",
            "blockexplorer"
        ].indexOf(xpath[1]) > -1 || typeof target !== "undefined" ) {  // Object.keys(sourcelist(xpath[1], xpath[2]).data).indexOf(command) > -1)

            // commands for (example RPC) connected clients
            if (xpath[2] === "command" && request.sessionID) {

                result = directcommand(target, xpath, request.sessionID);

            } else if (pathsSourceExec.indexOf(command) > -1) {

                var cacheVal = typeof target.cache !== "undefined" ? target.cache : 12000;
                var cacheIdx = DJB2.hash(request.sessionID + xpath.join("/"));
                result = proc.cacheGet(cacheIdx, cacheVal);
                if (!result) {

                    result = sourceexec(target, xpath, request.sessionID);
                    if (!result.error) {

                        proc.cacheAdd(cacheIdx, result);

                    }

                }

            } else {

                result = {
                    "data": pathsSourceExec,
                    "error": 0,
                    "id": `source/${xpath[1]}`,
                    "info": "Please use a source function!"
                };

            }
            
        } else {

            result = {
                "error": 1,
                "id": `source/${xpath[1]}`,
                "info": "Source not found!"
            };

        }

    }

    return result;

};

exports.process = process;
