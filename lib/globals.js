// globals.js - gets all dependency globals (and constants) in place
//  - bundled nicely for overview convenience
// (c) 2016 metasync r&d / internet of coins project
// constants
//  superglobals
// include js-NaCl everywhere
// global functions
DEBUG=0,cached={},xpath=[],last_xpath=[],nacl_factory=require("./crypto/nacl.js"),nacl=nacl_factory.instantiate(),str=function(n){return JSON.stringify(n)},Decimal=require("./crypto/decimal-light.js"),fromInt=function(n,r){return f=Number(r),x=new Decimal(n),padFloat(x.times((f>1?"0."+new Array(f).join("0"):"")+"1"),r)},toInt=function(n,r){return f=Number(r),x=new Decimal(String(n)),x.times("1"+(f>1?new Array(f+1).join("0"):""))},padFloat=function(n,r){return(isNaN(n)||0==Number(n))&&(n="0."),String(n)+(Number(r)-String(n).length+2>0?new Array(Number(r)-String(n).length+3).join("0"):"")}
