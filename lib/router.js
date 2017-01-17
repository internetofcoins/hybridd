/******************************************************************************
 * Internet of Coins                                                          *
 * router.js - routing of incoming requests                                   *
 * Copyright © 2016-2017 Joachim de Koning, Amadeus de Koning                 *
 *                                                                            *
 * This work is licensed under the GPLv3. See the LICENSE files at            *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * this software, including this file, may be copied, modified, propagated,   *
 * or distributed except according to the terms contained in the LICENSE      *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

function route(a,b){if("string"==typeof a.url){xpath=a.url.split("/");for(var c=0;c<xpath.length;c++)""==xpath[c]?(xpath.splice(c,1),c--):xpath[c]=decodeURIComponent(xpath[c]);var d={error:1,info:"Your request was not understood!"};if(JSON.stringify(xpath)!=JSON.stringify(last_xpath)&&"y"!=xpath[0]&&"z"!=xpath[0]&&console.log(" [.] routing request "+JSON.stringify(xpath)),last_xpath=xpath,0==xpath.length)d={info:" *** Welcome to the hybridd JSON REST-API. Please enter a path. For example: /asset/btc/command/help *** ",error:0};else{if(("a"==xpath[0]||"asset"==xpath[0])&&(d=asset.process(a)),("n"==xpath[0]||"net"==xpath[0]||"network"==xpath[0])&&xpath.length>1&&"peers"==xpath[1]&&(d=network.getPeers()),("p"==xpath[0]||"proc"==xpath[0])&&(d=proc.process(a)),("s"==xpath[0]||"source"==xpath[0])&&(d=source.process(a)),("v"==xpath[0]||"view"==xpath[0])&&(d=view.serve(a)),("x"==xpath[0]||"xauth"==xpath[0])&&xpath.length>1&&(d=xauth.xauth(a)),("y"==xpath[0]||"ychan"==xpath[0])&&xpath.length>3)try{a.url=xauth.xplain(xpath[1],xpath[2],UrlBase64.safeDecompress(xpath[3])),d=UrlBase64.safeCompress(xauth.xcrypt(xpath[1],xpath[2],route(a,b)))}catch(e){d=""}if(("z"==xpath[0]||"zchan"==xpath[0])&&xpath.length>=3)try{a.url=LZString.decompressFromEncodedURIComponent(xauth.xplain(xpath[1],xpath[2],UrlBase64.safeDecompress(xpath[3]))),d=UrlBase64.safeCompress(xauth.xcrypt(xpath[1],xpath[2],LZString.compressToEncodedURIComponent(route(a,b))))}catch(e){d=""}("undefined"==typeof xpath[0]||xpath[0].length<=1)&&(d.info=void 0)}return JSON.stringify(d)}return""}functions=require("./functions"),_=require("./underscore"),LZString=require("./crypto/lz-string"),UrlBase64=require("./crypto/urlbase64"),asset=require("./asset"),network=require("./network"),proc=require("./proc"),source=require("./source"),view=require("./view"),xauth=require("./xauth"),url=require("url"),exports.route=route;
