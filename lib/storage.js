// storage.js :: higher level storage functions
// depends on localforage.nopromises.min.js
var storage=function(){function n(n){return!!fs.existsSync(n)||void fs.mkdirSync(n)}var e=path.normalize(process.cwd()+"/storage/"),t={Set:function(t,r){try{var u=t.substr(0,2)+"/"
return n(e+u),fs.writeFileSync(e+u+t,r),!0}catch(n){return!1}},Get:function(n,t){if("string"==typeof n){var r=n.substr(0,2)+"/"
if(fs.existsSync(e+r+n))try{"function"==typeof t&&t(String(fs.readFileSync(e+r+n)))}catch(n){"function"==typeof t&&t(null)}else"function"==typeof t&&t(null)}else"function"==typeof t&&t(null)},Del:function(n){try{var t=n.substr(0,2)+"/"
return fs.unlinkSync(e+t+n),!0}catch(n){return!1}}}
return t}()
"function"==typeof define&&define.amd?define(function(){return storage}):"undefined"!=typeof module&&null!=module?module.exports=storage:"undefined"!=typeof angular&&null!=angular&&angular.module("storage",[]).factory("storage",function(){return hex2dec})
