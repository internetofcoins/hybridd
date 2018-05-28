// globals.js - gets all dependency globals (and constants) in place
//  - bundled nicely for overview convenience
// (c) 2016 metasync r&d / internet of coins project
// add enough event emitter listeners
// proc and auth globals
// include js-NaCl everywhere. This will be initialized by naclFactory.js
// global functions //TODO needs te be localized in stead of made globally available
//
// quick go-to global functions (to be cleaned up)
//
// constants
global.hybridd={},global.hybridd.proc={},global.hybridd.procPaused={},global.hybridd.procqueue={},global.hybridd.APIqueue={},global.hybridd.APIthrottle={},global.hybridd.asset={},global.hybridd.engine={},global.hybridd.source={},global.hybridd.xauth={},global.hybridd.xauth.session=[],global.hybridd.schedulerInterval=null,global.hybridd.schedulerInitiated=!1,global.hybridd.APIqueueInterval=null,global.hybridd.APIqueueInitiated=!1,global.hybridd.uiServer=null,global.hybridd.restServer=null,global.hybridd.last_routed_xpath="",global.hybridd.cached={},global.hybridd.quartz=null,global.hybridd.defaultQuartz=null,nacl=null,jsdom=require("jsdom"),crypto=require("crypto"),Decimal=require("./crypto/decimal-light.js"),Decimal.set({precision:64}),DJB2=require("./crypto/hashDJB2"),hex2dec=require("./crypto/hex2dec"),RESTclient=require("./rest").Client,storage=require("./storage"),functions=require("./functions"),LZString=require("./crypto/lz-string"),modules=require("./modules"),scheduler=require("./scheduler"),APIqueue=require("./APIqueue"),jstr=function(e){return JSON.stringify(e)},logger=function(e){"undefined"!=typeof UI&&"undefined"!=typeof UI.logger?UI.logger.insertBottom(e):console.log(e)},fromInt=function(e,r){var l=Number(r),i=new Decimal(String(e))
return i.times((l>1?"0."+new Array(l).join("0"):"")+"1")},toInt=function(e,r){var l=Number(r),i=new Decimal(String(e))
return i.times("1"+(l>1?new Array(l+1).join("0"):""))},padFloat=function(e,r){var l=Number(r),i=new Decimal(String(e))
return i.toFixed(l).toString()},isToken=function(e){return e.indexOf(".")!==-1?1:0},DEBUG=!1
