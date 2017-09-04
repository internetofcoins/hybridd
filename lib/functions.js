// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd - functions.js
// Collection of process and other ubiquitous functions.
// handy functions that can be imported into modules
// cleans a string
// produces a complete timestamp in the format: Y-m-d H:i:s.m
// clones one object into another without tied referencing
// set sane configuration defaults for modules
// quick and dirty duplication of isset() found in PHP
// implode like in PHP
// validates JSON, else returns false 
// DO NOT USE THIS FOR CRYPTOGRAPHIC PURPOSES!!!
// sort an array by Object Key
function clean(r){var t=r.toString().replace(/[^A-Za-z0-9\.\*]/g,"")
return t}function timestamp(r){var t=r.getFullYear()+"-"+(r.getMonth()+1).toString().lZero(2)+"-"+r.getDate().toString().lZero(2)+" "+r.getHours().toString().lZero(2)+":"+r.getMinutes().toString().lZero(2)+":"+r.getSeconds().toString().lZero(2)+"."+r.getMilliseconds().toString().lZero(3)
return t}function cloneobj(r){var t=[]
for(key in r)t[key]=r[key]
return t}function confdefaults(r){for(var t in r)"undefined"==typeof r[t].port&&("undefined"!=typeof r[t].host&&"https"===r[t].host.substring(0,5)?r[t].port=443:r[t].port=80),"undefined"==typeof r[t].path&&(r[t].path="/q")
return r}function isset(strVariableName){try{eval(strVariableName)}catch(r){if(r instanceof ReferenceError)return!1}return!0}function implode(r,t){var e="",o="",n=""
if(1===arguments.length&&(t=r,r=""),"object"==typeof t){if("[object Array]"===Object.prototype.toString.call(t))return t.join(r)
for(e in t)o+=n+t[e],n=r
return o}return t}function JSONvalid(r){var t={}
return"string"==typeof r&&r&&(t=!/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(r.replace(/"(\\.|[^"\\])*"/g,""))&&JSON.parse(r)),t}function randomstring(r,t){t=t||"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
for(var e="",o=0;o<r;o++){var n=Math.floor(Math.random()*t.length)
e+=t.substring(n,n+1)}return e}function sortArrayByObjKey(r,t,e){order="undefined"!=typeof order&&e
var o={}
for(var n in r)o[r[n][t]]=n
var i=[],a=0
return Object.keys(o).sort().forEach(function(t){i[a]=r[o[t]],a++}),e&&(i=i.reverse()),i}exports.timestamp=timestamp,exports.JSONvalid=JSONvalid,exports.isset=isset,exports.implode=implode,exports.cloneobj=cloneobj,exports.clean=clean,exports.confdefaults=confdefaults,exports.randomstring=randomstring,exports.sortArrayByObjKey=sortArrayByObjKey
