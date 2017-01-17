var UrlBase64 = (function() {
	var UrlBase64 = {		
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",

		// public method for encoding
		Encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = UrlBase64._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

			}

			return output;
		},

		// public method for decoding
		Decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			if(typeof input != 'undefined') {
				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

				while (i < input.length) {

					enc1 = this._keyStr.indexOf(input.charAt(i++));
					enc2 = this._keyStr.indexOf(input.charAt(i++));
					enc3 = this._keyStr.indexOf(input.charAt(i++));
					enc4 = this._keyStr.indexOf(input.charAt(i++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;

					output = output + String.fromCharCode(chr1);

					if (enc3 != 64) {
						output = output + String.fromCharCode(chr2);
					}
					if (enc4 != 64) {
						output = output + String.fromCharCode(chr3);
					}

				}

				output = UrlBase64._utf8_decode(output);
			} else { output = undefined; }
			
			return output;

		},

		// private method for UTF-8 encoding
		_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		},

		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while ( i < utftext.length ) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		},

		  atob : function (base64) {
			var table = this._keyStr.split("");
			if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
			base64 = base64.replace(/=/g, "");
			var n = base64.length & 3;
			if (n === 1) throw new Error("String contains an invalid character");
			for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
			  var a = _keyStr.indexOf(base64[j++] || "A"), b = _keyStr.indexOf(base64[j++] || "A");
			  var c = _keyStr.indexOf(base64[j++] || "A"), d = _keyStr.indexOf(base64[j++] || "A");
			  if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
			  bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
			  bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
			  bin[bin.length] = ((c << 6) | d) & 255;
			};
			return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
		  },

		  btoa : function (bin) {
			var table = this._keyStr.split("");
			for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
			  var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
			  if ((a | b | c) > 255) throw new Error("String contains an invalid character");
			  base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
									  (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
									  (isNaN(b + c) ? "=" : table[c & 63]);
			}
			return base64.join("");
		  },

		hexToBase64 : function (str) {
		  return btoa(String.fromCharCode.apply(null,
			str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
		  );
		},

		base64ToHex : function (str) {
		  for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
			var tmp = bin.charCodeAt(i).toString(16);
			if (tmp.length === 1) tmp = "0" + tmp;
			hex[hex.length] = tmp;
		  }
		  return hex.join(" ");
		},

		safeCompress : function (input) {
			return UrlBase64.Encode( LZString.compressToEncodedURIComponent(input) );
		},

		safeDecompress : function (input) {
			return LZString.decompressFromEncodedURIComponent( UrlBase64.Decode(input) );
		}

	}
return UrlBase64;

})();

if (typeof define === 'function' && define.amd) {
  define(function () { return UrlBase64; });
} else if( typeof module !== 'undefined' && module != null ) {
  module.exports = UrlBase64;
} else if( typeof angular !== 'undefined' && angular != null ) {
  angular.module('UrlBase64', [])
  .factory('UrlBase64', function () {
    return UrlBase64;
  });
}
