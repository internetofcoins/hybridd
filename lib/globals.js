// globals.js - gets all dependency globals (and constants) in place
//  - bundled nicely for overview convenience
// (c) 2016 metasync r&d / internet of coins project
// constants
//  superglobals
// include js-NaCl everywhere
// global functions
DEBUG=!1,cached={},xpath=[],last_xpath=[],nacl_factory=require("./crypto/nacl.js"),nacl=nacl_factory.instantiate(),str=function(e){return JSON.stringify(e)},Decimal=require("./crypto/decimal-light.js"),Decimal.set({precision:64}),lHex2Dec=function(e){return dec=new Decimal(0),e.split("").forEach(function(e){for(var n=parseInt(e,16),t=8;t;t>>=1)dec=dec.plus(dec),n&t&&(dec=dec.plus(1))}),dec},fromInt=function(e,n){return f=Number(n),x=new Decimal(String(e)),x.times((f>1?"0."+new Array(f).join("0"):"")+"1")},toInt=function(e,n){return f=Number(n),x=new Decimal(String(e)),x.times("1"+(f>1?new Array(f+1).join("0"):""))},padFloat=function(e,n){return f=Number(n),x=new Decimal(String(e)),x.toFixed(f).toString()}
