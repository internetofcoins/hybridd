// generates ../index.html (static file to serve ajax calls)
//
// only used server side when code changes
// (we might want to use browserify later)
//

fs = require('fs');

hy_page = ''; // create initial var to generate html string

// opening tags
hy_page += '<html><head>';

// may need to include view-port code in header

// title
hy_page += '<title>Internet of Coins wallet</title>';
hy_page += '<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=0.5, maximum-scale=2.0" content="text/html;charset=UTF-8" />';

// close header open body
hy_page += '</head><body id="body">';

// insert the framework div
hy_page += '<div id="hy_frame"></div>';

// followed by jquery (so to make ajax calls)
hy_page += '<script>'+fs.readFileSync('./jquery-1.12.4.min.js')+'</script>';

// lzma-decompressor
hy_page += '<script>'+fs.readFileSync('../../lib/crypto/lz-string.js')+'</script>';

// and finally the hybrid connector
hy_page += '<script>'+fs.readFileSync('./hy_connect.js')+'</script>';

// UTILS
hy_page += '<script>'+fs.readFileSync('./utils.js')+'</script>';

// RAmda
hy_page += '<script>'+fs.readFileSync('./ramda.min.js')+'</script>';

// RxJS
hy_page += '<script>'+fs.readFileSync('./rx.min.js')+'</script>';
// hy_page += '<script>'+fs.readFileSync('./rx.lite.js')+'</script>';

// COMMON UTILS BETWEEN WEB AND CLI WALLET
hy_page += '<script>'+fs.readFileSync('./../../common/index.js')+'</script>';

// close document
hy_page += '</body></html>';

// write to higher directory file
fs.writeFileSync('../index.html',hy_page);
