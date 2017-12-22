// storage.js :: higher level storage functions
// depends on localforage.nopromises.min.js
var storage=function(){function e(e){return!!fs.existsSync(e)||void fs.mkdirSync(e)}var t=require("path").normalize(process.cwd()+"/../storage/"),n={Set:function(n,r,i){try{var f=n.substr(0,2)+"/"
return e(t+f),fs.writeFileSync(t+f+n,r),"undefined"==typeof i&&(i={time:Date.now(),hash:DJB2.hash(r),pow:0,res:0}),fs.writeFileSync(t+f+n+".meta",JSON.stringify(i)),!0}catch(e){return!1}},Get:function(e,n){if("string"==typeof e){var r=e.substr(0,2)+"/"
if(fs.existsSync(t+r+e))try{if("function"==typeof n&&(n(String(fs.readFileSync(t+r+e))),fs.existsSync(t+r+e+".meta"))){var i=JSON.parse(String(fs.readFileSync(t+r+e+".meta")))
i.read=Date.now(),fs.writeFileSync(t+r+e+".meta",JSON.stringify(i))}}catch(e){"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)},Del:function(e){try{var n=e.substr(0,2)+"/"
return fs.unlinkSync(t+n+e),fs.unlinkSync(t+n+e+".meta"),!0}catch(e){return!1}},GetMeta:function(e,n){if("string"==typeof e){var r=e.substr(0,2)+"/"
if(fs.existsSync(t+r+e+".meta"))try{if("function"==typeof n){var i=JSON.parse(String(fs.readFileSync(t+r+e+".meta")))
n(i)}}catch(e){"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)},SetMeta:function(n,r){try{var i=n.substr(0,2)+"/"
return e(t+i),"undefined"==typeof r&&(r={time:Date.now(),hash:DJB2.hash(storevalue),pow:0,res:0}),fs.writeFileSync(t+i+n+".meta",JSON.stringify(r)),!0}catch(e){return!1}}}
return n}()
"function"==typeof define&&define.amd?define(function(){return storage}):"undefined"!=typeof module&&null!=module?module.exports=storage:"undefined"!=typeof angular&&null!=angular&&angular.module("storage",[]).factory("storage",function(){return storage})
