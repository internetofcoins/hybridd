/******************************************************************************
 * Internet of Coins                                                          *
 * prototypes.js - string prototypes providing global functionality           *
 * Copyright © 2016 Joachim de Koning, Amadeus de Koning                      *
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

String.prototype.lTrim=function(a){return void 0===a&&(a="s"),this.replace(new RegExp("^["+a+"]+"),"")},String.prototype.rTrim=function(a){return void 0===a&&(a="s"),this.replace(new RegExp("["+a+"]+$"),"")},String.prototype.Trim=function(a){return this.lTrim(a).rTrim(a)},String.prototype.Capitalize=function(){return this.charAt(0).toUpperCase()+this.slice(1)},String.prototype.hashCode=function(){var a,b,c,d=0;if(0==this.length)return d;for(a=0,c=this.length;c>a;a++)b=this.charCodeAt(a),d=(d<<5)-d+b,d|=0;return d},String.prototype.lZero=function(a){var b=this,c=a-b.length+1;return c=c>1?Array(c).join("0"):"",c+b};
