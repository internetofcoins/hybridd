exports.getPeers=getPeers;fs=require("fs");function getPeers(){var hy_response=JSON.parse(fs.readFileSync("../network/peers.json"));console.log(hy_response);return JSON.stringify(hy_response)}
