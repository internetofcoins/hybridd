/******************************************************************************
 * Internet of Coins                                                          *
 * view.js - dispatcher for view requests                                     *
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

function serve(a){var b={error:0,info:"No view to see here. Please move on."};return xpath.length>1&&(allowed_views=["login","interface","interface.dashboard"],hy_json=fs.readFileSync("../views/"+xpath[1]+".json"),b=JSON.parse(hy_json),console.log(" [i] returning view on request "+JSON.stringify(xpath))),b}fs=require("fs"),exports.serve=serve;
