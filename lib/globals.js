// globals.js - gets all dependency globals (and constants) in place
//  - bundled nicely for overview convenience
// (c) 2016 metasync r&d / internet of coins project
// constants
//  superglobals
// proc and auth globals
// include js-NaCl everywhere
// global functions
//
// quick go-to global functions (to be cleaned up)
//
DEBUG=!1,cached={},last_xpath=[],global.hybridd={},global.hybridd.proc={},global.hybridd.procqueue={},global.hybridd.APIqueue={},global.hybridd.APIthrottle={},global.hybridd.asset={},global.hybridd.source={},global.hybridd.xauth={},global.hybridd.xauth.session=[],nacl_factory=require("./crypto/nacl.js"),nacl=nacl_factory.instantiate(),jstr=function(r){return JSON.stringify(r)},jsdom=require("jsdom"),crypto=require("crypto"),Decimal=require("./crypto/decimal-light.js"),Decimal.set({precision:64}),DJB2=require("./crypto/hashDJB2"),hex2dec=require("./crypto/hex2dec"),RESTclient=require("./rest").Client,logger=function(r){"undefined"!=typeof UI&&"undefined"!=typeof UI.logger?UI.logger.insertBottom(r):console.log(r)},fromInt=function(r,e){var t=Number(e),i=new Decimal(String(r))
return i.times((t>1?"0."+new Array(t).join("0"):"")+"1")},toInt=function(r,e){var t=Number(e),i=new Decimal(String(r))
return i.times("1"+(t>1?new Array(t+1).join("0"):""))},padFloat=function(r,e){var t=Number(e),i=new Decimal(String(r))
return i.toFixed(t).toString()}
