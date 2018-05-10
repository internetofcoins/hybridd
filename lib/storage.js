// storage.js :: higher level storage functions
// depends on localforage.nopromises.min.js
var storage=function(){function e(e){return!!fs.existsSync(e)||void fs.mkdirSync(e)}var t=require("path").normalize(process.cwd()+"/../storage/"),n={Set:function(n,r,a){try{var s=n.substr(0,2)+"/"
if(e(t+s),fs.writeFileSync(t+s+n,r),"undefined"==typeof a&&(a={time:Date.now(),hash:DJB2.hash(r),pow:0,res:0}),fs.existsSync(t+s+n+".meta")){var i=JSON.parse(String(fs.readFileSync(t+s+n+".meta")))
"undefined"!=typeof i.n&&(a.n=i.n)}return fs.writeFileSync(t+s+n+".meta",JSON.stringify(a)),!0}catch(e){return!1}},Get:function(e,n){if("string"==typeof e){var r=e.substr(0,2)+"/"
if(fs.existsSync(t+r+e))try{if("function"==typeof n&&(n(String(fs.readFileSync(t+r+e))),fs.existsSync(t+r+e+".meta"))){var a=JSON.parse(String(fs.readFileSync(t+r+e+".meta")))
a.read=Date.now(),fs.writeFileSync(t+r+e+".meta",JSON.stringify(a))}}catch(e){"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)},Del:function(e){try{var n=e.substr(0,2)+"/"
return fs.unlinkSync(t+n+e),fs.unlinkSync(t+n+e+".meta"),!0}catch(e){return!1}},GetMeta:function(e,n){if("string"==typeof e){var r=e.substr(0,2)+"/"
if(fs.existsSync(t+r+e+".meta"))try{if("function"==typeof n){var a=JSON.parse(String(fs.readFileSync(t+r+e+".meta")))
n(a)}}catch(e){"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)}else"function"==typeof n&&n(null)},SetMeta:function(n,r){try{var a=n.substr(0,2)+"/"
return e(t+a),"undefined"==typeof r&&(r={time:Date.now(),hash:DJB2.hash(storevalue),pow:0,res:0,n:0}),fs.writeFileSync(t+a+n+".meta",JSON.stringify(r)),!0}catch(e){return!1}},AutoClean:function(){return console.log(" [.] module storage: storage auto-clean scan"),fs.statSync(t).isDirectory()||fs.mkdirSync(t),fs.readdir(t,function(e,n){n.sort().forEach(function(e,n,r){fs.statSync(t+e).isDirectory()&&fs.readdir(t+e,function(n,r){r.sort().forEach(function(n,r,a){if(".meta"===n.substr(-5)){var s=t+e+"/"+n
if(fs.existsSync(s)){var i=JSON.parse(String(fs.readFileSync(s))),o=Date.now()-86400*global.hybridd.maxstoragetime-global.hybridd.maxstoragetime*(864*i.n),f=Date.now()-86400*(void 0!==typeof global.hybridd.maxstoragetime&&global.hybridd.maxstoragetime>=1?global.hybridd.maxstoragetime:365)
if(i.read<o||i.read<f){var u=s.substr(0,s.length-5)
try{fs.unlinkSync(u),fs.unlinkSync(s),console.log(" [i] module storage: purged stale storage element"+u)}catch(e){console.log(" [!] module storage: failed to purge stale storage "+u)}}}}})})})}),1}}
return n}()
"function"==typeof define&&define.amd?define(function(){return storage}):"undefined"!=typeof module&&null!=module?module.exports=storage:"undefined"!=typeof angular&&null!=angular&&angular.module("storage",[]).factory("storage",function(){return storage})
