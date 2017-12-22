// globals.js - gets all dependency globals (and constants) in place
//  - bundled nicely for overview convenience
// (c) 2016 metasync r&d / internet of coins project
// constants
// add enough event emitter listeners
//  superglobals
// proc and auth globals
// static configuration recipe's for essential functionality
//global.hybridd.asset['*']={module:'meta'};
// include js-NaCl everywhere
// global functions
//
// quick go-to global functions (to be cleaned up)
//
DEBUG=!1,require("events").EventEmitter.defaultMaxListeners=20,cached={},last_xpath=[],global.hybridd={},global.hybridd.proc={},global.hybridd.procqueue={},global.hybridd.APIqueue={},global.hybridd.APIthrottle={},global.hybridd.asset={},global.hybridd.source={},global.hybridd.xauth={},global.hybridd.xauth.session=[],global.hybridd.source.storage={id:"storage",module:"storage"},nacl_factory=require("./crypto/nacl.js"),nacl=nacl_factory.instantiate(),jstr=function(e){return JSON.stringify(e)},jsdom=require("jsdom"),crypto=require("crypto"),Decimal=require("./crypto/decimal-light.js"),Decimal.set({precision:64}),DJB2=require("./crypto/hashDJB2"),hex2dec=require("./crypto/hex2dec"),RESTclient=require("./rest").Client,storage=require("./storage"),logger=function(e){"undefined"!=typeof UI&&"undefined"!=typeof UI.logger?UI.logger.insertBottom(e):console.log(e)},fromInt=function(e,r){var t=Number(r),i=new Decimal(String(e))
return i.times((t>1?"0."+new Array(t).join("0"):"")+"1")},toInt=function(e,r){var t=Number(r),i=new Decimal(String(e))
return i.times("1"+(t>1?new Array(t+1).join("0"):""))},padFloat=function(e,r){var t=Number(r),i=new Decimal(String(e))
return i.toFixed(t).toString()},isToken=function(e){return e.indexOf(".")!==-1?1:0}
