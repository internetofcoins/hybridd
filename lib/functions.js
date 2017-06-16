// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd - functions.js
// Collection of process and other ubiquitous functions.
// handy functions that can be imported into modules
// UNFINISHED!!! exports any object or variable into a superglobal
// produces a complete timestamp in the format: Y-m-d H:i:s.m
// clones one object into another without tied referencing
// set sane configuration defaults for modules
// quick and dirty duplication of isset() found in PHP
// implode like in PHP
// validates JSON, else returns false 
// DO NOT USE THIS FOR CRYPTOGRAPHIC PURPOSES!!!
function exportglobal(name,object){if("undefined"!=typeof GLOBAL)eval(name+" = "+JSON.stringify(object)),console.log(name+" = "+JSON.stringify(object))
else{if("undefined"==typeof window)throw new Error("Unkown run-time environment. Currently only browsers and Node.js are supported.")
eval(name+" = "+JSON.stringify(object))}}function clean(e){var r=e.toString().replace(/[^A-Za-z0-9\.\*]/g,"")
return r}function timestamp(e){var r=e.getFullYear()+"-"+(e.getMonth()+1).toString().lZero(2)+"-"+e.getDate().toString().lZero(2)+" "+e.getHours().toString().lZero(2)+":"+e.getMinutes().toString().lZero(2)+":"+e.getSeconds().toString().lZero(2)+"."+e.getMilliseconds().toString().lZero(3)
return r}function cloneobj(e){var r=[]
for(key in e)r[key]=e[key]
return r}function confdefaults(e){for(var r in e)"undefined"==typeof e[r].port&&("undefined"!=typeof e[r].host&&"https"===e[r].host.substring(0,5)?e[r].port=443:e[r].port=80),"undefined"==typeof e[r].path&&(e[r].path="/q")
return e}function isset(strVariableName){try{eval(strVariableName)}catch(e){if(e instanceof ReferenceError)return!1}return!0}function implode(e,r){var t="",o="",n=""
if(1===arguments.length&&(r=e,e=""),"object"==typeof r){if("[object Array]"===Object.prototype.toString.call(r))return r.join(e)
for(t in r)o+=n+r[t],n=e
return o}return r}function JSONvalid(e){var r={}
return"string"==typeof e&&e&&(r=!/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(e.replace(/"(\\.|[^"\\])*"/g,""))&&JSON.parse(e)),r}function randomstring(e,r){r=r||"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
for(var t="",o=0;o<e;o++){var n=Math.floor(Math.random()*r.length)
t+=r.substring(n,n+1)}return t}function sortArrayByObjKey(e,r,t){order="undefined"!=typeof order&&t
var o={}
for(var n in e)o[e[n][r]]=n
var i=[],a=0
return Object.keys(o).sort().forEach(function(r){i[a]=e[o[r]],a++}),t&&(i=i.reverse()),i}exports.timestamp=timestamp,exports.JSONvalid=JSONvalid,exports.isset=isset,exports.implode=implode,exports.cloneobj=cloneobj,exports.clean=clean,exports.confdefaults=confdefaults,exports.exportglobal=exportglobal,exports.randomstring=randomstring,exports.sortArrayByObjKey=sortArrayByObjKey
