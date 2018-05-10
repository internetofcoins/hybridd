// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - zcash/module.js
// Module to connect to zcash or any of its derivatives

// required libraries in this context
var fs = require('fs');
var Client = require('../../lib/rest').Client;
var functions = require('../../lib/functions');
var WebSocket = require('ws');


// exports
exports.init = init;
exports.exec = exec;

// initialization function
function init() {
  modules.initexec('quartz',['init']);
}

function write(value){
  if(typeof value === 'string' || typeof value === 'number' ){
    return value;
  }else if(typeof value === 'object' && value instanceof Array){
    return value.join(",");
  }else{
    return "undefined";
  }
}

// Preprocess quartz command
function preprocess(command,recipe,xpath){
  var re;
  var parsedCommand = command;
  re = /[$]([_a-zA-Z][\w\-]*)::([_\w\-]*)/g; // Search for "$recipeId::propertyId"
  parsedCommand =  parsedCommand.replace(re, function(full,recipeId,propertyId) {
    var recipe;

    if(global.hybridd.asset.hasOwnProperty(recipeId)){
      recipe = global.hybridd.asset[recipeId];
    }else if(global.hybridd.source.hasOwnProperty(recipeId)){
      recipe = global.hybridd.source[recipeId];
    }else{
      console.log(` [!] Error: Recipe "${recipeId}" for "${full}" not found. Neither asset nor source.`);
      return full;
    }

    return write(recipe[propertyId]);

  }); // Replace all "$recipeId::propertyId" with recipe["recipeId"]["propertyId"]

  re = /[$]([_a-zA-Z][\w\-_]*)/g; // Search for "$propertyId" and "$_propertyId-with_dashes--andNumbers1231"
  parsedCommand = parsedCommand.replace(re, function(full,propertyId) {return write(recipe[propertyId]);}); // Replace all "$propertyId" with recipe["propertyId"]

  re = /[$][\d]+/g; // Search for $0, $1, ...
  parsedCommand = parsedCommand.replace(re, function(x) {return xpath[x.substr(1)];}); // Replace all "$1" with xpath[1]
  return parsedCommand;
}

// preprocess quartz code
function addSubprocesses(subprocesses,commands,recipe,xpath) {

  for(var i=0,len=commands.length;i<len;++i){
    subprocesses.push(preprocess(commands[i],recipe,xpath));
  }

  // Postprocess: Append formating of result for specific commands
  var command = xpath[0];
  if(command === "balance" || command === "fee"){ // Append formatting of returned numbers
    subprocesses.push(preprocess('form(data,$factor)',recipe,xpath));
  }

}

function connectionOptions(recipe){
  var options = {};
  if(recipe.hasOwnProperty("pass")) {
    options.password = recipe.pass;
  }
  if(recipe.hasOwnProperty("user")) {
    options.user = recipe.user;
  }
  if(recipe.hasOwnProperty("proxy")) {
    options.proxy = recipe.proxy;
  }
  if(recipe.hasOwnProperty("connection")) {
    options.connection = recipe.connection;
  }
  if(recipe.hasOwnProperty("mimetypes")) {
    options.mimetypes = recipe.mimetypes;
  }
  if(recipe.hasOwnProperty("requestConfig")) {
    options.requestConfig = recipe.requestConfig;
  }
  if(recipe.hasOwnProperty("proxy")) {
    options.responseConfig = recipe.responseConfig;
  }
  options.rejectUnauthorized = false;
  return options;
}

// standard functions of an asset store results in a process superglobal -> global.hybridd.process[processID]
// child processes are waited on, and the parent process is then updated by the postprocess() function
function exec(properties) {
  // decode our serialized properties
  var processID = properties.processID;
  var recipe = properties.target; // The recipe object

  var id; // This variable will contain the recipe.id for sources or the recipe.symbol for assets
  var list; // This variable will contain the global.hybridd.source for sources or global.hybridd.asset for assets
  var base; // This variable will contain the base part of the symbol (the part before the '.' ) for assets
  var token;  // This variable will contain the token part of the symbol (the part after the '.' ) for assets

  if(recipe.hasOwnProperty("symbol")){ // If recipe defines an asset
    id = recipe.symbol;
    list = global.hybridd.asset;
    var symbolSplit = id.split('.');
    base = symbolSplit[0];
    if(symbolSplit.length>0){
      token = symbolSplit[1];
    }
  }else if(recipe.hasOwnProperty("id")){ // If recipe defines a source
    id = recipe.id;
    list = global.hybridd.source;
  }else{
    console.log(' [i] Error: recipe file contains neither asset symbol nor source id.');
  }

  global.hybridd.proc[processID].request = properties.command;   // set request to what command we are performing

  var command = properties.command[0];
  if(command=='init'){
    if(recipe.hasOwnProperty("host")){  // set up connection
      if((typeof recipe.host === 'string' && (recipe.host.substr(0,5) === 'ws://' || recipe.host.substr(0,6) === 'wss://'))){ // Websocket connections ws://, wss://
        try{
          var ws = new WebSocket(recipe.host, {});

          ws.on('open', function open() {
            console.log(" [i] websocket "+recipe.host + " opened");
          }).on('close', function close() {
            console.log(" [i] websocket "+recipe.host + " closed");
          }).on('error', function error(code, description) {
            console.log(" [i] websocket "+recipe.host + " : Error "+code+" "+description);
          })


          list[id].link = ws;

        }catch(result){
          console.log(`[!] Error initiating WebSocket -> ${result}`);
        }
      }else{ // Http connection http:// https://
        list[id].link = new Client(connectionOptions(recipe));
      }
    }

    // initialize deterministic code for smart contract calls if mode is defined
    if(recipe.hasOwnProperty('module-deterministic')){
      var dcode = String(fs.readFileSync('../modules/deterministic/'+recipe['module-deterministic']+'/deterministic.js.lzma'));
      list[id].dcode = functions.activate( LZString.decompressFromEncodedURIComponent(dcode) );
    }
  }

  var subprocesses = [];
  if(recipe.hasOwnProperty('quartz') && recipe.quartz.hasOwnProperty(command)){

    addSubprocesses(subprocesses,recipe.quartz[command],recipe,properties.command);

  } else {
    if(global.hybridd.defaultQuartz.hasOwnProperty('quartz') && global.hybridd.defaultQuartz.quartz.hasOwnProperty(command)){
      addSubprocesses(subprocesses,global.hybridd.defaultQuartz.quartz[command],recipe,properties.command);
    }else{
      subprocesses.push('stop(1,"Recipe function \''+command+'\' not supported for \''+id+'\'.")');
    }
  }

  // fire the Qrtz-language program into the subprocess queue
  scheduler.fire(processID,subprocesses);
}
