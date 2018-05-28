// generates json login package
//
// (c)2016 metasync r&d / internet of coins

viewname = 'interface.dashboard';
viewtarget = '#hy_frame > .main > .container > .content';

fs = require('fs');
lzma = require('../../lib/crypto/lz-string');

hy_content = ''; // variable to hold package content

// load in the style sheets (only what is really needed)
//hy_content += '<style>'+fs.readFileSync('./css/pure.css')+'</style>';

// load in the page elements to add to DOM
hy_content += fs.readFileSync('./'+viewname+'.html');
hy_content += '<script>';
hy_content += fs.readFileSync('./js/render_utils.js');
hy_content += '</script>';
hy_content += '<script>';
hy_content += fs.readFileSync('./'+viewname+'.js');
hy_content += '</script>';
hy_content += '<script>';
hy_content += fs.readFileSync('./'+viewname+'.ui.js');
hy_content += '</script>';

// encode hy_content using LZMA (file testing shows URL-safe coding uses 10% less kB)
lzma_result = lzma.compressToEncodedURIComponent(hy_content);

// sign LZMA string using server pubkey (or central package signing key?)

// put it all in json key-values
hy_json = { 'info' : 'compressed view', 'target' : viewtarget, 'pack' : lzma_result };

// create login.json, use LastModified flag of server for caching???)
fs.writeFileSync('../'+viewname+'.json',JSON.stringify(hy_json));
