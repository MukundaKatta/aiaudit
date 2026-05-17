export const id = 485;
export const ids = [485];
export const modules = {

/***/ 973:
/***/ (function(__unused_webpack_module, exports) {


// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Package base64 implements Base64 encoding and decoding.
 */
// Invalid character used in decoding to indicate
// that the character to decode is out of range of
// alphabet and cannot be decoded.
var INVALID_BYTE = 256;
/**
 * Implements standard Base64 encoding.
 *
 * Operates in constant time.
 */
var Coder = /** @class */ (function () {
    // TODO(dchest): methods to encode chunk-by-chunk.
    function Coder(_paddingCharacter) {
        if (_paddingCharacter === void 0) { _paddingCharacter = "="; }
        this._paddingCharacter = _paddingCharacter;
    }
    Coder.prototype.encodedLength = function (length) {
        if (!this._paddingCharacter) {
            return (length * 8 + 5) / 6 | 0;
        }
        return (length + 2) / 3 * 4 | 0;
    };
    Coder.prototype.encode = function (data) {
        var out = "";
        var i = 0;
        for (; i < data.length - 2; i += 3) {
            var c = (data[i] << 16) | (data[i + 1] << 8) | (data[i + 2]);
            out += this._encodeByte((c >>> 3 * 6) & 63);
            out += this._encodeByte((c >>> 2 * 6) & 63);
            out += this._encodeByte((c >>> 1 * 6) & 63);
            out += this._encodeByte((c >>> 0 * 6) & 63);
        }
        var left = data.length - i;
        if (left > 0) {
            var c = (data[i] << 16) | (left === 2 ? data[i + 1] << 8 : 0);
            out += this._encodeByte((c >>> 3 * 6) & 63);
            out += this._encodeByte((c >>> 2 * 6) & 63);
            if (left === 2) {
                out += this._encodeByte((c >>> 1 * 6) & 63);
            }
            else {
                out += this._paddingCharacter || "";
            }
            out += this._paddingCharacter || "";
        }
        return out;
    };
    Coder.prototype.maxDecodedLength = function (length) {
        if (!this._paddingCharacter) {
            return (length * 6 + 7) / 8 | 0;
        }
        return length / 4 * 3 | 0;
    };
    Coder.prototype.decodedLength = function (s) {
        return this.maxDecodedLength(s.length - this._getPaddingLength(s));
    };
    Coder.prototype.decode = function (s) {
        if (s.length === 0) {
            return new Uint8Array(0);
        }
        var paddingLength = this._getPaddingLength(s);
        var length = s.length - paddingLength;
        var out = new Uint8Array(this.maxDecodedLength(length));
        var op = 0;
        var i = 0;
        var haveBad = 0;
        var v0 = 0, v1 = 0, v2 = 0, v3 = 0;
        for (; i < length - 4; i += 4) {
            v0 = this._decodeChar(s.charCodeAt(i + 0));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = (v0 << 2) | (v1 >>> 4);
            out[op++] = (v1 << 4) | (v2 >>> 2);
            out[op++] = (v2 << 6) | v3;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
            haveBad |= v2 & INVALID_BYTE;
            haveBad |= v3 & INVALID_BYTE;
        }
        if (i < length - 1) {
            v0 = this._decodeChar(s.charCodeAt(i));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            out[op++] = (v0 << 2) | (v1 >>> 4);
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
        }
        if (i < length - 2) {
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            out[op++] = (v1 << 4) | (v2 >>> 2);
            haveBad |= v2 & INVALID_BYTE;
        }
        if (i < length - 3) {
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = (v2 << 6) | v3;
            haveBad |= v3 & INVALID_BYTE;
        }
        if (haveBad !== 0) {
            throw new Error("Base64Coder: incorrect characters for decoding");
        }
        return out;
    };
    // Standard encoding have the following encoded/decoded ranges,
    // which we need to convert between.
    //
    // ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789  +   /
    // Index:   0 - 25                    26 - 51              52 - 61   62  63
    // ASCII:  65 - 90                    97 - 122             48 - 57   43  47
    //
    // Encode 6 bits in b into a new character.
    Coder.prototype._encodeByte = function (b) {
        // Encoding uses constant time operations as follows:
        //
        // 1. Define comparison of A with B using (A - B) >>> 8:
        //          if A > B, then result is positive integer
        //          if A <= B, then result is 0
        //
        // 2. Define selection of C or 0 using bitwise AND: X & C:
        //          if X == 0, then result is 0
        //          if X != 0, then result is C
        //
        // 3. Start with the smallest comparison (b >= 0), which is always
        //    true, so set the result to the starting ASCII value (65).
        //
        // 4. Continue comparing b to higher ASCII values, and selecting
        //    zero if comparison isn't true, otherwise selecting a value
        //    to add to result, which:
        //
        //          a) undoes the previous addition
        //          b) provides new value to add
        //
        var result = b;
        // b >= 0
        result += 65;
        // b > 25
        result += ((25 - b) >>> 8) & ((0 - 65) - 26 + 97);
        // b > 51
        result += ((51 - b) >>> 8) & ((26 - 97) - 52 + 48);
        // b > 61
        result += ((61 - b) >>> 8) & ((52 - 48) - 62 + 43);
        // b > 62
        result += ((62 - b) >>> 8) & ((62 - 43) - 63 + 47);
        return String.fromCharCode(result);
    };
    // Decode a character code into a byte.
    // Must return 256 if character is out of alphabet range.
    Coder.prototype._decodeChar = function (c) {
        // Decoding works similar to encoding: using the same comparison
        // function, but now it works on ranges: result is always incremented
        // by value, but this value becomes zero if the range is not
        // satisfied.
        //
        // Decoding starts with invalid value, 256, which is then
        // subtracted when the range is satisfied. If none of the ranges
        // apply, the function returns 256, which is then checked by
        // the caller to throw error.
        var result = INVALID_BYTE; // start with invalid character
        // c == 43 (c > 42 and c < 44)
        result += (((42 - c) & (c - 44)) >>> 8) & (-INVALID_BYTE + c - 43 + 62);
        // c == 47 (c > 46 and c < 48)
        result += (((46 - c) & (c - 48)) >>> 8) & (-INVALID_BYTE + c - 47 + 63);
        // c > 47 and c < 58
        result += (((47 - c) & (c - 58)) >>> 8) & (-INVALID_BYTE + c - 48 + 52);
        // c > 64 and c < 91
        result += (((64 - c) & (c - 91)) >>> 8) & (-INVALID_BYTE + c - 65 + 0);
        // c > 96 and c < 123
        result += (((96 - c) & (c - 123)) >>> 8) & (-INVALID_BYTE + c - 97 + 26);
        return result;
    };
    Coder.prototype._getPaddingLength = function (s) {
        var paddingLength = 0;
        if (this._paddingCharacter) {
            for (var i = s.length - 1; i >= 0; i--) {
                if (s[i] !== this._paddingCharacter) {
                    break;
                }
                paddingLength++;
            }
            if (s.length < 4 || paddingLength > 2) {
                throw new Error("Base64Coder: incorrect padding");
            }
        }
        return paddingLength;
    };
    return Coder;
}());
exports.Coder = Coder;
var stdCoder = new Coder();
function encode(data) {
    return stdCoder.encode(data);
}
exports.encode = encode;
function decode(s) {
    return stdCoder.decode(s);
}
exports.decode = decode;
/**
 * Implements URL-safe Base64 encoding.
 * (Same as Base64, but '+' is replaced with '-', and '/' with '_').
 *
 * Operates in constant time.
 */
var URLSafeCoder = /** @class */ (function (_super) {
    __extends(URLSafeCoder, _super);
    function URLSafeCoder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // URL-safe encoding have the following encoded/decoded ranges:
    //
    // ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789  -   _
    // Index:   0 - 25                    26 - 51              52 - 61   62  63
    // ASCII:  65 - 90                    97 - 122             48 - 57   45  95
    //
    URLSafeCoder.prototype._encodeByte = function (b) {
        var result = b;
        // b >= 0
        result += 65;
        // b > 25
        result += ((25 - b) >>> 8) & ((0 - 65) - 26 + 97);
        // b > 51
        result += ((51 - b) >>> 8) & ((26 - 97) - 52 + 48);
        // b > 61
        result += ((61 - b) >>> 8) & ((52 - 48) - 62 + 45);
        // b > 62
        result += ((62 - b) >>> 8) & ((62 - 45) - 63 + 95);
        return String.fromCharCode(result);
    };
    URLSafeCoder.prototype._decodeChar = function (c) {
        var result = INVALID_BYTE;
        // c == 45 (c > 44 and c < 46)
        result += (((44 - c) & (c - 46)) >>> 8) & (-INVALID_BYTE + c - 45 + 62);
        // c == 95 (c > 94 and c < 96)
        result += (((94 - c) & (c - 96)) >>> 8) & (-INVALID_BYTE + c - 95 + 63);
        // c > 47 and c < 58
        result += (((47 - c) & (c - 58)) >>> 8) & (-INVALID_BYTE + c - 48 + 52);
        // c > 64 and c < 91
        result += (((64 - c) & (c - 91)) >>> 8) & (-INVALID_BYTE + c - 65 + 0);
        // c > 96 and c < 123
        result += (((96 - c) & (c - 123)) >>> 8) & (-INVALID_BYTE + c - 97 + 26);
        return result;
    };
    return URLSafeCoder;
}(Coder));
exports.URLSafeCoder = URLSafeCoder;
var urlSafeCoder = new URLSafeCoder();
function encodeURLSafe(data) {
    return urlSafeCoder.encode(data);
}
exports.encodeURLSafe = encodeURLSafe;
function decodeURLSafe(s) {
    return urlSafeCoder.decode(s);
}
exports.decodeURLSafe = decodeURLSafe;
exports.encodedLength = function (length) {
    return stdCoder.encodedLength(length);
};
exports.maxDecodedLength = function (length) {
    return stdCoder.maxDecodedLength(length);
};
exports.decodedLength = function (s) {
    return stdCoder.decodedLength(s);
};
//# sourceMappingURL=base64.js.map

/***/ }),

/***/ 4887:
/***/ (function(module) {

(function (root, factory) {
    // Hack to make all exports of this module sha256 function object properties.
    var exports = {};
    factory(exports);
    var sha256 = exports["default"];
    for (var k in exports) {
        sha256[k] = exports[k];
    }
        
    if ( true && typeof module.exports === 'object') {
        module.exports = sha256;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return sha256; }); 
    } else {
        root.sha256 = sha256;
    }
})(this, function(exports) {
"use strict";
exports.__esModule = true;
// SHA-256 (+ HMAC and PBKDF2) for JavaScript.
//
// Written in 2014-2016 by Dmitry Chestnykh.
// Public domain, no warranty.
//
// Functions (accept and return Uint8Arrays):
//
//   sha256(message) -> hash
//   sha256.hmac(key, message) -> mac
//   sha256.pbkdf2(password, salt, rounds, dkLen) -> dk
//
//  Classes:
//
//   new sha256.Hash()
//   new sha256.HMAC(key)
//
exports.digestLength = 32;
exports.blockSize = 64;
// SHA-256 constants
var K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
    0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
    0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
    0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
    0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
    0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
    0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
function hashBlocks(w, v, p, pos, len) {
    var a, b, c, d, e, f, g, h, u, i, j, t1, t2;
    while (len >= 64) {
        a = v[0];
        b = v[1];
        c = v[2];
        d = v[3];
        e = v[4];
        f = v[5];
        g = v[6];
        h = v[7];
        for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (((p[j] & 0xff) << 24) | ((p[j + 1] & 0xff) << 16) |
                ((p[j + 2] & 0xff) << 8) | (p[j + 3] & 0xff));
        }
        for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << (32 - 17)) ^ (u >>> 19 | u << (32 - 19)) ^ (u >>> 10);
            u = w[i - 15];
            t2 = (u >>> 7 | u << (32 - 7)) ^ (u >>> 18 | u << (32 - 18)) ^ (u >>> 3);
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
        }
        for (i = 0; i < 64; i++) {
            t1 = (((((e >>> 6 | e << (32 - 6)) ^ (e >>> 11 | e << (32 - 11)) ^
                (e >>> 25 | e << (32 - 25))) + ((e & f) ^ (~e & g))) | 0) +
                ((h + ((K[i] + w[i]) | 0)) | 0)) | 0;
            t2 = (((a >>> 2 | a << (32 - 2)) ^ (a >>> 13 | a << (32 - 13)) ^
                (a >>> 22 | a << (32 - 22))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) | 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) | 0;
        }
        v[0] += a;
        v[1] += b;
        v[2] += c;
        v[3] += d;
        v[4] += e;
        v[5] += f;
        v[6] += g;
        v[7] += h;
        pos += 64;
        len -= 64;
    }
    return pos;
}
// Hash implements SHA256 hash algorithm.
var Hash = /** @class */ (function () {
    function Hash() {
        this.digestLength = exports.digestLength;
        this.blockSize = exports.blockSize;
        // Note: Int32Array is used instead of Uint32Array for performance reasons.
        this.state = new Int32Array(8); // hash state
        this.temp = new Int32Array(64); // temporary state
        this.buffer = new Uint8Array(128); // buffer for data to hash
        this.bufferLength = 0; // number of bytes in buffer
        this.bytesHashed = 0; // number of total bytes hashed
        this.finished = false; // indicates whether the hash was finalized
        this.reset();
    }
    // Resets hash state making it possible
    // to re-use this instance to hash other data.
    Hash.prototype.reset = function () {
        this.state[0] = 0x6a09e667;
        this.state[1] = 0xbb67ae85;
        this.state[2] = 0x3c6ef372;
        this.state[3] = 0xa54ff53a;
        this.state[4] = 0x510e527f;
        this.state[5] = 0x9b05688c;
        this.state[6] = 0x1f83d9ab;
        this.state[7] = 0x5be0cd19;
        this.bufferLength = 0;
        this.bytesHashed = 0;
        this.finished = false;
        return this;
    };
    // Cleans internal buffers and re-initializes hash state.
    Hash.prototype.clean = function () {
        for (var i = 0; i < this.buffer.length; i++) {
            this.buffer[i] = 0;
        }
        for (var i = 0; i < this.temp.length; i++) {
            this.temp[i] = 0;
        }
        this.reset();
    };
    // Updates hash state with the given data.
    //
    // Optionally, length of the data can be specified to hash
    // fewer bytes than data.length.
    //
    // Throws error when trying to update already finalized hash:
    // instance must be reset to use it again.
    Hash.prototype.update = function (data, dataLength) {
        if (dataLength === void 0) { dataLength = data.length; }
        if (this.finished) {
            throw new Error("SHA256: can't update because hash was finished.");
        }
        var dataPos = 0;
        this.bytesHashed += dataLength;
        if (this.bufferLength > 0) {
            while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
            }
            if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
            }
        }
        if (dataLength >= 64) {
            dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
            dataLength %= 64;
        }
        while (dataLength > 0) {
            this.buffer[this.bufferLength++] = data[dataPos++];
            dataLength--;
        }
        return this;
    };
    // Finalizes hash state and puts hash into out.
    //
    // If hash was already finalized, puts the same value.
    Hash.prototype.finish = function (out) {
        if (!this.finished) {
            var bytesHashed = this.bytesHashed;
            var left = this.bufferLength;
            var bitLenHi = (bytesHashed / 0x20000000) | 0;
            var bitLenLo = bytesHashed << 3;
            var padLength = (bytesHashed % 64 < 56) ? 64 : 128;
            this.buffer[left] = 0x80;
            for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
            }
            this.buffer[padLength - 8] = (bitLenHi >>> 24) & 0xff;
            this.buffer[padLength - 7] = (bitLenHi >>> 16) & 0xff;
            this.buffer[padLength - 6] = (bitLenHi >>> 8) & 0xff;
            this.buffer[padLength - 5] = (bitLenHi >>> 0) & 0xff;
            this.buffer[padLength - 4] = (bitLenLo >>> 24) & 0xff;
            this.buffer[padLength - 3] = (bitLenLo >>> 16) & 0xff;
            this.buffer[padLength - 2] = (bitLenLo >>> 8) & 0xff;
            this.buffer[padLength - 1] = (bitLenLo >>> 0) & 0xff;
            hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
            this.finished = true;
        }
        for (var i = 0; i < 8; i++) {
            out[i * 4 + 0] = (this.state[i] >>> 24) & 0xff;
            out[i * 4 + 1] = (this.state[i] >>> 16) & 0xff;
            out[i * 4 + 2] = (this.state[i] >>> 8) & 0xff;
            out[i * 4 + 3] = (this.state[i] >>> 0) & 0xff;
        }
        return this;
    };
    // Returns the final hash digest.
    Hash.prototype.digest = function () {
        var out = new Uint8Array(this.digestLength);
        this.finish(out);
        return out;
    };
    // Internal function for use in HMAC for optimization.
    Hash.prototype._saveState = function (out) {
        for (var i = 0; i < this.state.length; i++) {
            out[i] = this.state[i];
        }
    };
    // Internal function for use in HMAC for optimization.
    Hash.prototype._restoreState = function (from, bytesHashed) {
        for (var i = 0; i < this.state.length; i++) {
            this.state[i] = from[i];
        }
        this.bytesHashed = bytesHashed;
        this.finished = false;
        this.bufferLength = 0;
    };
    return Hash;
}());
exports.Hash = Hash;
// HMAC implements HMAC-SHA256 message authentication algorithm.
var HMAC = /** @class */ (function () {
    function HMAC(key) {
        this.inner = new Hash();
        this.outer = new Hash();
        this.blockSize = this.inner.blockSize;
        this.digestLength = this.inner.digestLength;
        var pad = new Uint8Array(this.blockSize);
        if (key.length > this.blockSize) {
            (new Hash()).update(key).finish(pad).clean();
        }
        else {
            for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
            }
        }
        for (var i = 0; i < pad.length; i++) {
            pad[i] ^= 0x36;
        }
        this.inner.update(pad);
        for (var i = 0; i < pad.length; i++) {
            pad[i] ^= 0x36 ^ 0x5c;
        }
        this.outer.update(pad);
        this.istate = new Uint32Array(8);
        this.ostate = new Uint32Array(8);
        this.inner._saveState(this.istate);
        this.outer._saveState(this.ostate);
        for (var i = 0; i < pad.length; i++) {
            pad[i] = 0;
        }
    }
    // Returns HMAC state to the state initialized with key
    // to make it possible to run HMAC over the other data with the same
    // key without creating a new instance.
    HMAC.prototype.reset = function () {
        this.inner._restoreState(this.istate, this.inner.blockSize);
        this.outer._restoreState(this.ostate, this.outer.blockSize);
        return this;
    };
    // Cleans HMAC state.
    HMAC.prototype.clean = function () {
        for (var i = 0; i < this.istate.length; i++) {
            this.ostate[i] = this.istate[i] = 0;
        }
        this.inner.clean();
        this.outer.clean();
    };
    // Updates state with provided data.
    HMAC.prototype.update = function (data) {
        this.inner.update(data);
        return this;
    };
    // Finalizes HMAC and puts the result in out.
    HMAC.prototype.finish = function (out) {
        if (this.outer.finished) {
            this.outer.finish(out);
        }
        else {
            this.inner.finish(out);
            this.outer.update(out, this.digestLength).finish(out);
        }
        return this;
    };
    // Returns message authentication code.
    HMAC.prototype.digest = function () {
        var out = new Uint8Array(this.digestLength);
        this.finish(out);
        return out;
    };
    return HMAC;
}());
exports.HMAC = HMAC;
// Returns SHA256 hash of data.
function hash(data) {
    var h = (new Hash()).update(data);
    var digest = h.digest();
    h.clean();
    return digest;
}
exports.hash = hash;
// Function hash is both available as module.hash and as default export.
exports["default"] = hash;
// Returns HMAC-SHA256 of data under the key.
function hmac(key, data) {
    var h = (new HMAC(key)).update(data);
    var digest = h.digest();
    h.clean();
    return digest;
}
exports.hmac = hmac;
// Fills hkdf buffer like this:
// T(1) = HMAC-Hash(PRK, T(0) | info | 0x01)
function fillBuffer(buffer, hmac, info, counter) {
    // Counter is a byte value: check if it overflowed.
    var num = counter[0];
    if (num === 0) {
        throw new Error("hkdf: cannot expand more");
    }
    // Prepare HMAC instance for new data with old key.
    hmac.reset();
    // Hash in previous output if it was generated
    // (i.e. counter is greater than 1).
    if (num > 1) {
        hmac.update(buffer);
    }
    // Hash in info if it exists.
    if (info) {
        hmac.update(info);
    }
    // Hash in the counter.
    hmac.update(counter);
    // Output result to buffer and clean HMAC instance.
    hmac.finish(buffer);
    // Increment counter inside typed array, this works properly.
    counter[0]++;
}
var hkdfSalt = new Uint8Array(exports.digestLength); // Filled with zeroes.
function hkdf(key, salt, info, length) {
    if (salt === void 0) { salt = hkdfSalt; }
    if (length === void 0) { length = 32; }
    var counter = new Uint8Array([1]);
    // HKDF-Extract uses salt as HMAC key, and key as data.
    var okm = hmac(salt, key);
    // Initialize HMAC for expanding with extracted key.
    // Ensure no collisions with `hmac` function.
    var hmac_ = new HMAC(okm);
    // Allocate buffer.
    var buffer = new Uint8Array(hmac_.digestLength);
    var bufpos = buffer.length;
    var out = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        if (bufpos === buffer.length) {
            fillBuffer(buffer, hmac_, info, counter);
            bufpos = 0;
        }
        out[i] = buffer[bufpos++];
    }
    hmac_.clean();
    buffer.fill(0);
    counter.fill(0);
    return out;
}
exports.hkdf = hkdf;
// Derives a key from password and salt using PBKDF2-HMAC-SHA256
// with the given number of iterations.
//
// The number of bytes returned is equal to dkLen.
//
// (For better security, avoid dkLen greater than hash length - 32 bytes).
function pbkdf2(password, salt, iterations, dkLen) {
    var prf = new HMAC(password);
    var len = prf.digestLength;
    var ctr = new Uint8Array(4);
    var t = new Uint8Array(len);
    var u = new Uint8Array(len);
    var dk = new Uint8Array(dkLen);
    for (var i = 0; i * len < dkLen; i++) {
        var c = i + 1;
        ctr[0] = (c >>> 24) & 0xff;
        ctr[1] = (c >>> 16) & 0xff;
        ctr[2] = (c >>> 8) & 0xff;
        ctr[3] = (c >>> 0) & 0xff;
        prf.reset();
        prf.update(salt);
        prf.update(ctr);
        prf.finish(u);
        for (var j = 0; j < len; j++) {
            t[j] = u[j];
        }
        for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
                t[k] ^= u[k];
            }
        }
        for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
        }
    }
    for (var i = 0; i < len; i++) {
        t[i] = u[i] = 0;
    }
    for (var i = 0; i < 4; i++) {
        ctr[i] = 0;
    }
    prf.clean();
    return dk;
}
exports.pbkdf2 = pbkdf2;
});


/***/ }),

/***/ 5487:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.KD = __webpack_unused_export__ = void 0;
const timing_safe_equal_1 = __webpack_require__(2514);
const base64 = __webpack_require__(973);
const sha256 = __webpack_require__(4887);
const WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
class ExtendableError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, ExtendableError.prototype);
        this.name = "ExtendableError";
        this.stack = new Error(message).stack;
    }
}
class WebhookVerificationError extends ExtendableError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, WebhookVerificationError.prototype);
        this.name = "WebhookVerificationError";
    }
}
__webpack_unused_export__ = WebhookVerificationError;
class Webhook {
    constructor(secret, options) {
        if (!secret) {
            throw new Error("Secret can't be empty.");
        }
        if ((options === null || options === void 0 ? void 0 : options.format) === "raw") {
            if (secret instanceof Uint8Array) {
                this.key = secret;
            }
            else {
                this.key = Uint8Array.from(secret, (c) => c.charCodeAt(0));
            }
        }
        else {
            if (typeof secret !== "string") {
                throw new Error("Expected secret to be of type string");
            }
            if (secret.startsWith(Webhook.prefix)) {
                secret = secret.substring(Webhook.prefix.length);
            }
            this.key = base64.decode(secret);
        }
    }
    verify(payload, headers_) {
        const headers = {};
        for (const key of Object.keys(headers_)) {
            headers[key.toLowerCase()] = headers_[key];
        }
        const msgId = headers["webhook-id"];
        const msgSignature = headers["webhook-signature"];
        const msgTimestamp = headers["webhook-timestamp"];
        if (!msgSignature || !msgId || !msgTimestamp) {
            throw new WebhookVerificationError("Missing required headers");
        }
        const timestamp = this.verifyTimestamp(msgTimestamp);
        const computedSignature = this.sign(msgId, timestamp, payload);
        const expectedSignature = computedSignature.split(",")[1];
        const passedSignatures = msgSignature.split(" ");
        const encoder = new globalThis.TextEncoder();
        for (const versionedSignature of passedSignatures) {
            const [version, signature] = versionedSignature.split(",");
            if (version !== "v1") {
                continue;
            }
            if ((0, timing_safe_equal_1.timingSafeEqual)(encoder.encode(signature), encoder.encode(expectedSignature))) {
                return JSON.parse(payload.toString());
            }
        }
        throw new WebhookVerificationError("No matching signature found");
    }
    sign(msgId, timestamp, payload) {
        if (typeof payload === "string") {
        }
        else if (payload.constructor.name === "Buffer") {
            payload = payload.toString();
        }
        else {
            throw new Error("Expected payload to be of type string or Buffer.");
        }
        const encoder = new TextEncoder();
        const timestampNumber = Math.floor(timestamp.getTime() / 1000);
        const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
        const expectedSignature = base64.encode(sha256.hmac(this.key, toSign));
        return `v1,${expectedSignature}`;
    }
    verifyTimestamp(timestampHeader) {
        const now = Math.floor(Date.now() / 1000);
        const timestamp = parseInt(timestampHeader, 10);
        if (isNaN(timestamp)) {
            throw new WebhookVerificationError("Invalid Signature Headers");
        }
        if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
            throw new WebhookVerificationError("Message timestamp too old");
        }
        if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
            throw new WebhookVerificationError("Message timestamp too new");
        }
        return new Date(timestamp * 1000);
    }
}
exports.KD = Webhook;
Webhook.prefix = "whsec_";
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 2514:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.timingSafeEqual = void 0;
function assert(expr, msg = "") {
    if (!expr) {
        throw new Error(msg);
    }
}
function timingSafeEqual(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    if (!(a instanceof DataView)) {
        a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
    }
    if (!(b instanceof DataView)) {
        b = new DataView(ArrayBuffer.isView(b) ? b.buffer : b);
    }
    assert(a instanceof DataView);
    assert(b instanceof DataView);
    const length = a.byteLength;
    let out = 0;
    let i = -1;
    while (++i < length) {
        out |= a.getUint8(i) ^ b.getUint8(i);
    }
    return out === 0;
}
exports.timingSafeEqual = timingSafeEqual;
//# sourceMappingURL=timing_safe_equal.js.map

/***/ }),

/***/ 1485:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  AI_PROMPT: () => (/* reexport */ AI_PROMPT),
  APIConnectionError: () => (/* reexport */ APIConnectionError),
  APIConnectionTimeoutError: () => (/* reexport */ APIConnectionTimeoutError),
  APIError: () => (/* reexport */ APIError),
  APIPromise: () => (/* reexport */ APIPromise),
  APIUserAbortError: () => (/* reexport */ APIUserAbortError),
  Anthropic: () => (/* reexport */ Anthropic),
  AnthropicError: () => (/* reexport */ error_AnthropicError),
  AuthenticationError: () => (/* reexport */ AuthenticationError),
  BadRequestError: () => (/* reexport */ BadRequestError),
  BaseAnthropic: () => (/* reexport */ BaseAnthropic),
  ConflictError: () => (/* reexport */ ConflictError),
  HUMAN_PROMPT: () => (/* reexport */ HUMAN_PROMPT),
  InternalServerError: () => (/* reexport */ InternalServerError),
  NotFoundError: () => (/* reexport */ NotFoundError),
  PagePromise: () => (/* reexport */ PagePromise),
  PermissionDeniedError: () => (/* reexport */ PermissionDeniedError),
  RateLimitError: () => (/* reexport */ RateLimitError),
  UnprocessableEntityError: () => (/* reexport */ UnprocessableEntityError),
  "default": () => (/* reexport */ Anthropic),
  toFile: () => (/* reexport */ toFile)
});

;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/tslib.mjs
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m")
        throw new TypeError("Private method is not writable");
    if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}


;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/uuid.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * https://stackoverflow.com/a/2117523
 */
let uuid4 = function () {
    const { crypto } = globalThis;
    if (crypto?.randomUUID) {
        uuid4 = crypto.randomUUID.bind(crypto);
        return crypto.randomUUID();
    }
    const u8 = new Uint8Array(1);
    const randomByte = crypto ? () => crypto.getRandomValues(u8)[0] : () => (Math.random() * 0xff) & 0xff;
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (+c ^ (randomByte() & (15 >> (+c / 4)))).toString(16));
};
//# sourceMappingURL=uuid.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/errors.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
function isAbortError(err) {
    return (typeof err === 'object' &&
        err !== null &&
        // Spec-compliant fetch implementations
        (('name' in err && err.name === 'AbortError') ||
            // Expo fetch
            ('message' in err && String(err.message).includes('FetchRequestCanceledException'))));
}
const castToError = (err) => {
    if (err instanceof Error)
        return err;
    if (typeof err === 'object' && err !== null) {
        try {
            if (Object.prototype.toString.call(err) === '[object Error]') {
                // @ts-ignore - not all envs have native support for cause yet
                const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
                if (err.stack)
                    error.stack = err.stack;
                // @ts-ignore - not all envs have native support for cause yet
                if (err.cause && !error.cause)
                    error.cause = err.cause;
                if (err.name)
                    error.name = err.name;
                return error;
            }
        }
        catch { }
        try {
            return new Error(JSON.stringify(err));
        }
        catch { }
    }
    return new Error(err);
};
//# sourceMappingURL=errors.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/core/error.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

class error_AnthropicError extends Error {
}
class APIError extends error_AnthropicError {
    constructor(status, error, message, headers, type) {
        super(`${APIError.makeMessage(status, error, message)}`);
        this.status = status;
        this.headers = headers;
        this.requestID = headers?.get('request-id');
        this.error = error;
        this.type = type ?? null;
    }
    static makeMessage(status, error, message) {
        const msg = error?.message ?
            typeof error.message === 'string' ?
                error.message
                : JSON.stringify(error.message)
            : error ? JSON.stringify(error)
                : message;
        if (status && msg) {
            return `${status} ${msg}`;
        }
        if (status) {
            return `${status} status code (no body)`;
        }
        if (msg) {
            return msg;
        }
        return '(no status code or body)';
    }
    static generate(status, errorResponse, message, headers) {
        if (!status || !headers) {
            return new APIConnectionError({ message, cause: castToError(errorResponse) });
        }
        const error = errorResponse;
        const type = error?.['error']?.['type'];
        if (status === 400) {
            return new BadRequestError(status, error, message, headers, type);
        }
        if (status === 401) {
            return new AuthenticationError(status, error, message, headers, type);
        }
        if (status === 403) {
            return new PermissionDeniedError(status, error, message, headers, type);
        }
        if (status === 404) {
            return new NotFoundError(status, error, message, headers, type);
        }
        if (status === 409) {
            return new ConflictError(status, error, message, headers, type);
        }
        if (status === 422) {
            return new UnprocessableEntityError(status, error, message, headers, type);
        }
        if (status === 429) {
            return new RateLimitError(status, error, message, headers, type);
        }
        if (status >= 500) {
            return new InternalServerError(status, error, message, headers, type);
        }
        return new APIError(status, error, message, headers, type);
    }
}
class APIUserAbortError extends APIError {
    constructor({ message } = {}) {
        super(undefined, undefined, message || 'Request was aborted.', undefined);
    }
}
class APIConnectionError extends APIError {
    constructor({ message, cause }) {
        super(undefined, undefined, message || 'Connection error.', undefined);
        // in some environments the 'cause' property is already declared
        // @ts-ignore
        if (cause)
            this.cause = cause;
    }
}
class APIConnectionTimeoutError extends APIConnectionError {
    constructor({ message } = {}) {
        super({ message: message ?? 'Request timed out.' });
    }
}
class BadRequestError extends APIError {
}
class AuthenticationError extends APIError {
}
class PermissionDeniedError extends APIError {
}
class NotFoundError extends APIError {
}
class ConflictError extends APIError {
}
class UnprocessableEntityError extends APIError {
}
class RateLimitError extends APIError {
}
class InternalServerError extends APIError {
}
//# sourceMappingURL=error.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/values.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

// https://url.spec.whatwg.org/#url-scheme-string
const startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
const isAbsoluteURL = (url) => {
    return startsWithSchemeRegexp.test(url);
};
let values_isArray = (val) => ((values_isArray = Array.isArray), values_isArray(val));
let isReadonlyArray = values_isArray;
/** Returns an object if the given value isn't an object, otherwise returns as-is */
function maybeObj(x) {
    if (typeof x !== 'object') {
        return {};
    }
    return x ?? {};
}
// https://stackoverflow.com/a/34491287
function isEmptyObj(obj) {
    if (!obj)
        return true;
    for (const _k in obj)
        return false;
    return true;
}
// https://eslint.org/docs/latest/rules/no-prototype-builtins
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
    return obj != null && typeof obj === 'object' && !Array.isArray(obj);
}
const ensurePresent = (value) => {
    if (value == null) {
        throw new AnthropicError(`Expected a value to be given but received ${value} instead.`);
    }
    return value;
};
const validatePositiveInteger = (name, n) => {
    if (typeof n !== 'number' || !Number.isInteger(n)) {
        throw new error_AnthropicError(`${name} must be an integer`);
    }
    if (n < 0) {
        throw new error_AnthropicError(`${name} must be a positive integer`);
    }
    return n;
};
const coerceInteger = (value) => {
    if (typeof value === 'number')
        return Math.round(value);
    if (typeof value === 'string')
        return parseInt(value, 10);
    throw new AnthropicError(`Could not coerce ${value} (type: ${typeof value}) into a number`);
};
const coerceFloat = (value) => {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string')
        return parseFloat(value);
    throw new AnthropicError(`Could not coerce ${value} (type: ${typeof value}) into a number`);
};
const coerceBoolean = (value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string')
        return value === 'true';
    return Boolean(value);
};
const maybeCoerceInteger = (value) => {
    if (value == null) {
        return undefined;
    }
    return coerceInteger(value);
};
const maybeCoerceFloat = (value) => {
    if (value == null) {
        return undefined;
    }
    return coerceFloat(value);
};
const maybeCoerceBoolean = (value) => {
    if (value == null) {
        return undefined;
    }
    return coerceBoolean(value);
};
const safeJSON = (text) => {
    try {
        return JSON.parse(text);
    }
    catch (err) {
        return undefined;
    }
};
// Gets a value from an object, deletes the key, and returns the value (or undefined if not found)
const pop = (obj, key) => {
    const value = obj[key];
    delete obj[key];
    return value;
};
//# sourceMappingURL=values.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/sleep.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//# sourceMappingURL=sleep.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/version.mjs
const VERSION = '0.96.0'; // x-release-please-version
//# sourceMappingURL=version.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

const isRunningInBrowser = () => {
    return (
    // @ts-ignore
    typeof window !== 'undefined' &&
        // @ts-ignore
        typeof window.document !== 'undefined' &&
        // @ts-ignore
        typeof navigator !== 'undefined');
};
/**
 * Note this does not detect 'browser'; for that, use getBrowserInfo().
 */
function getDetectedPlatform() {
    if (typeof Deno !== 'undefined' && Deno.build != null) {
        return 'deno';
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return 'edge';
    }
    if (Object.prototype.toString.call(typeof globalThis.process !== 'undefined' ? globalThis.process : 0) === '[object process]') {
        return 'node';
    }
    return 'unknown';
}
const getPlatformProperties = () => {
    const detectedPlatform = getDetectedPlatform();
    if (detectedPlatform === 'deno') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': normalizePlatform(Deno.build.os),
            'X-Stainless-Arch': normalizeArch(Deno.build.arch),
            'X-Stainless-Runtime': 'deno',
            'X-Stainless-Runtime-Version': typeof Deno.version === 'string' ? Deno.version : Deno.version?.deno ?? 'unknown',
        };
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': `other:${EdgeRuntime}`,
            'X-Stainless-Runtime': 'edge',
            'X-Stainless-Runtime-Version': globalThis.process.version,
        };
    }
    // Check if Node.js
    if (detectedPlatform === 'node') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': normalizePlatform(globalThis.process.platform ?? 'unknown'),
            'X-Stainless-Arch': normalizeArch(globalThis.process.arch ?? 'unknown'),
            'X-Stainless-Runtime': 'node',
            'X-Stainless-Runtime-Version': globalThis.process.version ?? 'unknown',
        };
    }
    const browserInfo = getBrowserInfo();
    if (browserInfo) {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': 'unknown',
            'X-Stainless-Runtime': `browser:${browserInfo.browser}`,
            'X-Stainless-Runtime-Version': browserInfo.version,
        };
    }
    // TODO add support for Cloudflare workers, etc.
    return {
        'X-Stainless-Lang': 'js',
        'X-Stainless-Package-Version': VERSION,
        'X-Stainless-OS': 'Unknown',
        'X-Stainless-Arch': 'unknown',
        'X-Stainless-Runtime': 'unknown',
        'X-Stainless-Runtime-Version': 'unknown',
    };
};
// Note: modified from https://github.com/JS-DevTools/host-environment/blob/b1ab79ecde37db5d6e163c050e54fe7d287d7c92/src/isomorphic.browser.ts
function getBrowserInfo() {
    if (typeof navigator === 'undefined' || !navigator) {
        return null;
    }
    // NOTE: The order matters here!
    const browserPatterns = [
        { key: 'edge', pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'ie', pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'ie', pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'chrome', pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'firefox', pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'safari', pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ },
    ];
    // Find the FIRST matching browser
    for (const { key, pattern } of browserPatterns) {
        const match = pattern.exec(navigator.userAgent);
        if (match) {
            const major = match[1] || 0;
            const minor = match[2] || 0;
            const patch = match[3] || 0;
            return { browser: key, version: `${major}.${minor}.${patch}` };
        }
    }
    return null;
}
const normalizeArch = (arch) => {
    // Node docs:
    // - https://nodejs.org/api/process.html#processarch
    // Deno docs:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    if (arch === 'x32')
        return 'x32';
    if (arch === 'x86_64' || arch === 'x64')
        return 'x64';
    if (arch === 'arm')
        return 'arm';
    if (arch === 'aarch64' || arch === 'arm64')
        return 'arm64';
    if (arch)
        return `other:${arch}`;
    return 'unknown';
};
const normalizePlatform = (platform) => {
    // Node platforms:
    // - https://nodejs.org/api/process.html#processplatform
    // Deno platforms:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    // - https://github.com/denoland/deno/issues/14799
    platform = platform.toLowerCase();
    // NOTE: this iOS check is untested and may not work
    // Node does not work natively on IOS, there is a fork at
    // https://github.com/nodejs-mobile/nodejs-mobile
    // however it is unknown at the time of writing how to detect if it is running
    if (platform.includes('ios'))
        return 'iOS';
    if (platform === 'android')
        return 'Android';
    if (platform === 'darwin')
        return 'MacOS';
    if (platform === 'win32')
        return 'Windows';
    if (platform === 'freebsd')
        return 'FreeBSD';
    if (platform === 'openbsd')
        return 'OpenBSD';
    if (platform === 'linux')
        return 'Linux';
    if (platform)
        return `Other:${platform}`;
    return 'Unknown';
};
let _platformHeaders;
const getPlatformHeaders = () => {
    return (_platformHeaders ?? (_platformHeaders = getPlatformProperties()));
};
//# sourceMappingURL=detect-platform.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/shims.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
function getDefaultFetch() {
    if (typeof fetch !== 'undefined') {
        return fetch;
    }
    throw new Error('`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`');
}
function makeReadableStream(...args) {
    const ReadableStream = globalThis.ReadableStream;
    if (typeof ReadableStream === 'undefined') {
        // Note: All of the platforms / runtimes we officially support already define
        // `ReadableStream` as a global, so this should only ever be hit on unsupported runtimes.
        throw new Error('`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`');
    }
    return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
    let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
    return makeReadableStream({
        start() { },
        async pull(controller) {
            const { done, value } = await iter.next();
            if (done) {
                controller.close();
            }
            else {
                controller.enqueue(value);
            }
        },
        async cancel() {
            await iter.return?.();
        },
    });
}
/**
 * Most browsers don't yet have async iterable support for ReadableStream,
 * and Node has a very different way of reading bytes from its "ReadableStream".
 *
 * This polyfill was pulled from https://github.com/MattiasBuelens/web-streams-polyfill/pull/122#issuecomment-1627354490
 */
function ReadableStreamToAsyncIterable(stream) {
    if (stream[Symbol.asyncIterator])
        return stream;
    const reader = stream.getReader();
    return {
        async next() {
            try {
                const result = await reader.read();
                if (result?.done)
                    reader.releaseLock(); // release lock when stream becomes closed
                return result;
            }
            catch (e) {
                reader.releaseLock(); // release lock when stream becomes errored
                throw e;
            }
        },
        async return() {
            const cancelPromise = reader.cancel();
            reader.releaseLock();
            await cancelPromise;
            return { done: true, value: undefined };
        },
        [Symbol.asyncIterator]() {
            return this;
        },
    };
}
/**
 * Cancels a ReadableStream we don't need to consume.
 * See https://undici.nodejs.org/#/?id=garbage-collection
 */
async function CancelReadableStream(stream) {
    if (stream === null || typeof stream !== 'object')
        return;
    if (stream[Symbol.asyncIterator]) {
        await stream[Symbol.asyncIterator]().return?.();
        return;
    }
    const reader = stream.getReader();
    const cancelPromise = reader.cancel();
    reader.releaseLock();
    await cancelPromise;
}
//# sourceMappingURL=shims.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/request-options.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
const FallbackEncoder = ({ headers, body }) => {
    return {
        bodyHeaders: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    };
};
//# sourceMappingURL=request-options.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/qs/formats.mjs
const default_format = 'RFC3986';
const default_formatter = (v) => String(v);
const formatters = {
    RFC1738: (v) => String(v).replace(/%20/g, '+'),
    RFC3986: default_formatter,
};
const RFC1738 = 'RFC1738';
const RFC3986 = 'RFC3986';
//# sourceMappingURL=formats.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/qs/utils.mjs


let has = (obj, key) => ((has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
    has(obj, key));
const hex_table = /* @__PURE__ */ (() => {
    const array = [];
    for (let i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }
    return array;
})();
function compact_queue(queue) {
    while (queue.length > 1) {
        const item = queue.pop();
        if (!item)
            continue;
        const obj = item.obj[item.prop];
        if (isArray(obj)) {
            const compacted = [];
            for (let j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }
            // @ts-ignore
            item.obj[item.prop] = compacted;
        }
    }
}
function array_to_object(source, options) {
    const obj = options && options.plainObjects ? Object.create(null) : {};
    for (let i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }
    return obj;
}
function merge(target, source, options = {}) {
    if (!source) {
        return target;
    }
    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        }
        else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has(Object.prototype, source)) {
                target[source] = true;
            }
        }
        else {
            return [target, source];
        }
        return target;
    }
    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }
    let mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        // @ts-ignore
        mergeTarget = array_to_object(target, options);
    }
    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has(target, i)) {
                const targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                }
                else {
                    target.push(item);
                }
            }
            else {
                target[i] = item;
            }
        });
        return target;
    }
    return Object.keys(source).reduce(function (acc, key) {
        const value = source[key];
        if (has(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
}
function assign_single_source(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
}
function decode(str, _, charset) {
    const strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    }
    catch (e) {
        return strWithoutPlus;
    }
}
const limit = 1024;
const encode = (str, _defaultEncoder, charset, _kind, format) => {
    // This code was originally written by Brian White for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }
    let string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    }
    else if (typeof str !== 'string') {
        string = String(str);
    }
    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }
    let out = '';
    for (let j = 0; j < string.length; j += limit) {
        const segment = string.length >= limit ? string.slice(j, j + limit) : string;
        const arr = [];
        for (let i = 0; i < segment.length; ++i) {
            let c = segment.charCodeAt(i);
            if (c === 0x2d || // -
                c === 0x2e || // .
                c === 0x5f || // _
                c === 0x7e || // ~
                (c >= 0x30 && c <= 0x39) || // 0-9
                (c >= 0x41 && c <= 0x5a) || // a-z
                (c >= 0x61 && c <= 0x7a) || // A-Z
                (format === RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                arr[arr.length] = segment.charAt(i);
                continue;
            }
            if (c < 0x80) {
                arr[arr.length] = hex_table[c];
                continue;
            }
            if (c < 0x800) {
                arr[arr.length] = hex_table[0xc0 | (c >> 6)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            if (c < 0xd800 || c >= 0xe000) {
                arr[arr.length] =
                    hex_table[0xe0 | (c >> 12)] + hex_table[0x80 | ((c >> 6) & 0x3f)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            i += 1;
            c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));
            arr[arr.length] =
                hex_table[0xf0 | (c >> 18)] +
                    hex_table[0x80 | ((c >> 12) & 0x3f)] +
                    hex_table[0x80 | ((c >> 6) & 0x3f)] +
                    hex_table[0x80 | (c & 0x3f)];
        }
        out += arr.join('');
    }
    return out;
};
function compact(value) {
    const queue = [{ obj: { o: value }, prop: 'o' }];
    const refs = [];
    for (let i = 0; i < queue.length; ++i) {
        const item = queue[i];
        // @ts-ignore
        const obj = item.obj[item.prop];
        const keys = Object.keys(obj);
        for (let j = 0; j < keys.length; ++j) {
            const key = keys[j];
            const val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }
    compact_queue(queue);
    return value;
}
function is_regexp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}
function is_buffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function combine(a, b) {
    return [].concat(a, b);
}
function maybe_map(val, fn) {
    if (values_isArray(val)) {
        const mapped = [];
        for (let i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
}
//# sourceMappingURL=utils.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/qs/stringify.mjs



const array_prefix_generators = {
    brackets(prefix) {
        return String(prefix) + '[]';
    },
    comma: 'comma',
    indices(prefix, key) {
        return String(prefix) + '[' + key + ']';
    },
    repeat(prefix) {
        return String(prefix);
    },
};
const push_to_array = function (arr, value_or_array) {
    Array.prototype.push.apply(arr, values_isArray(value_or_array) ? value_or_array : [value_or_array]);
};
let toISOString;
const defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: encode,
    encodeValuesOnly: false,
    format: default_format,
    formatter: default_formatter,
    /** @deprecated */
    indices: false,
    serializeDate(date) {
        return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date);
    },
    skipNulls: false,
    strictNullHandling: false,
};
function is_non_nullish_primitive(v) {
    return (typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        typeof v === 'symbol' ||
        typeof v === 'bigint');
}
const sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
    let obj = object;
    let tmp_sc = sideChannel;
    let step = 0;
    let find_flag = false;
    while ((tmp_sc = tmp_sc.get(sentinel)) !== void undefined && !find_flag) {
        // Where object last appeared in the ref tree
        const pos = tmp_sc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            }
            else {
                find_flag = true; // Break while
            }
        }
        if (typeof tmp_sc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    }
    else if (obj instanceof Date) {
        obj = serializeDate?.(obj);
    }
    else if (generateArrayPrefix === 'comma' && values_isArray(obj)) {
        obj = maybe_map(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate?.(value);
            }
            return value;
        });
    }
    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ?
                // @ts-expect-error
                encoder(prefix, defaults.encoder, charset, 'key', format)
                : prefix;
        }
        obj = '';
    }
    if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
        if (encoder) {
            const key_value = encodeValuesOnly ? prefix
                // @ts-expect-error
                : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [
                formatter?.(key_value) +
                    '=' +
                    // @ts-expect-error
                    formatter?.(encoder(obj, defaults.encoder, charset, 'value', format)),
            ];
        }
        return [formatter?.(prefix) + '=' + formatter?.(String(obj))];
    }
    const values = [];
    if (typeof obj === 'undefined') {
        return values;
    }
    let obj_keys;
    if (generateArrayPrefix === 'comma' && values_isArray(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            // @ts-expect-error values only
            obj = maybe_map(obj, encoder);
        }
        obj_keys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    }
    else if (values_isArray(filter)) {
        obj_keys = filter;
    }
    else {
        const keys = Object.keys(obj);
        obj_keys = sort ? keys.sort(sort) : keys;
    }
    const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);
    const adjusted_prefix = commaRoundTrip && values_isArray(obj) && obj.length === 1 ? encoded_prefix + '[]' : encoded_prefix;
    if (allowEmptyArrays && values_isArray(obj) && obj.length === 0) {
        return adjusted_prefix + '[]';
    }
    for (let j = 0; j < obj_keys.length; ++j) {
        const key = obj_keys[j];
        const value = 
        // @ts-ignore
        typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];
        if (skipNulls && value === null) {
            continue;
        }
        // @ts-ignore
        const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, '%2E') : key;
        const key_prefix = values_isArray(obj) ?
            typeof generateArrayPrefix === 'function' ?
                generateArrayPrefix(adjusted_prefix, encoded_key)
                : adjusted_prefix
            : adjusted_prefix + (allowDots ? '.' + encoded_key : '[' + encoded_key + ']');
        sideChannel.set(object, step);
        const valueSideChannel = new WeakMap();
        valueSideChannel.set(sentinel, sideChannel);
        push_to_array(values, inner_stringify(value, key_prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, 
        // @ts-ignore
        generateArrayPrefix === 'comma' && encodeValuesOnly && values_isArray(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
    }
    return values;
}
function normalize_stringify_options(opts = defaults) {
    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }
    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }
    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }
    const charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    let format = default_format;
    if (typeof opts.format !== 'undefined') {
        if (!has(formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    const formatter = formatters[format];
    let filter = defaults.filter;
    if (typeof opts.filter === 'function' || values_isArray(opts.filter)) {
        filter = opts.filter;
    }
    let arrayFormat;
    if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
        arrayFormat = opts.arrayFormat;
    }
    else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    }
    else {
        arrayFormat = defaults.arrayFormat;
    }
    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    const allowDots = typeof opts.allowDots === 'undefined' ?
        !!opts.encodeDotInKeys === true ?
            true
            : defaults.allowDots
        : !!opts.allowDots;
    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        // @ts-ignore
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        // @ts-ignore
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
    };
}
function stringify(object, opts = {}) {
    let obj = object;
    const options = normalize_stringify_options(opts);
    let obj_keys;
    let filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    }
    else if (values_isArray(options.filter)) {
        filter = options.filter;
        obj_keys = filter;
    }
    const keys = [];
    if (typeof obj !== 'object' || obj === null) {
        return '';
    }
    const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
    const commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;
    if (!obj_keys) {
        obj_keys = Object.keys(obj);
    }
    if (options.sort) {
        obj_keys.sort(options.sort);
    }
    const sideChannel = new WeakMap();
    for (let i = 0; i < obj_keys.length; ++i) {
        const key = obj_keys[i];
        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        push_to_array(keys, inner_stringify(obj[key], key, 
        // @ts-expect-error
        generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
    }
    const joined = keys.join(options.delimiter);
    let prefix = options.addQueryPrefix === true ? '?' : '';
    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        }
        else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }
    return joined.length > 0 ? prefix + joined : '';
}
//# sourceMappingURL=stringify.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/query.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

function stringifyQuery(query) {
    return stringify(query, { arrayFormat: 'brackets' });
}
//# sourceMappingURL=query.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/credentials/types.mjs

const GRANT_TYPE_JWT_BEARER = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const GRANT_TYPE_REFRESH_TOKEN = 'refresh_token';
const TOKEN_ENDPOINT = '/v1/oauth/token';
/**
 * `anthropic-beta` value required on authenticated API requests using an
 * OAuth bearer token, and on `refresh_token` grants against the token endpoint.
 */
const OAUTH_API_BETA_HEADER = 'oauth-2025-04-20';
/**
 * `anthropic-beta` value required on jwt-bearer exchanges against the token
 * endpoint. It routes the request to the federation service; it must NOT be
 * sent on `refresh_token` grants, which are handled by a different backend.
 */
const FEDERATION_BETA_HEADER = 'oidc-federation-2026-04-01';
const ADVISORY_REFRESH_THRESHOLD_IN_SECONDS = 120;
const MANDATORY_REFRESH_THRESHOLD_IN_SECONDS = 30;
const ADVISORY_REFRESH_BACKOFF_IN_SECONDS = 5;
const MAX_TOKEN_RESPONSE_BYTES = 1 << 20;
/**
 * Rejects base URLs that would cause a JWT assertion or refresh token to be
 * sent over cleartext HTTP. Loopback hosts are allowed for local development.
 */
function requireSecureTokenEndpoint(baseURL) {
    if (!baseURL)
        return;
    let u;
    try {
        u = new URL(baseURL);
    }
    catch (err) {
        throw new WorkloadIdentityError(`Invalid token endpoint base URL "${baseURL}": ${err}`);
    }
    if (u.protocol === 'https:')
        return;
    // WHATWG URL.hostname returns bracketed IPv6 ("[::1]"); Go's net/url strips them.
    const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (u.protocol === 'http:' && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
        return;
    }
    throw new WorkloadIdentityError(`Refusing to send credential over non-https token endpoint "${baseURL}"`);
}
/**
 * Reads the response body as text, parses it as a token-endpoint JSON
 * response, validates `access_token` is present, and rejects a non-Bearer
 * `token_type` when one is provided. Reads at most
 * {@link MAX_TOKEN_RESPONSE_BYTES} from the body stream.
 */
async function parseTokenResponse(resp, requestId) {
    const text = await readLimitedText(resp);
    let data;
    try {
        data = JSON.parse(text);
    }
    catch {
        throw new WorkloadIdentityError(`Token endpoint returned non-JSON response (status ${resp.status})`, resp.status, redactSensitive(text), requestId);
    }
    if (!data.access_token) {
        throw new WorkloadIdentityError(`Token endpoint response missing access_token: ${JSON.stringify(redactSensitive(data))}`, resp.status, redactSensitive(data), requestId);
    }
    if (data.token_type && data.token_type.toLowerCase() !== 'bearer') {
        throw new WorkloadIdentityError(`Token endpoint response: unsupported token_type "${data.token_type}" (want Bearer)`, resp.status, redactSensitive(data), requestId);
    }
    return data;
}
const MAX_ERROR_BODY_CHARS = 2000;
// RFC 6749 §5.2 standard error-response fields. Anything else in a token
// endpoint error body is potentially echoed input (assertion, refresh_token,
// access_token, …) and is dropped rather than allowlisted-with-exceptions.
const SAFE_ERROR_KEYS = new Set(['error', 'error_description', 'error_uri']);
/**
 * Returns a redacted copy of a token-endpoint error body for safe inclusion
 * in an exception. Strings are truncated; objects keep only the RFC 6749
 * §5.2 error fields.
 */
function redactSensitive(body) {
    if (body == null)
        return body;
    if (typeof body === 'string') {
        let parsed;
        try {
            parsed = JSON.parse(body);
        }
        catch {
            if (body.length <= MAX_ERROR_BODY_CHARS)
                return body;
            return body.slice(0, MAX_ERROR_BODY_CHARS) + `... <${body.length - MAX_ERROR_BODY_CHARS} more chars>`;
        }
        return JSON.stringify(redactSensitive(parsed));
    }
    if (typeof body === 'object' && !Array.isArray(body)) {
        const out = {};
        for (const [k, v] of Object.entries(body)) {
            if (SAFE_ERROR_KEYS.has(k))
                out[k] = v;
        }
        return out;
    }
    return null;
}
/**
 * Best-effort safety check on a credentials file before reading it.
 *
 * On POSIX: resolves symlinks (so containerized deployments that mount the
 * credential as a symlink to a tmpfs-backed file keep working), then rejects
 * the resolved target if it is group- or world- readable or writable. A uid
 * mismatch on the resolved target is surfaced via `onWarn` since
 * root-written/app-read is common in init-container setups. No-op on Windows.
 */
async function checkCredentialsFileSafety(path, onWarn = (m) => console.warn(`anthropic-sdk: ${m}`)) {
    if (typeof process === 'undefined' || process.platform === 'win32')
        return;
    const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
    let resolved = path;
    let st;
    try {
        resolved = await fs.promises.realpath(path);
        st = await fs.promises.stat(resolved);
    }
    catch {
        return; // ENOENT etc — let the subsequent read surface a precise error
    }
    const mode = st.mode & 0o777;
    // 0o022 = group/world write; 0o044 = group/world read.
    if (mode & 0o022) {
        throw new WorkloadIdentityError(`Credentials file at ${resolved} is group/world-writable (mode 0o${mode.toString(8)}); ` +
            `this allows other local users to plant tokens. Run \`chmod 600 ${resolved}\`.`);
    }
    if (mode & 0o044) {
        throw new WorkloadIdentityError(`Credentials file at ${resolved} is group/world-readable (mode 0o${mode.toString(8)}); ` +
            `run \`chmod 600 ${resolved}\` before retrying.`);
    }
    if (typeof process.getuid === 'function' && st.uid !== process.getuid()) {
        onWarn(`credentials file at ${resolved} is owned by uid ${st.uid} (current process uid ${process.getuid()}); ` + `verify this is intentional.`);
    }
}
/**
 * Atomically writes JSON to `targetPath` via a `.tmp` sibling + rename,
 * with fsync on the file and (best-effort) on the parent directory.
 * Creates the parent directory with mode 0700 and the file with mode 0600.
 */
async function writeCredentialsFileAtomic(targetPath, data) {
    const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
    const path = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 6760, 19));
    const dir = path.dirname(targetPath);
    await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
    // Unique temp name avoids two concurrent writers (different processes or
    // SDK instances) racing on the same '.tmp' sibling and corrupting each
    // other's bytes mid-write before the rename.
    const tmpPath = `${targetPath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    try {
        const fh = await fs.promises.open(tmpPath, 'w', 0o600);
        try {
            await fh.writeFile(JSON.stringify(data, null, 2));
            await fh.sync();
        }
        finally {
            await fh.close();
        }
        await fs.promises.rename(tmpPath, targetPath);
    }
    catch (err) {
        // Don't leak the temp file if anything between create and rename failed.
        await fs.promises.unlink(tmpPath).catch(() => { });
        throw err;
    }
    // fsync the parent directory so the rename survives a crash.
    try {
        const dirFh = await fs.promises.open(dir, 'r');
        try {
            await dirFh.sync();
        }
        finally {
            await dirFh.close();
        }
    }
    catch {
        // Directory fsync is best-effort (unsupported on some platforms, e.g. Windows).
    }
}
async function readLimitedText(resp) {
    if (!resp.body) {
        return '';
    }
    const reader = resp.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            break;
        if (received + value.length > MAX_TOKEN_RESPONSE_BYTES) {
            const remaining = MAX_TOKEN_RESPONSE_BYTES - received;
            if (remaining > 0)
                chunks.push(value.subarray(0, remaining));
            await reader.cancel();
            break;
        }
        chunks.push(value);
        received += value.length;
    }
    let merged;
    if (chunks.length === 1) {
        merged = chunks[0];
    }
    else {
        merged = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
        let offset = 0;
        for (const c of chunks) {
            merged.set(c, offset);
            offset += c.length;
        }
    }
    return new TextDecoder('utf-8').decode(merged);
}
class WorkloadIdentityError extends error_AnthropicError {
    constructor(message, statusCode = null, body = null, requestId = null) {
        super(message);
        this.statusCode = statusCode;
        this.body = body;
        this.requestId = requestId;
    }
}
//# sourceMappingURL=types.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/time.mjs
/** Current time as unix epoch seconds. */
function nowAsSeconds() {
    return Math.floor(Date.now() / 1000);
}
//# sourceMappingURL=time.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/credentials/token-cache.mjs


/**
 * Wraps an {@link AccessTokenProvider} with two-tier proactive refresh
 * and concurrent deduplication.
 *
 * Refresh policy on each {@link getToken} call:
 *
 * - No cached token → call provider (blocking), cache, return.
 * - Cached with `expiresAt == null` → return cached forever.
 * - More than 120s remaining → return cached.
 * - 30–120s remaining (advisory window) → return stale token immediately,
 *   kick off background refresh. On failure, log and keep stale.
 * - Less than 30s remaining or expired (mandatory) → block and refresh.
 *   On failure, throw.
 *
 * Concurrent mandatory callers coalesce into a single provider call.
 */
class TokenCache {
    constructor(provider, onAdvisoryRefreshError) {
        this.cached = null;
        this.pendingRefresh = null;
        this.nextForce = false;
        this.lastAdvisoryError = 0;
        this.provider = provider;
        this.onAdvisoryRefreshError = onAdvisoryRefreshError;
    }
    async getToken() {
        const force = this.nextForce;
        this.nextForce = false;
        const cached = this.cached;
        if (force || cached == null) {
            const token = await this.refresh(force);
            return token.token;
        }
        if (cached.expiresAt == null) {
            return cached.token;
        }
        const remaining = cached.expiresAt - nowAsSeconds();
        if (remaining > ADVISORY_REFRESH_THRESHOLD_IN_SECONDS) {
            return cached.token;
        }
        if (remaining > MANDATORY_REFRESH_THRESHOLD_IN_SECONDS) {
            this.backgroundRefresh();
            return cached.token;
        }
        const token = await this.refresh();
        return token.token;
    }
    /**
     * Clears the cached token and marks the next {@link getToken} as a forced
     * refresh, so the underlying provider bypasses any on-disk freshness check.
     * Called after a 401 — the server has just told us the token is bad even
     * if its `expires_at` still looks fresh.
     */
    invalidate() {
        this.cached = null;
        this.nextForce = true;
    }
    /**
     * Mandatory refresh. Joins any in-flight refresh unless forced — a forced
     * refresh must not coalesce into a non-forced one that may re-serve the
     * same stale disk token.
     */
    refresh(force = false) {
        if (this.pendingRefresh && !force) {
            return this.pendingRefresh;
        }
        return this.doRefresh(force);
    }
    /**
     * Advisory background refresh. Shares the same in-flight promise as
     * mandatory refreshes for deduplication, but swallows errors so the
     * stale cached token keeps being served. Backs off for
     * {@link ADVISORY_REFRESH_BACKOFF_IN_SECONDS} after a failure so an
     * outage during the advisory window doesn't hammer the token endpoint.
     */
    backgroundRefresh() {
        if (this.pendingRefresh) {
            return;
        }
        if (nowAsSeconds() - this.lastAdvisoryError < ADVISORY_REFRESH_BACKOFF_IN_SECONDS) {
            return;
        }
        this.doRefresh().catch((err) => {
            this.lastAdvisoryError = nowAsSeconds();
            // Advisory failure: keep serving the stale cached token, but surface
            // the error to the caller-provided hook so it can be logged.
            this.onAdvisoryRefreshError?.(err);
        });
    }
    /**
     * Core refresh. Sets {@link pendingRefresh} so concurrent callers
     * (both advisory and mandatory) coalesce into a single provider call.
     */
    doRefresh(force = false) {
        this.pendingRefresh = this.provider(force ? { forceRefresh: true } : undefined).then((token) => {
            this.cached = token;
            this.pendingRefresh = null;
            return token;
        }, (err) => {
            this.pendingRefresh = null;
            throw err;
        });
        return this.pendingRefresh;
    }
}
//# sourceMappingURL=token-cache.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/env.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * Read an environment variable.
 *
 * Trims beginning and trailing whitespace.
 *
 * Will return undefined if the environment variable doesn't exist or cannot be accessed.
 */
const readEnv = (env) => {
    if (typeof globalThis.process !== 'undefined') {
        return globalThis.process.env?.[env]?.trim() || undefined;
    }
    if (typeof globalThis.Deno !== 'undefined') {
        return globalThis.Deno.env?.get?.(env)?.trim() || undefined;
    }
    return undefined;
};
//# sourceMappingURL=env.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/base64.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


const toBase64 = (data) => {
    if (!data)
        return '';
    if (typeof globalThis.Buffer !== 'undefined') {
        return globalThis.Buffer.from(data).toString('base64');
    }
    if (typeof data === 'string') {
        data = encodeUTF8(data);
    }
    if (typeof btoa !== 'undefined') {
        return btoa(String.fromCharCode.apply(null, data));
    }
    throw new AnthropicError('Cannot generate base64 string; Expected `Buffer` or `btoa` to be defined');
};
const fromBase64 = (str) => {
    if (typeof globalThis.Buffer !== 'undefined') {
        const buf = globalThis.Buffer.from(str, 'base64');
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    if (typeof atob !== 'undefined') {
        const bstr = atob(str);
        const buf = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) {
            buf[i] = bstr.charCodeAt(i);
        }
        return buf;
    }
    throw new AnthropicError('Cannot decode base64 string; Expected `Buffer` or `atob` to be defined');
};
//# sourceMappingURL=base64.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/log.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

const levelNumbers = {
    off: 0,
    error: 200,
    warn: 300,
    info: 400,
    debug: 500,
};
const parseLogLevel = (maybeLevel, sourceName, client) => {
    if (!maybeLevel) {
        return undefined;
    }
    if (hasOwn(levelNumbers, maybeLevel)) {
        return maybeLevel;
    }
    loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
    return undefined;
};
function noop() { }
function makeLogFn(fnLevel, logger, logLevel) {
    if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
        return noop;
    }
    else {
        // Don't wrap logger functions, we want the stacktrace intact!
        return logger[fnLevel].bind(logger);
    }
}
const noopLogger = {
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
};
let cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
    const logger = client.logger;
    const logLevel = client.logLevel ?? 'off';
    if (!logger) {
        return noopLogger;
    }
    const cachedLogger = cachedLoggers.get(logger);
    if (cachedLogger && cachedLogger[0] === logLevel) {
        return cachedLogger[1];
    }
    const levelLogger = {
        error: makeLogFn('error', logger, logLevel),
        warn: makeLogFn('warn', logger, logLevel),
        info: makeLogFn('info', logger, logLevel),
        debug: makeLogFn('debug', logger, logLevel),
    };
    cachedLoggers.set(logger, [logLevel, levelLogger]);
    return levelLogger;
}
const formatRequestDetails = (details) => {
    if (details.options) {
        details.options = { ...details.options };
        delete details.options['headers']; // redundant + leaks internals
    }
    if (details.headers) {
        details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
            name,
            (name.toLowerCase() === 'authorization' ||
                name.toLowerCase() === 'api-key' ||
                name.toLowerCase() === 'x-api-key' ||
                name.toLowerCase() === 'cookie' ||
                name.toLowerCase() === 'set-cookie') ?
                '***'
                : value,
        ]));
    }
    if ('retryOfRequestLogID' in details) {
        if (details.retryOfRequestLogID) {
            details.retryOf = details.retryOfRequestLogID;
        }
        delete details.retryOfRequestLogID;
    }
    return details;
};
//# sourceMappingURL=log.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.







//# sourceMappingURL=utils.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/core/credentials.mjs


/** Current schema version written to `configs/<profile>.json`. Absent on read ⇒ "1.0". */
const CONFIG_FILE_VERSION = '1.0';
/** Current schema version written to `credentials/<profile>.json`. Absent on read ⇒ "1.0". */
const CREDENTIALS_FILE_VERSION = '1.0';
const PROFILE_NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;
function validateProfileName(name) {
    if (!name) {
        throw new Error('profile name is empty');
    }
    if (name === '.' || name === '..') {
        throw new Error(`profile name "${name}" is not allowed`);
    }
    if (name.includes('/') || name.includes('\\')) {
        throw new Error(`profile name "${name}" must not contain path separators`);
    }
    if (!PROFILE_NAME_PATTERN.test(name)) {
        throw new Error(`profile name "${name}" contains disallowed characters (allowed: letters, digits, '_', '.', '-')`);
    }
}
/**
 * Loads the Anthropic configuration for the given (or active) profile.
 *
 * Returns `null` when running in a browser or no configuration can be resolved.
 * Otherwise, returns the configuration based on the config file and environment variables.
 *
 * **Profile resolution** (first match wins):
 *   1. Explicit `profile` argument
 *   2. `ANTHROPIC_PROFILE` environment variable
 *   3. Contents of `<config_dir>/active_config` file
 *   4. `"default"`
 *
 * **Config resolution:**
 *   - If `<config_dir>/configs/<profile>.json` exists, it is loaded and
 *     missing fields are filled from environment variables. Values present
 *     in the file take precedence — env vars only fill gaps:
 *       - `ANTHROPIC_BASE_URL` → `base_url`
 *       - `ANTHROPIC_ORGANIZATION_ID` → `organization_id`
 *       - `ANTHROPIC_WORKSPACE_ID` → `workspace_id`
 *       - `ANTHROPIC_SCOPE` → `authentication.scope`
 *       - `ANTHROPIC_FEDERATION_RULE_ID` → `authentication.federation_rule_id` (oidc_federation)
 *       - `ANTHROPIC_IDENTITY_TOKEN_FILE` → `authentication.identity_token` (oidc_federation)
 *       - `ANTHROPIC_SERVICE_ACCOUNT_ID` → `authentication.service_account_id` (oidc_federation)
 *   - If no config file exists, an `oidc_federation` config is synthesized
 *     entirely from environment variables when both `ANTHROPIC_FEDERATION_RULE_ID`
 *     and `ANTHROPIC_ORGANIZATION_ID` are set.
 */
const loadConfig = async (profile) => {
    return (await loadConfigWithSource(profile))?.config ?? null;
};
/**
 * Same as {@link loadConfig}, but also reports whether the config was loaded
 * from a profile file on disk (`fromFile: true`) or synthesized entirely from
 * environment variables (`fromFile: false`).
 */
const loadConfigWithSource = async (profile) => {
    var _a, _b;
    const rootConfigPath = await getRootConfigPath();
    if (rootConfigPath === null) {
        return null;
    }
    const profileName = profile ?? (await getActiveProfileName());
    if (profileName === null) {
        return null;
    }
    validateProfileName(profileName);
    const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
    const path = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 6760, 19));
    const configPath = path.join(rootConfigPath, 'configs', `${profileName}.json`);
    let configRaw;
    try {
        configRaw = await fs.promises.readFile(configPath, 'utf-8');
    }
    catch (err) {
        if (err?.code !== 'ENOENT') {
            throw new Error(`failed to read config file ${configPath}: ${err}`);
        }
        configRaw = null;
    }
    if (configRaw === null) {
        const organizationId = readEnv('ANTHROPIC_ORGANIZATION_ID');
        const identityTokenFile = readEnv('ANTHROPIC_IDENTITY_TOKEN_FILE');
        const federationRuleId = readEnv('ANTHROPIC_FEDERATION_RULE_ID');
        if (federationRuleId && organizationId) {
            return {
                fromFile: false,
                config: {
                    organization_id: organizationId,
                    // A defaulted-but-empty CI variable (`ANTHROPIC_WORKSPACE_ID=""`) is
                    // treated as unset — readEnv coerces empty to undefined, and the body
                    // builder's truthy check skips it — so `"workspace_id": ""` never goes
                    // on the wire.
                    workspace_id: readEnv('ANTHROPIC_WORKSPACE_ID'),
                    base_url: readEnv('ANTHROPIC_BASE_URL'),
                    authentication: {
                        type: 'oidc_federation',
                        federation_rule_id: federationRuleId,
                        service_account_id: readEnv('ANTHROPIC_SERVICE_ACCOUNT_ID'),
                        identity_token: identityTokenFile ? { source: 'file', path: identityTokenFile } : undefined,
                        scope: readEnv('ANTHROPIC_SCOPE'),
                    },
                },
            };
        }
        return null;
    }
    let config;
    try {
        config = JSON.parse(configRaw);
    }
    catch (err) {
        throw new Error(`failed to parse config file ${configPath}: ${err}`);
    }
    if (!config.authentication) {
        throw new Error(`config file ${configPath} is missing "authentication"`);
    }
    const authType = config.authentication.type;
    if (authType !== 'oidc_federation' && authType !== 'user_oauth') {
        throw new Error(`authentication.type "${authType}" is not a known authentication type`);
    }
    // File values are authoritative; env vars only fill fields the file left unset.
    config.organization_id ?? (config.organization_id = readEnv('ANTHROPIC_ORGANIZATION_ID'));
    config.workspace_id ?? (config.workspace_id = readEnv('ANTHROPIC_WORKSPACE_ID'));
    config.base_url ?? (config.base_url = readEnv('ANTHROPIC_BASE_URL'));
    (_a = config.authentication).scope ?? (_a.scope = readEnv('ANTHROPIC_SCOPE'));
    if (config.authentication.type === 'oidc_federation') {
        if (!config.authentication.identity_token) {
            const identityTokenFile = readEnv('ANTHROPIC_IDENTITY_TOKEN_FILE');
            if (identityTokenFile) {
                config.authentication.identity_token = {
                    source: 'file',
                    path: identityTokenFile,
                };
            }
        }
        // Unlike siblings using `??= readEnv()` (which leaves `undefined`), coerce
        // to '' so the type stays `string` (always set). The downstream required
        // check in credential-chain rejects empty, so semantics match but types are
        // cleaner.
        if (!config.authentication.federation_rule_id) {
            config.authentication.federation_rule_id = readEnv('ANTHROPIC_FEDERATION_RULE_ID') ?? '';
        }
        (_b = config.authentication).service_account_id ?? (_b.service_account_id = readEnv('ANTHROPIC_SERVICE_ACCOUNT_ID'));
    }
    return { config, fromFile: true };
};
/**
 * Loads the credential material for the active profile.
 *
 * Returns the parsed credentials or `null` when running in a browser or
 * no credentials file can be found.
 *
 * **Profile resolution** (first match wins):
 *   1. `ANTHROPIC_PROFILE` environment variable
 *   2. Contents of `<config_dir>/active_config` file
 *   3. `"default"`
 *
 * **Credentials path resolution** (first match wins):
 *   1. `authentication.credentials_path` from the active profile's config (via {@link loadConfig})
 *   2. `<config_dir>/credentials/<profile>.json`
 */
const loadCredentials = async () => {
    const config = await loadConfig();
    const credentialsPath = await getCredentialsPath(config);
    if (!credentialsPath) {
        return null;
    }
    const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
    let raw;
    try {
        raw = await fs.promises.readFile(credentialsPath, 'utf-8');
    }
    catch (err) {
        if (err?.code !== 'ENOENT') {
            throw new Error(`failed to read credentials file ${credentialsPath}: ${err}`);
        }
        return null;
    }
    let creds;
    try {
        creds = JSON.parse(raw);
    }
    catch (err) {
        throw new Error(`failed to parse credentials file ${credentialsPath}: ${err}`);
    }
    if (creds.type && creds.type !== 'oauth_token') {
        throw new Error(`credentials file ${credentialsPath} has unsupported type "${creds.type}" (want "oauth_token")`);
    }
    return creds;
};
/**
 * Resolves the credentials file path for the given config.
 *
 * Uses `authentication.credentials_path` from the config if set, otherwise
 * falls back to `<config_dir>/credentials/<profile>.json`.
 *
 * Returns `null` when running in a browser or the path cannot be resolved.
 */
const getCredentialsPath = async (config, profile) => {
    if (config?.authentication.credentials_path) {
        return config.authentication.credentials_path;
    }
    const rootConfigPath = await getRootConfigPath();
    if (!rootConfigPath) {
        return null;
    }
    const profileName = profile ?? (await getActiveProfileName());
    if (!profileName) {
        return null;
    }
    validateProfileName(profileName);
    const path = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 6760, 19));
    return path.join(rootConfigPath, 'credentials', `${profileName}.json`);
};
const getRootConfigPath = async () => {
    if (!supportsLocalConfigFiles()) {
        return null;
    }
    const path = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 6760, 19));
    // ANTHROPIC_CONFIG_DIR is treated as a trusted path: it is set by the
    // process operator, not by remote input, so it is not validated.
    const configDir = readEnv('ANTHROPIC_CONFIG_DIR');
    if (configDir) {
        return configDir;
    }
    const os = getPlatformHeaders()['X-Stainless-OS'];
    if (os === 'Windows') {
        const appData = readEnv('APPDATA');
        if (appData) {
            return path.join(appData, 'Anthropic');
        }
        const userProfile = readEnv('USERPROFILE');
        if (userProfile) {
            return path.join(userProfile, 'AppData', 'Roaming', 'Anthropic');
        }
        // No usable Windows config root — return null so callers fall through to
        // "no config available" rather than silently writing under C:\.
        return null;
    }
    const xdgConfigHome = readEnv('XDG_CONFIG_HOME');
    if (xdgConfigHome) {
        return path.join(xdgConfigHome, 'anthropic');
    }
    const home = readEnv('HOME');
    if (home) {
        return path.join(home, '.config', 'anthropic');
    }
    return null;
};
const supportsLocalConfigFiles = () => {
    const runtime = getPlatformHeaders()['X-Stainless-Runtime'];
    return runtime === 'node' || runtime === 'deno';
};
const getActiveProfileName = async () => {
    const rootConfigPath = await getRootConfigPath();
    if (!rootConfigPath) {
        return null;
    }
    const profileName = readEnv('ANTHROPIC_PROFILE');
    if (profileName) {
        return profileName;
    }
    const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
    const path = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 6760, 19));
    const filePath = path.join(rootConfigPath, 'active_config');
    try {
        return (await fs.promises.readFile(filePath, 'utf-8')).trim() || 'default';
    }
    catch (err) {
        if (err?.code !== 'ENOENT') {
            throw new Error(`failed to read ${filePath}: ${err}`);
        }
        return 'default';
    }
};
//# sourceMappingURL=credentials.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/credentials/identity-token.mjs

/**
 * Reads a JWT from a file on every call. Supports automatic rotation
 * (e.g. Kubernetes projected service-account tokens).
 */
function identityTokenFromFile(path) {
    if (!path) {
        throw new error_AnthropicError('Identity token file path is empty');
    }
    return async () => {
        const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
        let content;
        try {
            content = await fs.promises.readFile(path, 'utf-8');
        }
        catch (err) {
            throw new error_AnthropicError(`Failed to read identity token file at ${path}: ${err}`);
        }
        const token = content.trim();
        if (!token) {
            throw new error_AnthropicError(`Identity token file at ${path} is empty`);
        }
        return token;
    };
}
/**
 * Wraps a static JWT string as an {@link IdentityTokenProvider}.
 */
function identityTokenFromValue(token) {
    if (!token) {
        throw new error_AnthropicError('Identity token value is empty');
    }
    return () => token;
}
//# sourceMappingURL=identity-token.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/credentials/oidc-federation.mjs



/**
 * Exchanges an external OIDC JWT for an Anthropic access token via the
 * RFC 7523 jwt-bearer grant.
 *
 * Each invocation performs a fresh token exchange. Wrap in a
 * {@link TokenCache} to avoid exchanging on every request.
 *
 * Federation grants do not return a refresh token — callers re-exchange
 * their assertion on expiry.
 */
function oidcFederationProvider(config) {
    return async () => {
        requireSecureTokenEndpoint(config.baseURL);
        const jwt = await config.identityTokenProvider();
        // The token endpoint enforces a 16 KiB assertion limit; surface a clear
        // client-side error so misconfigured projected-token sources are
        // diagnosable without a server round-trip.
        if (jwt.length > 16 * 1024) {
            throw new WorkloadIdentityError(`Identity token is ${Math.ceil(jwt.length / 1024)} KiB, exceeds the 16 KiB assertion limit`);
        }
        const body = {
            grant_type: GRANT_TYPE_JWT_BEARER,
            assertion: jwt,
            federation_rule_id: config.federationRuleId,
            organization_id: config.organizationId,
        };
        if (config.serviceAccountId) {
            body['service_account_id'] = config.serviceAccountId;
        }
        if (config.workspaceId) {
            body['workspace_id'] = config.workspaceId;
        }
        const url = `${config.baseURL}${TOKEN_ENDPOINT}`;
        let resp;
        try {
            resp = await config.fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-beta': `${OAUTH_API_BETA_HEADER},${FEDERATION_BETA_HEADER}`,
                    'User-Agent': config.userAgent || `anthropic-sdk-typescript/${VERSION} oidcFederationProvider`,
                },
                body: JSON.stringify(body),
            });
        }
        catch (err) {
            throw new WorkloadIdentityError(`Failed to reach token endpoint ${url}: ${err}`);
        }
        const requestId = resp.headers.get('Request-Id');
        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            const redacted = redactSensitive(text);
            // A 401 is hard to debug from the status code alone, so surface
            // guidance: check the federation rule, optionally set a workspace ID
            // (the most common fix when no workspaceId is configured), and point at
            // the Workload identity page in Claude Console for the server-side
            // authentication event log. Other statuses (5xx, 400, ...) get no hint.
            let hint = '';
            if (resp.status === 401) {
                const hintMiddle = config.workspaceId ? '' : ("If your federation rule is scoped to multiple workspaces, set the ANTHROPIC_WORKSPACE_ID environment variable, the 'workspace_id' config key, or the `workspaceId` option. ");
                hint = ` Ensure your federation rule matches your identity token. ${hintMiddle}View your authentication events in the Workload identity page of Claude Console for more details.`;
            }
            throw new WorkloadIdentityError(`Token exchange failed with status ${resp.status}${requestId ? ` (request-id ${requestId})` : ''}: ${redacted}${hint}`, resp.status, redacted, requestId);
        }
        const data = await parseTokenResponse(resp, requestId);
        const expiresIn = Number(data.expires_in);
        if (!Number.isFinite(expiresIn)) {
            throw new WorkloadIdentityError(`Token endpoint response missing required fields: ${JSON.stringify(redactSensitive(data))}`, resp.status, redactSensitive(data), requestId);
        }
        return {
            token: data.access_token,
            expiresAt: nowAsSeconds() + expiresIn,
        };
    };
}
//# sourceMappingURL=oidc-federation.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/credentials/user-oauth.mjs




/**
 * Reads a user-oauth credential file. Returns the cached access token while
 * fresh; on expiry performs a `refresh_token` grant and writes the new
 * tokens back to the credentials file (atomic replace, fsync'd).
 *
 * If `clientId` is empty, the access token is treated as static — the
 * credentials file is read on every call but no refresh is attempted, and
 * an expired token without a `refresh_token` raises.
 */
function userOAuthProvider(config) {
    return async (opts) => {
        const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
        await checkCredentialsFileSafety(config.credentialsPath, config.onSafetyWarning);
        let raw;
        try {
            raw = await fs.promises.readFile(config.credentialsPath, 'utf-8');
        }
        catch (err) {
            throw new WorkloadIdentityError(`Credentials file not found at ${config.credentialsPath}: ${err}`);
        }
        let creds;
        try {
            creds = JSON.parse(raw);
        }
        catch (err) {
            throw new WorkloadIdentityError(`Credentials file at ${config.credentialsPath} is not valid JSON: ${err}`);
        }
        const accessToken = creds.access_token;
        if (!accessToken) {
            throw new WorkloadIdentityError(`Credentials file at ${config.credentialsPath} must include 'access_token'`);
        }
        // Return cached token if still fresh (or no expiry info), unless the
        // caller is forcing a refresh after a 401 — then go straight to refresh
        // even if the file's expires_at still looks valid.
        const expiresAt = creds.expires_at;
        if (!opts?.forceRefresh &&
            (expiresAt == null || nowAsSeconds() < expiresAt - MANDATORY_REFRESH_THRESHOLD_IN_SECONDS)) {
            return { token: accessToken, expiresAt: expiresAt ?? null };
        }
        const refreshToken = creds.refresh_token;
        if (!config.clientId || !refreshToken) {
            throw new WorkloadIdentityError(`Access token at ${config.credentialsPath} has expired and no refresh is available ` +
                `(client_id ${config.clientId ? 'set' : 'empty'}, refresh_token ${refreshToken ? 'set' : 'empty'})`);
        }
        requireSecureTokenEndpoint(config.baseURL);
        const body = {
            grant_type: GRANT_TYPE_REFRESH_TOKEN,
            refresh_token: refreshToken,
            client_id: config.clientId,
        };
        const url = `${config.baseURL}${TOKEN_ENDPOINT}`;
        let resp;
        try {
            resp = await config.fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-beta': OAUTH_API_BETA_HEADER,
                    'User-Agent': config.userAgent || `anthropic-sdk-typescript/${VERSION} userOAuthProvider`,
                },
                body: JSON.stringify(body),
            });
        }
        catch (err) {
            throw new WorkloadIdentityError(`User OAuth refresh failed to reach token endpoint: ${err}`);
        }
        const requestId = resp.headers.get('Request-Id');
        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            throw new WorkloadIdentityError(`User OAuth refresh failed (HTTP ${resp.status}): ${redactSensitive(text)}`, resp.status, redactSensitive(text), requestId);
        }
        const data = await parseTokenResponse(resp, requestId);
        const expiresIn = Number(data.expires_in);
        if (!Number.isFinite(expiresIn)) {
            throw new WorkloadIdentityError(`User OAuth refresh response missing or invalid expires_in: ${JSON.stringify(redactSensitive(data))}`, resp.status, redactSensitive(data), requestId);
        }
        const newExpiresAt = nowAsSeconds() + expiresIn;
        const newRefreshToken = data.refresh_token || refreshToken;
        await writeCredentialsFileAtomic(config.credentialsPath, {
            ...creds,
            version: CREDENTIALS_FILE_VERSION,
            type: 'oauth_token',
            access_token: data.access_token,
            expires_at: newExpiresAt,
            refresh_token: newRefreshToken,
        });
        return { token: data.access_token, expiresAt: newExpiresAt };
    };
}
//# sourceMappingURL=user-oauth.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/credentials/credential-chain.mjs







function resolveCredentialsFromConfig(config, options) {
    const credentialsPath = config.authentication.credentials_path ?? null;
    const effectiveBaseURL = (config.base_url || options.baseURL).replace(/\/+$/, '');
    const provider = buildProvider(config, credentialsPath, effectiveBaseURL, options);
    const extraHeaders = {};
    // For federation profiles workspace_id is sent in the jwt-bearer exchange
    // body, not as a request header (the minted token is already
    // workspace-scoped, so the header would be ignored).
    if (config.workspace_id && config.authentication.type === 'user_oauth') {
        extraHeaders['anthropic-workspace-id'] = config.workspace_id;
    }
    // Surface the profile's own base_url (not the options.baseURL fallback) so
    // the client can adopt it for outbound API requests when the caller didn't
    // pin one explicitly. Echoing options.baseURL back would defeat precedence.
    return { provider, extraHeaders, baseURL: config.base_url || undefined };
}
/**
 * Resolves a {@link CredentialResult} from the environment. Returns `null`
 * when no credentials can be resolved.
 *
 * Resolution order:
 *
 *   1. Config file for the active profile (or the explicit `profile` argument)
 *      → dispatch on `authentication.type` (`oidc_federation`, `user_oauth`)
 *   2. Environment variables `ANTHROPIC_FEDERATION_RULE_ID` +
 *      `ANTHROPIC_ORGANIZATION_ID` (+ identity token) → OIDC federation
 *   3. Nothing matches → `null`
 *
 * Passing `profile` selects `<config_dir>/configs/<profile>.json` directly,
 * skipping `ANTHROPIC_PROFILE` / `active_config` resolution.
 */
async function defaultCredentials(options, profile) {
    const loaded = await loadConfigWithSource(profile);
    if (!loaded) {
        return null;
    }
    const { config, fromFile } = loaded;
    // For file-loaded configs, default credentials_path to the per-profile
    // location so user_oauth and federation caching work. Shallow-clone first
    // so callers that retain a reference to the loaded config don't observe the
    // patched-in default.
    //
    // Env-only credentials (no profile file on disk) skip the disk cache —
    // matching the other SDKs. A disk cache keyed by profile path would
    // re-serve a stale token after a change to ANTHROPIC_WORKSPACE_ID (or
    // ANTHROPIC_ORGANIZATION_ID / ANTHROPIC_FEDERATION_RULE_ID) until the
    // cached token expired, so the env-only chain stays in-memory only.
    const withPath = config.authentication.credentials_path || !fromFile ?
        config
        : {
            ...config,
            authentication: {
                ...config.authentication,
                credentials_path: (await getCredentialsPath(config, profile)) ?? undefined,
            },
        };
    return resolveCredentialsFromConfig(withPath, options);
}
function buildProvider(config, credentialsPath, baseURL, options) {
    switch (config.authentication.type) {
        case 'oidc_federation': {
            const auth = config.authentication;
            const identityProvider = resolveIdentityTokenProvider(auth);
            if (!identityProvider) {
                throw new WorkloadIdentityError('oidc_federation config requires an identity token (set authentication.identity_token, ' +
                    'ANTHROPIC_IDENTITY_TOKEN_FILE, or ANTHROPIC_IDENTITY_TOKEN)');
            }
            if (!auth.federation_rule_id) {
                throw new WorkloadIdentityError("oidc_federation config requires 'federation_rule_id'. Set it in authentication.federation_rule_id in your profile, or via ANTHROPIC_FEDERATION_RULE_ID (profile takes precedence).");
            }
            if (!config.organization_id) {
                throw new WorkloadIdentityError('oidc_federation config requires organization_id (set ANTHROPIC_ORGANIZATION_ID or config.organization_id)');
            }
            const exchange = oidcFederationProvider({
                identityTokenProvider: identityProvider,
                federationRuleId: auth.federation_rule_id,
                organizationId: config.organization_id,
                serviceAccountId: auth.service_account_id,
                workspaceId: config.workspace_id,
                baseURL,
                fetch: options.fetch,
                userAgent: options.userAgent,
            });
            // If there's a credentials file path, wrap the exchange with file caching
            // (check file for fresh token before exchanging, write back after).
            if (credentialsPath) {
                return cachedExchangeProvider(exchange, credentialsPath, options.onCacheWriteError, options.onSafetyWarning);
            }
            return exchange;
        }
        case 'user_oauth': {
            if (!credentialsPath) {
                throw new WorkloadIdentityError('user_oauth config requires authentication.credentials_path ' +
                    '(or load via a profile so it defaults to <config_dir>/credentials/<profile>.json)');
            }
            return userOAuthProvider({
                credentialsPath,
                clientId: config.authentication.client_id,
                baseURL,
                fetch: options.fetch,
                userAgent: options.userAgent,
                onSafetyWarning: options.onSafetyWarning,
            });
        }
        default: {
            const t = config.authentication.type;
            throw new WorkloadIdentityError(`authentication.type "${t}" is not a known authentication type`);
        }
    }
}
/**
 * Resolves the identity token provider from config fields or environment variables.
 *
 * Resolution order:
 *   1. `identity_token.path` from the config (source: "file")
 *   2. `ANTHROPIC_IDENTITY_TOKEN_FILE` env var
 *   3. `ANTHROPIC_IDENTITY_TOKEN` env var (static value)
 */
function resolveIdentityTokenProvider(auth) {
    if (auth.identity_token) {
        // Cast needed to stringify an unknown source value for the error message:
        // the on-disk JSON may contain a source this SDK version doesn't know about.
        const source = auth.identity_token.source;
        if (source !== 'file') {
            throw new WorkloadIdentityError(`identity_token.source "${source}" is not supported by this SDK version (only "file")`);
        }
        if (!auth.identity_token.path) {
            throw new WorkloadIdentityError(`identity_token.source "file" requires a non-empty path`);
        }
        return identityTokenFromFile(auth.identity_token.path);
    }
    const tokenFile = readEnv('ANTHROPIC_IDENTITY_TOKEN_FILE');
    if (tokenFile) {
        return identityTokenFromFile(tokenFile);
    }
    const tokenValue = readEnv('ANTHROPIC_IDENTITY_TOKEN');
    if (tokenValue) {
        return identityTokenFromValue(tokenValue);
    }
    return null;
}
/**
 * Wraps a federation exchange provider with credential file caching.
 * Checks the file for a fresh token before exchanging, and writes the
 * result back after a successful exchange (best-effort, atomic replace).
 *
 * Note: this is not cross-process serialized — two SDK instances that
 * miss the cache simultaneously will both perform a full exchange and
 * the last writer wins. That is acceptable: federation exchanges are
 * idempotent and the cache is an optimization, not a correctness gate.
 */
function cachedExchangeProvider(exchange, credentialsPath, onCacheWriteError, onSafetyWarning) {
    return async (opts) => {
        const fs = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 3024, 19));
        await checkCredentialsFileSafety(credentialsPath, onSafetyWarning);
        // Try cached credentials file
        let existing;
        try {
            const raw = await fs.promises.readFile(credentialsPath, 'utf-8');
            existing = JSON.parse(raw);
            const token = existing?.['access_token'];
            if (token && !opts?.forceRefresh) {
                const expiresAt = existing?.['expires_at'];
                if (expiresAt == null || nowAsSeconds() < expiresAt - MANDATORY_REFRESH_THRESHOLD_IN_SECONDS) {
                    return { token, expiresAt: expiresAt ?? null };
                }
            }
        }
        catch (err) {
            // ENOENT or invalid-JSON → no usable cache, exchange fresh. Other
            // errors (EACCES, EISDIR, …) indicate a broken cache path; surface to
            // the optional hook so they're at least debuggable, then proceed.
            const code = err?.code;
            if (code !== 'ENOENT' && !(err instanceof SyntaxError)) {
                onCacheWriteError?.(err);
            }
        }
        // Exchange for a new token
        const result = await exchange(opts);
        // Write cache back (best-effort). Preserve any unknown keys from the
        // existing file (notably refresh_token, in the unlikely case this path
        // is shared with a user_oauth profile) so the federation cache writer
        // doesn't clobber material it didn't own.
        try {
            await writeCredentialsFileAtomic(credentialsPath, {
                ...(existing ?? {}),
                version: CREDENTIALS_FILE_VERSION,
                type: 'oauth_token',
                access_token: result.token,
                expires_at: result.expiresAt,
            });
        }
        catch (err) {
            // Best-effort caching: surface to the optional hook but never fail
            // the exchange itself.
            onCacheWriteError?.(err);
        }
        return result;
    };
}
//# sourceMappingURL=credential-chain.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs
function concatBytes(buffers) {
    let length = 0;
    for (const buffer of buffers) {
        length += buffer.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const buffer of buffers) {
        output.set(buffer, index);
        index += buffer.length;
    }
    return output;
}
let encodeUTF8_;
function bytes_encodeUTF8(str) {
    let encoder;
    return (encodeUTF8_ ??
        ((encoder = new globalThis.TextEncoder()), (encodeUTF8_ = encoder.encode.bind(encoder))))(str);
}
let decodeUTF8_;
function decodeUTF8(bytes) {
    let decoder;
    return (decodeUTF8_ ??
        ((decoder = new globalThis.TextDecoder()), (decodeUTF8_ = decoder.decode.bind(decoder))))(bytes);
}
//# sourceMappingURL=bytes.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs
var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex;


/**
 * A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
 * reading lines from text.
 *
 * https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
 */
class LineDecoder {
    constructor() {
        _LineDecoder_buffer.set(this, void 0);
        _LineDecoder_carriageReturnIndex.set(this, void 0);
        __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array(), "f");
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    decode(chunk) {
        if (chunk == null) {
            return [];
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk)
            : typeof chunk === 'string' ? bytes_encodeUTF8(chunk)
                : chunk;
        __classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]), "f");
        const lines = [];
        let patternIndex;
        while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
            if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
                // skip until we either get a corresponding `\n`, a new `\r` or nothing
                __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
                continue;
            }
            // we got double \r or \rtext\n
            if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null &&
                (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
                lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
                __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")), "f");
                __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
                continue;
            }
            const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
            const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
            lines.push(line);
            __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
            __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        }
        return lines;
    }
    flush() {
        if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
            return [];
        }
        return this.decode('\n');
    }
}
_LineDecoder_buffer = new WeakMap(), _LineDecoder_carriageReturnIndex = new WeakMap();
// prettier-ignore
LineDecoder.NEWLINE_CHARS = new Set(['\n', '\r']);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
/**
 * This function searches the buffer for the end patterns, (\r or \n)
 * and returns an object with the index preceding the matched newline and the
 * index after the newline char. `null` is returned if no new line is found.
 *
 * ```ts
 * findNewLineIndex('abc\ndef') -> { preceding: 2, index: 3 }
 * ```
 */
function findNewlineIndex(buffer, startIndex) {
    const newline = 0x0a; // \n
    const carriage = 0x0d; // \r
    for (let i = startIndex ?? 0; i < buffer.length; i++) {
        if (buffer[i] === newline) {
            return { preceding: i, index: i + 1, carriage: false };
        }
        if (buffer[i] === carriage) {
            return { preceding: i, index: i + 1, carriage: true };
        }
    }
    return null;
}
function findDoubleNewlineIndex(buffer) {
    // This function searches the buffer for the end patterns (\r\r, \n\n, \r\n\r\n)
    // and returns the index right after the first occurrence of any pattern,
    // or -1 if none of the patterns are found.
    const newline = 0x0a; // \n
    const carriage = 0x0d; // \r
    for (let i = 0; i < buffer.length - 1; i++) {
        if (buffer[i] === newline && buffer[i + 1] === newline) {
            // \n\n
            return i + 2;
        }
        if (buffer[i] === carriage && buffer[i + 1] === carriage) {
            // \r\r
            return i + 2;
        }
        if (buffer[i] === carriage &&
            buffer[i + 1] === newline &&
            i + 3 < buffer.length &&
            buffer[i + 2] === carriage &&
            buffer[i + 3] === newline) {
            // \r\n\r\n
            return i + 4;
        }
    }
    return -1;
}
//# sourceMappingURL=line.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/core/streaming.mjs
var _Stream_client;










class Stream {
    constructor(iterator, controller, client) {
        this.iterator = iterator;
        _Stream_client.set(this, void 0);
        this.controller = controller;
        __classPrivateFieldSet(this, _Stream_client, client, "f");
    }
    static fromSSEResponse(response, controller, client) {
        let consumed = false;
        const logger = client ? loggerFor(client) : console;
        async function* iterator() {
            if (consumed) {
                throw new error_AnthropicError('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
            }
            consumed = true;
            let done = false;
            try {
                for await (const sse of _iterSSEMessages(response, controller)) {
                    if (sse.event === 'completion') {
                        try {
                            yield JSON.parse(sse.data);
                        }
                        catch (e) {
                            logger.error(`Could not parse message into JSON:`, sse.data);
                            logger.error(`From chunk:`, sse.raw);
                            throw e;
                        }
                    }
                    if (sse.event === 'message_start' ||
                        sse.event === 'message_delta' ||
                        sse.event === 'message_stop' ||
                        sse.event === 'content_block_start' ||
                        sse.event === 'content_block_delta' ||
                        sse.event === 'content_block_stop' ||
                        sse.event === 'message' ||
                        sse.event === 'user.message' ||
                        sse.event === 'user.interrupt' ||
                        sse.event === 'user.tool_confirmation' ||
                        sse.event === 'user.custom_tool_result' ||
                        sse.event === 'agent.message' ||
                        sse.event === 'agent.thinking' ||
                        sse.event === 'agent.tool_use' ||
                        sse.event === 'agent.tool_result' ||
                        sse.event === 'agent.mcp_tool_use' ||
                        sse.event === 'agent.mcp_tool_result' ||
                        sse.event === 'agent.custom_tool_use' ||
                        sse.event === 'agent.thread_context_compacted' ||
                        sse.event === 'session.status_running' ||
                        sse.event === 'session.status_idle' ||
                        sse.event === 'session.status_rescheduled' ||
                        sse.event === 'session.status_terminated' ||
                        sse.event === 'session.error' ||
                        sse.event === 'session.deleted' ||
                        sse.event === 'span.model_request_start' ||
                        sse.event === 'span.model_request_end' ||
                        sse.event === 'span.outcome_evaluation_start' ||
                        sse.event === 'span.outcome_evaluation_ongoing' ||
                        sse.event === 'span.outcome_evaluation_end' ||
                        sse.event === 'user.define_outcome' ||
                        sse.event === 'agent.thread_message_received' ||
                        sse.event === 'agent.thread_message_sent' ||
                        sse.event === 'agent.session_thread_message_received' ||
                        sse.event === 'agent.session_thread_message_sent' ||
                        sse.event === 'session.thread_created' ||
                        sse.event === 'session.thread_status_created' ||
                        sse.event === 'session.thread_status_running' ||
                        sse.event === 'session.thread_status_idle' ||
                        sse.event === 'session.thread_status_rescheduled' ||
                        sse.event === 'session.thread_status_terminated') {
                        try {
                            yield JSON.parse(sse.data);
                        }
                        catch (e) {
                            logger.error(`Could not parse message into JSON:`, sse.data);
                            logger.error(`From chunk:`, sse.raw);
                            throw e;
                        }
                    }
                    if (sse.event === 'ping') {
                        continue;
                    }
                    if (sse.event === 'error') {
                        const body = safeJSON(sse.data) ?? sse.data;
                        const type = body?.error?.type;
                        throw new APIError(undefined, body, undefined, response.headers, type);
                    }
                }
                done = true;
            }
            catch (e) {
                // If the user calls `stream.controller.abort()`, we should exit without throwing.
                if (isAbortError(e))
                    return;
                throw e;
            }
            finally {
                // If the user `break`s, abort the ongoing request.
                if (!done)
                    controller.abort();
            }
        }
        return new Stream(iterator, controller, client);
    }
    /**
     * Generates a Stream from a newline-separated ReadableStream
     * where each item is a JSON value.
     */
    static fromReadableStream(readableStream, controller, client) {
        let consumed = false;
        async function* iterLines() {
            const lineDecoder = new LineDecoder();
            const iter = ReadableStreamToAsyncIterable(readableStream);
            for await (const chunk of iter) {
                for (const line of lineDecoder.decode(chunk)) {
                    yield line;
                }
            }
            for (const line of lineDecoder.flush()) {
                yield line;
            }
        }
        async function* iterator() {
            if (consumed) {
                throw new error_AnthropicError('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
            }
            consumed = true;
            let done = false;
            try {
                for await (const line of iterLines()) {
                    if (done)
                        continue;
                    if (line)
                        yield JSON.parse(line);
                }
                done = true;
            }
            catch (e) {
                // If the user calls `stream.controller.abort()`, we should exit without throwing.
                if (isAbortError(e))
                    return;
                throw e;
            }
            finally {
                // If the user `break`s, abort the ongoing request.
                if (!done)
                    controller.abort();
            }
        }
        return new Stream(iterator, controller, client);
    }
    [(_Stream_client = new WeakMap(), Symbol.asyncIterator)]() {
        return this.iterator();
    }
    /**
     * Splits the stream into two streams which can be
     * independently read from at different speeds.
     */
    tee() {
        const left = [];
        const right = [];
        const iterator = this.iterator();
        const teeIterator = (queue) => {
            return {
                next: () => {
                    if (queue.length === 0) {
                        const result = iterator.next();
                        left.push(result);
                        right.push(result);
                    }
                    return queue.shift();
                },
            };
        };
        return [
            new Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
            new Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
        ];
    }
    /**
     * Converts this stream to a newline-separated ReadableStream of
     * JSON stringified values in the stream
     * which can be turned back into a Stream with `Stream.fromReadableStream()`.
     */
    toReadableStream() {
        const self = this;
        let iter;
        return makeReadableStream({
            async start() {
                iter = self[Symbol.asyncIterator]();
            },
            async pull(ctrl) {
                try {
                    const { value, done } = await iter.next();
                    if (done)
                        return ctrl.close();
                    const bytes = bytes_encodeUTF8(JSON.stringify(value) + '\n');
                    ctrl.enqueue(bytes);
                }
                catch (err) {
                    ctrl.error(err);
                }
            },
            async cancel() {
                await iter.return?.();
            },
        });
    }
}
async function* _iterSSEMessages(response, controller) {
    if (!response.body) {
        controller.abort();
        if (typeof globalThis.navigator !== 'undefined' &&
            globalThis.navigator.product === 'ReactNative') {
            throw new error_AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
        }
        throw new error_AnthropicError(`Attempted to iterate over a response with no body`);
    }
    const sseDecoder = new SSEDecoder();
    const lineDecoder = new LineDecoder();
    const iter = ReadableStreamToAsyncIterable(response.body);
    for await (const sseChunk of iterSSEChunks(iter)) {
        for (const line of lineDecoder.decode(sseChunk)) {
            const sse = sseDecoder.decode(line);
            if (sse)
                yield sse;
        }
    }
    for (const line of lineDecoder.flush()) {
        const sse = sseDecoder.decode(line);
        if (sse)
            yield sse;
    }
}
/**
 * Given an async iterable iterator, iterates over it and yields full
 * SSE chunks, i.e. yields when a double new-line is encountered.
 */
async function* iterSSEChunks(iterator) {
    let data = new Uint8Array();
    for await (const chunk of iterator) {
        if (chunk == null) {
            continue;
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk)
            : typeof chunk === 'string' ? bytes_encodeUTF8(chunk)
                : chunk;
        let newData = new Uint8Array(data.length + binaryChunk.length);
        newData.set(data);
        newData.set(binaryChunk, data.length);
        data = newData;
        let patternIndex;
        while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
            yield data.slice(0, patternIndex);
            data = data.slice(patternIndex);
        }
    }
    if (data.length > 0) {
        yield data;
    }
}
class SSEDecoder {
    constructor() {
        this.event = null;
        this.data = [];
        this.chunks = [];
    }
    decode(line) {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }
        if (!line) {
            // empty line and we didn't previously encounter any messages
            if (!this.event && !this.data.length)
                return null;
            const sse = {
                event: this.event,
                data: this.data.join('\n'),
                raw: this.chunks,
            };
            this.event = null;
            this.data = [];
            this.chunks = [];
            return sse;
        }
        this.chunks.push(line);
        if (line.startsWith(':')) {
            return null;
        }
        let [fieldname, _, value] = partition(line, ':');
        if (value.startsWith(' ')) {
            value = value.substring(1);
        }
        if (fieldname === 'event') {
            this.event = value;
        }
        else if (fieldname === 'data') {
            this.data.push(value);
        }
        return null;
    }
}
function partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
        return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
    }
    return [str, '', ''];
}
//# sourceMappingURL=streaming.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/parse.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


async function defaultParseResponse(client, props) {
    const { response, requestLogID, retryOfRequestLogID, startTime } = props;
    const body = await (async () => {
        if (props.options.stream) {
            loggerFor(client).debug('response', response.status, response.url, response.headers, response.body);
            // Note: there is an invariant here that isn't represented in the type system
            // that if you set `stream: true` the response type must also be `Stream<T>`
            if (props.options.__streamClass) {
                return props.options.__streamClass.fromSSEResponse(response, props.controller);
            }
            return Stream.fromSSEResponse(response, props.controller);
        }
        // fetch refuses to read the body when the status code is 204.
        if (response.status === 204) {
            return null;
        }
        if (props.options.__binaryResponse) {
            return response;
        }
        const contentType = response.headers.get('content-type');
        const mediaType = contentType?.split(';')[0]?.trim();
        const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
        if (isJSON) {
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0') {
                // if there is no content we can't do anything
                return undefined;
            }
            const json = await response.json();
            return addRequestID(json, response);
        }
        const text = await response.text();
        return text;
    })();
    loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        body,
        durationMs: Date.now() - startTime,
    }));
    return body;
}
function addRequestID(value, response) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }
    return Object.defineProperty(value, '_request_id', {
        value: response.headers.get('request-id'),
        enumerable: false,
    });
}
//# sourceMappingURL=parse.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/core/api-promise.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _APIPromise_client;


/**
 * A subclass of `Promise` providing additional helper methods
 * for interacting with the SDK.
 */
class APIPromise extends Promise {
    constructor(client, responsePromise, parseResponse = defaultParseResponse) {
        super((resolve) => {
            // this is maybe a bit weird but this has to be a no-op to not implicitly
            // parse the response body; instead .then, .catch, .finally are overridden
            // to parse the response
            resolve(null);
        });
        this.responsePromise = responsePromise;
        this.parseResponse = parseResponse;
        _APIPromise_client.set(this, void 0);
        __classPrivateFieldSet(this, _APIPromise_client, client, "f");
    }
    _thenUnwrap(transform) {
        return new APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
    }
    /**
     * Gets the raw `Response` instance instead of parsing the response
     * data.
     *
     * If you want to parse the response body but still get the `Response`
     * instance, you can use {@link withResponse()}.
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
     * to your `tsconfig.json`.
     */
    asResponse() {
        return this.responsePromise.then((p) => p.response);
    }
    /**
     * Gets the parsed response data, the raw `Response` instance and the ID of the request,
     * returned via the `request-id` header which is useful for debugging requests and resporting
     * issues to Anthropic.
     *
     * If you just want to get the raw `Response` instance without parsing it,
     * you can use {@link asResponse()}.
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
     * to your `tsconfig.json`.
     */
    async withResponse() {
        const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
        return { data, response, request_id: response.headers.get('request-id') };
    }
    parse() {
        if (!this.parsedPromise) {
            this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
        }
        return this.parsedPromise;
    }
    then(onfulfilled, onrejected) {
        return this.parse().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.parse().catch(onrejected);
    }
    finally(onfinally) {
        return this.parse().finally(onfinally);
    }
}
_APIPromise_client = new WeakMap();
//# sourceMappingURL=api-promise.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/core/pagination.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _AbstractPage_client;





class AbstractPage {
    constructor(client, response, body, options) {
        _AbstractPage_client.set(this, void 0);
        __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
        this.options = options;
        this.response = response;
        this.body = body;
    }
    hasNextPage() {
        const items = this.getPaginatedItems();
        if (!items.length)
            return false;
        return this.nextPageRequestOptions() != null;
    }
    async getNextPage() {
        const nextOptions = this.nextPageRequestOptions();
        if (!nextOptions) {
            throw new error_AnthropicError('No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.');
        }
        return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
    }
    async *iterPages() {
        let page = this;
        yield page;
        while (page.hasNextPage()) {
            page = await page.getNextPage();
            yield page;
        }
    }
    async *[(_AbstractPage_client = new WeakMap(), Symbol.asyncIterator)]() {
        for await (const page of this.iterPages()) {
            for (const item of page.getPaginatedItems()) {
                yield item;
            }
        }
    }
}
/**
 * This subclass of Promise will resolve to an instantiated Page once the request completes.
 *
 * It also implements AsyncIterable to allow auto-paginating iteration on an unawaited list call, eg:
 *
 *    for await (const item of client.items.list()) {
 *      console.log(item)
 *    }
 */
class PagePromise extends APIPromise {
    constructor(client, request, Page) {
        super(client, request, async (client, props) => new Page(client, props.response, await defaultParseResponse(client, props), props.options));
    }
    /**
     * Allow auto-paginating iteration on an unawaited list call, eg:
     *
     *    for await (const item of client.items.list()) {
     *      console.log(item)
     *    }
     */
    async *[Symbol.asyncIterator]() {
        const page = await this;
        for await (const item of page) {
            yield item;
        }
    }
}
class Page extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
        this.first_id = body.first_id || null;
        this.last_id = body.last_id || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    hasNextPage() {
        if (this.has_more === false) {
            return false;
        }
        return super.hasNextPage();
    }
    nextPageRequestOptions() {
        if (this.options.query?.['before_id']) {
            // in reverse
            const first_id = this.first_id;
            if (!first_id) {
                return null;
            }
            return {
                ...this.options,
                query: {
                    ...maybeObj(this.options.query),
                    before_id: first_id,
                },
            };
        }
        const cursor = this.last_id;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                after_id: cursor,
            },
        };
    }
}
class TokenPage extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
        this.next_page = body.next_page || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    hasNextPage() {
        if (this.has_more === false) {
            return false;
        }
        return super.hasNextPage();
    }
    nextPageRequestOptions() {
        const cursor = this.next_page;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                page_token: cursor,
            },
        };
    }
}
class PageCursor extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.next_page = body.next_page || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    nextPageRequestOptions() {
        const cursor = this.next_page;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                page: cursor,
            },
        };
    }
}
//# sourceMappingURL=pagination.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/uploads.mjs

const checkFileSupport = () => {
    if (typeof File === 'undefined') {
        const { process } = globalThis;
        const isOldNode = typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')) < 20;
        throw new Error('`File` is not defined as a global, which is required for file uploads.' +
            (isOldNode ?
                " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
                : ''));
    }
};
/**
 * Construct a `File` instance. This is used to ensure a helpful error is thrown
 * for environments that don't define a global `File` yet.
 */
function makeFile(fileBits, fileName, options) {
    checkFileSupport();
    return new File(fileBits, fileName ?? 'unknown_file', options);
}
function getName(value, stripPath) {
    const val = (typeof value === 'object' &&
        value !== null &&
        (('name' in value && value.name && String(value.name)) ||
            ('url' in value && value.url && String(value.url)) ||
            ('filename' in value && value.filename && String(value.filename)) ||
            ('path' in value && value.path && String(value.path)))) ||
        '';
    return stripPath ? val.split(/[\\/]/).pop() || undefined : val;
}
const isAsyncIterable = (value) => value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';
/**
 * Returns a multipart/form-data request if any part of the given request body contains a File / Blob value.
 * Otherwise returns the request as is.
 */
const maybeMultipartFormRequestOptions = async (opts, fetch) => {
    if (!hasUploadableValue(opts.body))
        return opts;
    return { ...opts, body: await createForm(opts.body, fetch) };
};
const multipartFormRequestOptions = async (opts, fetch, stripFilenames = true) => {
    return { ...opts, body: await createForm(opts.body, fetch, stripFilenames) };
};
const supportsFormDataMap = /* @__PURE__ */ new WeakMap();
/**
 * node-fetch doesn't support the global FormData object in recent node versions. Instead of sending
 * properly-encoded form data, it just stringifies the object, resulting in a request body of "[object FormData]".
 * This function detects if the fetch function provided supports the global FormData object to avoid
 * confusing error messages later on.
 */
function supportsFormData(fetchObject) {
    const fetch = typeof fetchObject === 'function' ? fetchObject : fetchObject.fetch;
    const cached = supportsFormDataMap.get(fetch);
    if (cached)
        return cached;
    const promise = (async () => {
        try {
            const FetchResponse = ('Response' in fetch ?
                fetch.Response
                : (await fetch('data:,')).constructor);
            const data = new FormData();
            if (data.toString() === (await new FetchResponse(data).text())) {
                return false;
            }
            return true;
        }
        catch {
            // avoid false negatives
            return true;
        }
    })();
    supportsFormDataMap.set(fetch, promise);
    return promise;
}
const createForm = async (body, fetch, stripFilenames = true) => {
    if (!(await supportsFormData(fetch))) {
        throw new TypeError('The provided fetch function does not support file uploads with the current global FormData class.');
    }
    const form = new FormData();
    await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value, stripFilenames)));
    return form;
};
// We check for Blob not File because Bun.File doesn't inherit from File,
// but they both inherit from Blob and have a `name` property at runtime.
const isNamedBlob = (value) => value instanceof Blob && 'name' in value;
const isUploadable = (value) => typeof value === 'object' &&
    value !== null &&
    (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));
const hasUploadableValue = (value) => {
    if (isUploadable(value))
        return true;
    if (Array.isArray(value))
        return value.some(hasUploadableValue);
    if (value && typeof value === 'object') {
        for (const k in value) {
            if (hasUploadableValue(value[k]))
                return true;
        }
    }
    return false;
};
const addFormValue = async (form, key, value, stripFilenames) => {
    if (value === undefined)
        return;
    if (value == null) {
        throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
    }
    // TODO: make nested formats configurable
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        form.append(key, String(value));
    }
    else if (value instanceof Response) {
        let options = {};
        const contentType = value.headers.get('Content-Type');
        if (contentType) {
            options = { type: contentType };
        }
        form.append(key, makeFile([await value.blob()], getName(value, stripFilenames), options));
    }
    else if (isAsyncIterable(value)) {
        form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value, stripFilenames)));
    }
    else if (isNamedBlob(value)) {
        form.append(key, makeFile([value], getName(value, stripFilenames), { type: value.type }));
    }
    else if (Array.isArray(value)) {
        await Promise.all(value.map((entry) => addFormValue(form, key + '[]', entry, stripFilenames)));
    }
    else if (typeof value === 'object') {
        await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop, stripFilenames)));
    }
    else {
        throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
    }
};
//# sourceMappingURL=uploads.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/to-file.mjs


/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */
const isBlobLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.text === 'function' &&
    typeof value.slice === 'function' &&
    typeof value.arrayBuffer === 'function';
/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */
const isFileLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.lastModified === 'number' &&
    isBlobLike(value);
const isResponseLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.url === 'string' &&
    typeof value.blob === 'function';
/**
 * Helper for creating a {@link File} to pass to an SDK upload method from a variety of different data formats
 * @param value the raw content of the file. Can be an {@link Uploadable}, BlobLikePart, or AsyncIterable of BlobLikeParts
 * @param {string=} name the name of the file. If omitted, toFile will try to determine a file name from bits if possible
 * @param {Object=} options additional properties
 * @param {string=} options.type the MIME type of the content
 * @param {number=} options.lastModified the last modified timestamp
 * @returns a {@link File} with the given properties
 */
async function toFile(value, name, options) {
    checkFileSupport();
    // If it's a promise, resolve it.
    value = await value;
    name || (name = getName(value, true));
    // If we've been given a `File` we don't need to do anything if the name / options
    // have not been customised.
    if (isFileLike(value)) {
        if (value instanceof File && name == null && options == null) {
            return value;
        }
        return makeFile([await value.arrayBuffer()], name ?? value.name, {
            type: value.type,
            lastModified: value.lastModified,
            ...options,
        });
    }
    if (isResponseLike(value)) {
        const blob = await value.blob();
        name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
        return makeFile(await getBytes(blob), name, options);
    }
    const parts = await getBytes(value);
    if (!options?.type) {
        const type = parts.find((part) => typeof part === 'object' && 'type' in part && part.type);
        if (typeof type === 'string') {
            options = { ...options, type };
        }
    }
    return makeFile(parts, name, options);
}
async function getBytes(value) {
    let parts = [];
    if (typeof value === 'string' ||
        ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
        value instanceof ArrayBuffer) {
        parts.push(value);
    }
    else if (isBlobLike(value)) {
        parts.push(value instanceof Blob ? value : await value.arrayBuffer());
    }
    else if (isAsyncIterable(value) // includes Readable, ReadableStream, etc.
    ) {
        for await (const chunk of value) {
            parts.push(...(await getBytes(chunk))); // TODO, consider validating?
        }
    }
    else {
        const constructor = value?.constructor?.name;
        throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ''}${propsForError(value)}`);
    }
    return parts;
}
function propsForError(value) {
    if (typeof value !== 'object' || value === null)
        return '';
    const props = Object.getOwnPropertyNames(value);
    return `; props: [${props.map((p) => `"${p}"`).join(', ')}]`;
}
//# sourceMappingURL=to-file.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/core/uploads.mjs

//# sourceMappingURL=uploads.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/core/resource.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
class APIResource {
    constructor(client) {
        this._client = client;
    }
}
//# sourceMappingURL=resource.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/headers.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

const brand_privateNullableHeaders = Symbol.for('brand.privateNullableHeaders');
function* iterateHeaders(headers) {
    if (!headers)
        return;
    if (brand_privateNullableHeaders in headers) {
        const { values, nulls } = headers;
        yield* values.entries();
        for (const name of nulls) {
            yield [name, null];
        }
        return;
    }
    let shouldClear = false;
    let iter;
    if (headers instanceof Headers) {
        iter = headers.entries();
    }
    else if (isReadonlyArray(headers)) {
        iter = headers;
    }
    else {
        shouldClear = true;
        iter = Object.entries(headers ?? {});
    }
    for (let row of iter) {
        const name = row[0];
        if (typeof name !== 'string')
            throw new TypeError('expected header name to be a string');
        const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
        let didClear = false;
        for (const value of values) {
            if (value === undefined)
                continue;
            // Objects keys always overwrite older headers, they never append.
            // Yield a null to clear the header before adding the new values.
            if (shouldClear && !didClear) {
                didClear = true;
                yield [name, null];
            }
            yield [name, value];
        }
    }
}
const buildHeaders = (newHeaders) => {
    const targetHeaders = new Headers();
    const nullHeaders = new Set();
    for (const headers of newHeaders) {
        const seenHeaders = new Set();
        for (const [name, value] of iterateHeaders(headers)) {
            const lowerName = name.toLowerCase();
            if (!seenHeaders.has(lowerName)) {
                targetHeaders.delete(name);
                seenHeaders.add(lowerName);
            }
            if (value === null) {
                targetHeaders.delete(name);
                nullHeaders.add(lowerName);
            }
            else {
                targetHeaders.append(name, value);
                nullHeaders.delete(lowerName);
            }
        }
    }
    return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
};
const isEmptyHeaders = (headers) => {
    for (const _ of iterateHeaders(headers))
        return false;
    return true;
};
//# sourceMappingURL=headers.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/utils/path.mjs

/**
 * Percent-encode everything that isn't safe to have in a path without encoding safe chars.
 *
 * Taken from https://datatracker.ietf.org/doc/html/rfc3986#section-3.3:
 * > unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
 * > sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * > pchar       = unreserved / pct-encoded / sub-delims / ":" / "@"
 */
function encodeURIPath(str) {
    return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path(statics, ...params) {
    // If there are no params, no processing is needed.
    if (statics.length === 1)
        return statics[0];
    let postPath = false;
    const invalidSegments = [];
    const path = statics.reduce((previousValue, currentValue, index) => {
        if (/[?#]/.test(currentValue)) {
            postPath = true;
        }
        const value = params[index];
        let encoded = (postPath ? encodeURIComponent : pathEncoder)('' + value);
        if (index !== params.length &&
            (value == null ||
                (typeof value === 'object' &&
                    // handle values from other realms
                    value.toString ===
                        Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)
                            ?.toString))) {
            encoded = value + '';
            invalidSegments.push({
                start: previousValue.length + currentValue.length,
                length: encoded.length,
                error: `Value of type ${Object.prototype.toString
                    .call(value)
                    .slice(8, -1)} is not a valid path parameter`,
            });
        }
        return previousValue + currentValue + (index === params.length ? '' : encoded);
    }, '');
    const pathOnly = path.split(/[?#]/, 1)[0];
    const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
    let match;
    // Find all invalid segments
    while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
        invalidSegments.push({
            start: match.index,
            length: match[0].length,
            error: `Value "${match[0]}" can\'t be safely passed as a path parameter`,
        });
    }
    invalidSegments.sort((a, b) => a.start - b.start);
    if (invalidSegments.length > 0) {
        let lastEnd = 0;
        const underline = invalidSegments.reduce((acc, segment) => {
            const spaces = ' '.repeat(segment.start - lastEnd);
            const arrows = '^'.repeat(segment.length);
            lastEnd = segment.start + segment.length;
            return acc + spaces + arrows;
        }, '');
        throw new error_AnthropicError(`Path parameters result in path with invalid segments:\n${invalidSegments
            .map((e) => e.error)
            .join('\n')}\n${path}\n${underline}`);
    }
    return path;
};
/**
 * URI-encodes path params and ensures no unsafe /./ or /../ path segments are introduced.
 */
const path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
//# sourceMappingURL=path.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/environments.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Environments extends APIResource {
    /**
     * Create a new environment with the specified configuration.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.create({
     *     name: 'python-data-analysis',
     *   });
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/environments?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Retrieve a specific environment by ID.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.retrieve(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */
    retrieve(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/environments/${environmentID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update an existing environment's configuration.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.update(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */
    update(environmentID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/environments/${environmentID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List environments with pagination support.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaEnvironment of client.beta.environments.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/environments?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete an environment by ID. Returns a confirmation of the deletion.
     *
     * @example
     * ```ts
     * const betaEnvironmentDeleteResponse =
     *   await client.beta.environments.delete(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */
    delete(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/v1/environments/${environmentID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive an environment by ID. Archived environments cannot be used to create new
     * sessions.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.archive(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */
    archive(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/environments/${environmentID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=environments.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs
/**
 * Shared utilities for tracking SDK helper usage.
 */
/**
 * Symbol used to mark objects created by SDK helpers for tracking.
 * The value is the helper name (e.g., 'mcpTool', 'betaZodTool').
 */
const SDK_HELPER_SYMBOL = Symbol('anthropic.sdk.stainlessHelper');
function wasCreatedByStainlessHelper(value) {
    return typeof value === 'object' && value !== null && SDK_HELPER_SYMBOL in value;
}
/**
 * Collects helper names from tools and messages arrays.
 * Returns a deduplicated array of helper names found.
 */
function collectStainlessHelpers(tools, messages) {
    const helpers = new Set();
    // Collect from tools
    if (tools) {
        for (const tool of tools) {
            if (wasCreatedByStainlessHelper(tool)) {
                helpers.add(tool[SDK_HELPER_SYMBOL]);
            }
        }
    }
    // Collect from messages and their content blocks
    if (messages) {
        for (const message of messages) {
            if (wasCreatedByStainlessHelper(message)) {
                helpers.add(message[SDK_HELPER_SYMBOL]);
            }
            if (Array.isArray(message.content)) {
                for (const block of message.content) {
                    if (wasCreatedByStainlessHelper(block)) {
                        helpers.add(block[SDK_HELPER_SYMBOL]);
                    }
                }
            }
        }
    }
    return Array.from(helpers);
}
/**
 * Builds x-stainless-helper header value from tools and messages.
 * Returns an empty object if no helpers are found.
 */
function stainlessHelperHeader(tools, messages) {
    const helpers = collectStainlessHelpers(tools, messages);
    if (helpers.length === 0)
        return {};
    return { 'x-stainless-helper': helpers.join(', ') };
}
/**
 * Builds x-stainless-helper header value from a file object.
 * Returns an empty object if the file is not marked with a helper.
 */
function stainlessHelperHeaderFromFile(file) {
    if (wasCreatedByStainlessHelper(file)) {
        return { 'x-stainless-helper': file[SDK_HELPER_SYMBOL] };
    }
    return {};
}
//# sourceMappingURL=stainless-helper-header.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/files.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.






class Files extends APIResource {
    /**
     * List Files
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const fileMetadata of client.beta.files.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/files?beta=true', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'files-api-2025-04-14'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete File
     *
     * @example
     * ```ts
     * const deletedFile = await client.beta.files.delete(
     *   'file_id',
     * );
     * ```
     */
    delete(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/v1/files/${fileID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'files-api-2025-04-14'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Download File
     *
     * @example
     * ```ts
     * const response = await client.beta.files.download(
     *   'file_id',
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/files/${fileID}/content?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'files-api-2025-04-14'].toString(),
                    Accept: 'application/binary',
                },
                options?.headers,
            ]),
            __binaryResponse: true,
        });
    }
    /**
     * Get File Metadata
     *
     * @example
     * ```ts
     * const fileMetadata =
     *   await client.beta.files.retrieveMetadata('file_id');
     * ```
     */
    retrieveMetadata(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/files/${fileID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'files-api-2025-04-14'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Upload File
     *
     * @example
     * ```ts
     * const fileMetadata = await client.beta.files.upload({
     *   file: fs.createReadStream('path/to/file'),
     * });
     * ```
     */
    upload(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/files?beta=true', multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'files-api-2025-04-14'].toString() },
                stainlessHelperHeaderFromFile(body.file),
                options?.headers,
            ]),
        }, this._client));
    }
}
//# sourceMappingURL=files.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/models.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Models extends APIResource {
    /**
     * Get a specific model.
     *
     * The Models API response can be used to determine information about a specific
     * model or resolve a model alias to a model ID.
     *
     * @example
     * ```ts
     * const betaModelInfo = await client.beta.models.retrieve(
     *   'model_id',
     * );
     * ```
     */
    retrieve(modelID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/models/${modelID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * List available models.
     *
     * The Models API response can be used to determine which models are available for
     * use in the API. More recently released models are listed first.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaModelInfo of client.beta.models.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/models?beta=true', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=models.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/user-profiles.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class UserProfiles extends APIResource {
    /**
     * Create User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.create();
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/user_profiles?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-03-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Get User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.retrieve(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */
    retrieve(userProfileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/user_profiles/${userProfileID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-03-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.update(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */
    update(userProfileID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/user_profiles/${userProfileID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-03-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List User Profiles
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaUserProfile of client.beta.userProfiles.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/user_profiles?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-03-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Create Enrollment URL
     *
     * @example
     * ```ts
     * const betaUserProfileEnrollmentURL =
     *   await client.beta.userProfiles.createEnrollmentURL(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */
    createEnrollmentURL(userProfileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/user_profiles/${userProfileID}/enrollment_url?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-03-24'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=user-profiles.mjs.map
// EXTERNAL MODULE: ./node_modules/standardwebhooks/dist/index.js
var dist = __webpack_require__(5487);
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/webhooks.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


class Webhooks extends APIResource {
    unwrap(body, { headers, key }) {
        if (headers !== undefined) {
            const keyStr = key === undefined ? this._client.webhookKey : key;
            if (keyStr === null)
                throw new Error('Webhook key must not be null in order to unwrap');
            const wh = new dist/* Webhook */.KD(keyStr);
            wh.verify(body, headers);
        }
        return JSON.parse(body);
    }
}
//# sourceMappingURL=webhooks.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/agents/versions.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Versions extends APIResource {
    /**
     * List Agent Versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsAgent of client.beta.agents.versions.list(
     *   'agent_011CZkYpogX7uDKUyvBTophP',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(agentID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/agents/${agentID}/versions?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=versions.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/agents/agents.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.






class Agents extends APIResource {
    constructor() {
        super(...arguments);
        this.versions = new Versions(this._client);
    }
    /**
     * Create Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.create({
     *     model: 'claude-sonnet-4-6',
     *     name: 'My First Agent',
     *   });
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/agents?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Get Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.retrieve(
     *     'agent_011CZkYpogX7uDKUyvBTophP',
     *   );
     * ```
     */
    retrieve(agentID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.get(path `/v1/agents/${agentID}?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.update(
     *     'agent_011CZkYpogX7uDKUyvBTophP',
     *     { version: 1 },
     *   );
     * ```
     */
    update(agentID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/agents/${agentID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Agents
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsAgent of client.beta.agents.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/agents?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.archive(
     *     'agent_011CZkYpogX7uDKUyvBTophP',
     *   );
     * ```
     */
    archive(agentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/agents/${agentID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
Agents.Versions = Versions;
//# sourceMappingURL=agents.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memories.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Memories extends APIResource {
    /**
     * Create a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.create(
     *     'memory_store_id',
     *     { content: 'content', path: 'xx' },
     *   );
     * ```
     */
    create(memoryStoreID, params, options) {
        const { view, betas, ...body } = params;
        return this._client.post(path `/v1/memory_stores/${memoryStoreID}/memories?beta=true`, {
            query: { view },
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Retrieve a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.retrieve(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    retrieve(memoryID, params, options) {
        const { memory_store_id, betas, ...query } = params;
        return this._client.get(path `/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.update(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    update(memoryID, params, options) {
        const { memory_store_id, view, betas, ...body } = params;
        return this._client.post(path `/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query: { view },
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List memories
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryListItem of client.beta.memoryStores.memories.list(
     *   'memory_store_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(memoryStoreID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/memory_stores/${memoryStoreID}/memories?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedMemory =
     *   await client.beta.memoryStores.memories.delete(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    delete(memoryID, params, options) {
        const { memory_store_id, expected_content_sha256, betas } = params;
        return this._client.delete(path `/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query: { expected_content_sha256 },
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=memories.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memory-versions.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class MemoryVersions extends APIResource {
    /**
     * Retrieve a memory version
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryVersion =
     *   await client.beta.memoryStores.memoryVersions.retrieve(
     *     'memory_version_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    retrieve(memoryVersionID, params, options) {
        const { memory_store_id, betas, ...query } = params;
        return this._client.get(path `/v1/memory_stores/${memory_store_id}/memory_versions/${memoryVersionID}?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List memory versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryVersion of client.beta.memoryStores.memoryVersions.list(
     *   'memory_store_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(memoryStoreID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/memory_stores/${memoryStoreID}/memory_versions?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Redact a memory version
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryVersion =
     *   await client.beta.memoryStores.memoryVersions.redact(
     *     'memory_version_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    redact(memoryVersionID, params, options) {
        const { memory_store_id, betas } = params;
        return this._client.post(path `/v1/memory_stores/${memory_store_id}/memory_versions/${memoryVersionID}/redact?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=memory-versions.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memory-stores.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.








class MemoryStores extends APIResource {
    constructor() {
        super(...arguments);
        this.memories = new Memories(this._client);
        this.memoryVersions = new MemoryVersions(this._client);
    }
    /**
     * Create a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.create({ name: 'x' });
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/memory_stores?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Retrieve a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.retrieve(
     *     'memory_store_id',
     *   );
     * ```
     */
    retrieve(memoryStoreID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/memory_stores/${memoryStoreID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.update('memory_store_id');
     * ```
     */
    update(memoryStoreID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/memory_stores/${memoryStoreID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List memory stores
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryStore of client.beta.memoryStores.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/memory_stores?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedMemoryStore =
     *   await client.beta.memoryStores.delete('memory_store_id');
     * ```
     */
    delete(memoryStoreID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/v1/memory_stores/${memoryStoreID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.archive('memory_store_id');
     * ```
     */
    archive(memoryStoreID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/memory_stores/${memoryStoreID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
MemoryStores.Memories = Memories;
MemoryStores.MemoryVersions = MemoryVersions;
//# sourceMappingURL=memory-stores.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/error.mjs

//# sourceMappingURL=error.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs



class JSONLDecoder {
    constructor(iterator, controller) {
        this.iterator = iterator;
        this.controller = controller;
    }
    async *decoder() {
        const lineDecoder = new LineDecoder();
        for await (const chunk of this.iterator) {
            for (const line of lineDecoder.decode(chunk)) {
                yield JSON.parse(line);
            }
        }
        for (const line of lineDecoder.flush()) {
            yield JSON.parse(line);
        }
    }
    [Symbol.asyncIterator]() {
        return this.decoder();
    }
    static fromResponse(response, controller) {
        if (!response.body) {
            controller.abort();
            if (typeof globalThis.navigator !== 'undefined' &&
                globalThis.navigator.product === 'ReactNative') {
                throw new error_AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
            }
            throw new error_AnthropicError(`Attempted to iterate over a response with no body`);
        }
        return new JSONLDecoder(ReadableStreamToAsyncIterable(response.body), controller);
    }
}
//# sourceMappingURL=jsonl.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.






class Batches extends APIResource {
    /**
     * Send a batch of Message creation requests.
     *
     * The Message Batches API can be used to process multiple Messages API requests at
     * once. Once a Message Batch is created, it begins processing immediately. Batches
     * can take up to 24 hours to complete.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.create({
     *     requests: [
     *       {
     *         custom_id: 'my-custom-id-1',
     *         params: {
     *           max_tokens: 1024,
     *           messages: [
     *             { content: 'Hello, world', role: 'user' },
     *           ],
     *           model: 'claude-opus-4-6',
     *         },
     *       },
     *     ],
     *   });
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/messages/batches?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * This endpoint is idempotent and can be used to poll for Message Batch
     * completion. To access the results of a Message Batch, make a request to the
     * `results_url` field in the response.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.retrieve(
     *     'message_batch_id',
     *   );
     * ```
     */
    retrieve(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/messages/batches/${messageBatchID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List all Message Batches within a Workspace. Most recently created batches are
     * returned first.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaMessageBatch of client.beta.messages.batches.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/messages/batches?beta=true', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete a Message Batch.
     *
     * Message Batches can only be deleted once they've finished processing. If you'd
     * like to delete an in-progress batch, you must first cancel it.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaDeletedMessageBatch =
     *   await client.beta.messages.batches.delete(
     *     'message_batch_id',
     *   );
     * ```
     */
    delete(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/v1/messages/batches/${messageBatchID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Batches may be canceled any time before processing ends. Once cancellation is
     * initiated, the batch enters a `canceling` state, at which time the system may
     * complete any in-progress, non-interruptible requests before finalizing
     * cancellation.
     *
     * The number of canceled requests is specified in `request_counts`. To determine
     * which requests were canceled, check the individual results within the batch.
     * Note that cancellation may not result in any canceled requests if they were
     * non-interruptible.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.cancel(
     *     'message_batch_id',
     *   );
     * ```
     */
    cancel(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/messages/batches/${messageBatchID}/cancel?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Streams the results of a Message Batch as a `.jsonl` file.
     *
     * Each line in the file is a JSON object containing the result of a single request
     * in the Message Batch. Results are not guaranteed to be in the same order as
     * requests. Use the `custom_id` field to match results to requests.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatchIndividualResponse =
     *   await client.beta.messages.batches.results(
     *     'message_batch_id',
     *   );
     * ```
     */
    async results(messageBatchID, params = {}, options) {
        const batch = await this.retrieve(messageBatchID);
        if (!batch.results_url) {
            throw new error_AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        const { betas } = params ?? {};
        return this._client
            .get(batch.results_url, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString(),
                    Accept: 'application/binary',
                },
                options?.headers,
            ]),
            stream: true,
            __binaryResponse: true,
        })
            ._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
    }
}
//# sourceMappingURL=batches.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/internal/constants.mjs
// File containing shared constants
/**
 * Model-specific timeout constraints for non-streaming requests
 */
const MODEL_NONSTREAMING_TOKENS = {
    'claude-opus-4-20250514': 8192,
    'claude-opus-4-0': 8192,
    'claude-4-opus-20250514': 8192,
    'anthropic.claude-opus-4-20250514-v1:0': 8192,
    'claude-opus-4@20250514': 8192,
    'claude-opus-4-1-20250805': 8192,
    'anthropic.claude-opus-4-1-20250805-v1:0': 8192,
    'claude-opus-4-1@20250805': 8192,
};
//# sourceMappingURL=constants.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs

function getOutputFormat(params) {
    // Prefer output_format (deprecated) over output_config.format for backward compatibility
    return params?.output_format ?? params?.output_config?.format;
}
function maybeParseBetaMessage(message, params, opts) {
    const outputFormat = getOutputFormat(params);
    if (!params || !('parse' in (outputFormat ?? {}))) {
        return {
            ...message,
            content: message.content.map((block) => {
                if (block.type === 'text') {
                    const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                        value: null,
                        enumerable: false,
                    });
                    return Object.defineProperty(parsedBlock, 'parsed', {
                        get() {
                            opts.logger.warn('The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.');
                            return null;
                        },
                        enumerable: false,
                    });
                }
                return block;
            }),
            parsed_output: null,
        };
    }
    return parseBetaMessage(message, params, opts);
}
function parseBetaMessage(message, params, opts) {
    let firstParsedOutput = null;
    const content = message.content.map((block) => {
        if (block.type === 'text') {
            const parsedOutput = parseBetaOutputFormat(params, block.text);
            if (firstParsedOutput === null) {
                firstParsedOutput = parsedOutput;
            }
            const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                value: parsedOutput,
                enumerable: false,
            });
            return Object.defineProperty(parsedBlock, 'parsed', {
                get() {
                    opts.logger.warn('The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.');
                    return parsedOutput;
                },
                enumerable: false,
            });
        }
        return block;
    });
    return {
        ...message,
        content,
        parsed_output: firstParsedOutput,
    };
}
function parseBetaOutputFormat(params, content) {
    const outputFormat = getOutputFormat(params);
    if (outputFormat?.type !== 'json_schema') {
        return null;
    }
    try {
        if ('parse' in outputFormat) {
            return outputFormat.parse(content);
        }
        return JSON.parse(content);
    }
    catch (error) {
        throw new error_AnthropicError(`Failed to parse structured output: ${error}`);
    }
}
//# sourceMappingURL=beta-parser.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs
const tokenize = (input) => {
    let current = 0;
    let tokens = [];
    while (current < input.length) {
        let char = input[current];
        if (char === '\\') {
            current++;
            continue;
        }
        if (char === '{') {
            tokens.push({
                type: 'brace',
                value: '{',
            });
            current++;
            continue;
        }
        if (char === '}') {
            tokens.push({
                type: 'brace',
                value: '}',
            });
            current++;
            continue;
        }
        if (char === '[') {
            tokens.push({
                type: 'paren',
                value: '[',
            });
            current++;
            continue;
        }
        if (char === ']') {
            tokens.push({
                type: 'paren',
                value: ']',
            });
            current++;
            continue;
        }
        if (char === ':') {
            tokens.push({
                type: 'separator',
                value: ':',
            });
            current++;
            continue;
        }
        if (char === ',') {
            tokens.push({
                type: 'delimiter',
                value: ',',
            });
            current++;
            continue;
        }
        if (char === '"') {
            let value = '';
            let danglingQuote = false;
            char = input[++current];
            while (char !== '"') {
                if (current === input.length) {
                    danglingQuote = true;
                    break;
                }
                if (char === '\\') {
                    current++;
                    if (current === input.length) {
                        danglingQuote = true;
                        break;
                    }
                    value += char + input[current];
                    char = input[++current];
                }
                else {
                    value += char;
                    char = input[++current];
                }
            }
            char = input[++current];
            if (!danglingQuote) {
                tokens.push({
                    type: 'string',
                    value,
                });
            }
            continue;
        }
        let WHITESPACE = /\s/;
        if (char && WHITESPACE.test(char)) {
            current++;
            continue;
        }
        let NUMBERS = /[0-9]/;
        if ((char && NUMBERS.test(char)) || char === '-' || char === '.') {
            let value = '';
            if (char === '-') {
                value += char;
                char = input[++current];
            }
            while ((char && NUMBERS.test(char)) || char === '.') {
                value += char;
                char = input[++current];
            }
            tokens.push({
                type: 'number',
                value,
            });
            continue;
        }
        let LETTERS = /[a-z]/i;
        if (char && LETTERS.test(char)) {
            let value = '';
            while (char && LETTERS.test(char)) {
                if (current === input.length) {
                    break;
                }
                value += char;
                char = input[++current];
            }
            if (value == 'true' || value == 'false' || value === 'null') {
                tokens.push({
                    type: 'name',
                    value,
                });
            }
            else {
                // unknown token, e.g. `nul` which isn't quite `null`
                current++;
                continue;
            }
            continue;
        }
        current++;
    }
    return tokens;
}, strip = (tokens) => {
    if (tokens.length === 0) {
        return tokens;
    }
    let lastToken = tokens[tokens.length - 1];
    switch (lastToken.type) {
        case 'separator':
            tokens = tokens.slice(0, tokens.length - 1);
            return strip(tokens);
            break;
        case 'number':
            let lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
            if (lastCharacterOfLastToken === '.' || lastCharacterOfLastToken === '-') {
                tokens = tokens.slice(0, tokens.length - 1);
                return strip(tokens);
            }
        case 'string':
            let tokenBeforeTheLastToken = tokens[tokens.length - 2];
            if (tokenBeforeTheLastToken?.type === 'delimiter') {
                tokens = tokens.slice(0, tokens.length - 1);
                return strip(tokens);
            }
            else if (tokenBeforeTheLastToken?.type === 'brace' && tokenBeforeTheLastToken.value === '{') {
                tokens = tokens.slice(0, tokens.length - 1);
                return strip(tokens);
            }
            break;
        case 'delimiter':
            tokens = tokens.slice(0, tokens.length - 1);
            return strip(tokens);
            break;
    }
    return tokens;
}, unstrip = (tokens) => {
    let tail = [];
    tokens.map((token) => {
        if (token.type === 'brace') {
            if (token.value === '{') {
                tail.push('}');
            }
            else {
                tail.splice(tail.lastIndexOf('}'), 1);
            }
        }
        if (token.type === 'paren') {
            if (token.value === '[') {
                tail.push(']');
            }
            else {
                tail.splice(tail.lastIndexOf(']'), 1);
            }
        }
    });
    if (tail.length > 0) {
        tail.reverse().map((item) => {
            if (item === '}') {
                tokens.push({
                    type: 'brace',
                    value: '}',
                });
            }
            else if (item === ']') {
                tokens.push({
                    type: 'paren',
                    value: ']',
                });
            }
        });
    }
    return tokens;
}, generate = (tokens) => {
    let output = '';
    tokens.map((token) => {
        switch (token.type) {
            case 'string':
                output += '"' + token.value + '"';
                break;
            default:
                output += token.value;
                break;
        }
    });
    return output;
}, partialParse = (input) => JSON.parse(generate(unstrip(strip(tokenize(input)))));

//# sourceMappingURL=parser.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/streaming.mjs

//# sourceMappingURL=streaming.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/BetaMessageStream.mjs
var _BetaMessageStream_instances, _BetaMessageStream_currentMessageSnapshot, _BetaMessageStream_params, _BetaMessageStream_connectedPromise, _BetaMessageStream_resolveConnectedPromise, _BetaMessageStream_rejectConnectedPromise, _BetaMessageStream_endPromise, _BetaMessageStream_resolveEndPromise, _BetaMessageStream_rejectEndPromise, _BetaMessageStream_listeners, _BetaMessageStream_ended, _BetaMessageStream_errored, _BetaMessageStream_aborted, _BetaMessageStream_catchingPromiseCreated, _BetaMessageStream_response, _BetaMessageStream_request_id, _BetaMessageStream_logger, _BetaMessageStream_getFinalMessage, _BetaMessageStream_getFinalText, _BetaMessageStream_handleError, _BetaMessageStream_beginRequest, _BetaMessageStream_addStreamEvent, _BetaMessageStream_endRequest, _BetaMessageStream_accumulateMessage;






const JSON_BUF_PROPERTY = '__json_buf';
function tracksToolInput(content) {
    return content.type === 'tool_use' || content.type === 'server_tool_use' || content.type === 'mcp_tool_use';
}
class BetaMessageStream {
    constructor(params, opts) {
        _BetaMessageStream_instances.add(this);
        this.messages = [];
        this.receivedMessages = [];
        _BetaMessageStream_currentMessageSnapshot.set(this, void 0);
        _BetaMessageStream_params.set(this, null);
        this.controller = new AbortController();
        _BetaMessageStream_connectedPromise.set(this, void 0);
        _BetaMessageStream_resolveConnectedPromise.set(this, () => { });
        _BetaMessageStream_rejectConnectedPromise.set(this, () => { });
        _BetaMessageStream_endPromise.set(this, void 0);
        _BetaMessageStream_resolveEndPromise.set(this, () => { });
        _BetaMessageStream_rejectEndPromise.set(this, () => { });
        _BetaMessageStream_listeners.set(this, {});
        _BetaMessageStream_ended.set(this, false);
        _BetaMessageStream_errored.set(this, false);
        _BetaMessageStream_aborted.set(this, false);
        _BetaMessageStream_catchingPromiseCreated.set(this, false);
        _BetaMessageStream_response.set(this, void 0);
        _BetaMessageStream_request_id.set(this, void 0);
        _BetaMessageStream_logger.set(this, void 0);
        _BetaMessageStream_handleError.set(this, (error) => {
            __classPrivateFieldSet(this, _BetaMessageStream_errored, true, "f");
            if (isAbortError(error)) {
                error = new APIUserAbortError();
            }
            if (error instanceof APIUserAbortError) {
                __classPrivateFieldSet(this, _BetaMessageStream_aborted, true, "f");
                return this._emit('abort', error);
            }
            if (error instanceof error_AnthropicError) {
                return this._emit('error', error);
            }
            if (error instanceof Error) {
                const anthropicError = new error_AnthropicError(error.message);
                // @ts-ignore
                anthropicError.cause = error;
                return this._emit('error', anthropicError);
            }
            return this._emit('error', new error_AnthropicError(String(error)));
        });
        __classPrivateFieldSet(this, _BetaMessageStream_connectedPromise, new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _BetaMessageStream_resolveConnectedPromise, resolve, "f");
            __classPrivateFieldSet(this, _BetaMessageStream_rejectConnectedPromise, reject, "f");
        }), "f");
        __classPrivateFieldSet(this, _BetaMessageStream_endPromise, new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _BetaMessageStream_resolveEndPromise, resolve, "f");
            __classPrivateFieldSet(this, _BetaMessageStream_rejectEndPromise, reject, "f");
        }), "f");
        // Don't let these promises cause unhandled rejection errors.
        // we will manually cause an unhandled rejection error later
        // if the user hasn't registered any error listener or called
        // any promise-returning method.
        __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f").catch(() => { });
        __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f").catch(() => { });
        __classPrivateFieldSet(this, _BetaMessageStream_params, params, "f");
        __classPrivateFieldSet(this, _BetaMessageStream_logger, opts?.logger ?? console, "f");
    }
    get response() {
        return __classPrivateFieldGet(this, _BetaMessageStream_response, "f");
    }
    get request_id() {
        return __classPrivateFieldGet(this, _BetaMessageStream_request_id, "f");
    }
    /**
     * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
     * returned vie the `request-id` header which is useful for debugging requests and resporting
     * issues to Anthropic.
     *
     * This is the same as the `APIPromise.withResponse()` method.
     *
     * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
     * as no `Response` is available.
     */
    async withResponse() {
        __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
        const response = await __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f");
        if (!response) {
            throw new Error('Could not resolve a `Response` object');
        }
        return {
            data: this,
            response,
            request_id: response.headers.get('request-id'),
        };
    }
    /**
     * Intended for use on the frontend, consuming a stream produced with
     * `.toReadableStream()` on the backend.
     *
     * Note that messages sent to the model do not appear in `.on('message')`
     * in this context.
     */
    static fromReadableStream(stream) {
        const runner = new BetaMessageStream(null);
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
    }
    static createMessage(messages, params, options, { logger } = {}) {
        const runner = new BetaMessageStream(params, { logger });
        for (const message of params.messages) {
            runner._addMessageParam(message);
        }
        __classPrivateFieldSet(runner, _BetaMessageStream_params, { ...params, stream: true }, "f");
        runner._run(() => runner._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, 'X-Stainless-Helper-Method': 'stream' } }));
        return runner;
    }
    _run(executor) {
        executor().then(() => {
            this._emitFinal();
            this._emit('end');
        }, __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f"));
    }
    _addMessageParam(message) {
        this.messages.push(message);
    }
    _addMessage(message, emit = true) {
        this.receivedMessages.push(message);
        if (emit) {
            this._emit('message', message);
        }
    }
    async _createMessage(messages, params, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted)
                this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
            const { response, data: stream } = await messages
                .create({ ...params, stream: true }, { ...options, signal: this.controller.signal })
                .withResponse();
            this._connected(response);
            for await (const event of stream) {
                __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new APIUserAbortError();
            }
            __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
        }
        finally {
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    _connected(response) {
        if (this.ended)
            return;
        __classPrivateFieldSet(this, _BetaMessageStream_response, response, "f");
        __classPrivateFieldSet(this, _BetaMessageStream_request_id, response?.headers.get('request-id'), "f");
        __classPrivateFieldGet(this, _BetaMessageStream_resolveConnectedPromise, "f").call(this, response);
        this._emit('connect');
    }
    get ended() {
        return __classPrivateFieldGet(this, _BetaMessageStream_ended, "f");
    }
    get errored() {
        return __classPrivateFieldGet(this, _BetaMessageStream_errored, "f");
    }
    get aborted() {
        return __classPrivateFieldGet(this, _BetaMessageStream_aborted, "f");
    }
    abort() {
        this.controller.abort();
    }
    /**
     * Adds the listener function to the end of the listeners array for the event.
     * No checks are made to see if the listener has already been added. Multiple calls passing
     * the same combination of event and listener will result in the listener being added, and
     * called, multiple times.
     * @returns this MessageStream, so that calls can be chained
     */
    on(event, listener) {
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
        listeners.push({ listener });
        return this;
    }
    /**
     * Removes the specified listener from the listener array for the event.
     * off() will remove, at most, one instance of a listener from the listener array. If any single
     * listener has been added multiple times to the listener array for the specified event, then
     * off() must be called multiple times to remove each instance.
     * @returns this MessageStream, so that calls can be chained
     */
    off(event, listener) {
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
        if (!listeners)
            return this;
        const index = listeners.findIndex((l) => l.listener === listener);
        if (index >= 0)
            listeners.splice(index, 1);
        return this;
    }
    /**
     * Adds a one-time listener function for the event. The next time the event is triggered,
     * this listener is removed and then invoked.
     * @returns this MessageStream, so that calls can be chained
     */
    once(event, listener) {
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
        listeners.push({ listener, once: true });
        return this;
    }
    /**
     * This is similar to `.once()`, but returns a Promise that resolves the next time
     * the event is triggered, instead of calling a listener callback.
     * @returns a Promise that resolves the next time given event is triggered,
     * or rejects if an error is emitted.  (If you request the 'error' event,
     * returns a promise that resolves with the error).
     *
     * Example:
     *
     *   const message = await stream.emitted('message') // rejects if the stream errors
     */
    emitted(event) {
        return new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
            if (event !== 'error')
                this.once('error', reject);
            this.once(event, resolve);
        });
    }
    async done() {
        __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
        await __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f");
    }
    get currentMessage() {
        return __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
    }
    /**
     * @returns a promise that resolves with the the final assistant Message response,
     * or rejects if an error occurred or the stream ended prematurely without producing a Message.
     * If structured outputs were used, this will be a ParsedMessage with a `parsed` field.
     */
    async finalMessage() {
        await this.done();
        return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this);
    }
    /**
     * @returns a promise that resolves with the the final assistant Message's text response, concatenated
     * together if there are more than one text blocks.
     * Rejects if an error occurred or the stream ended prematurely without producing a Message.
     */
    async finalText() {
        await this.done();
        return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalText).call(this);
    }
    _emit(event, ...args) {
        // make sure we don't emit any MessageStreamEvents after end
        if (__classPrivateFieldGet(this, _BetaMessageStream_ended, "f"))
            return;
        if (event === 'end') {
            __classPrivateFieldSet(this, _BetaMessageStream_ended, true, "f");
            __classPrivateFieldGet(this, _BetaMessageStream_resolveEndPromise, "f").call(this);
        }
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
        if (listeners) {
            __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
            listeners.forEach(({ listener }) => listener(...args));
        }
        if (event === 'abort') {
            const error = args[0];
            if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                Promise.reject(error);
            }
            __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
            __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
            return;
        }
        if (event === 'error') {
            // NOTE: _emit('error', error) should only be called from #handleError().
            const error = args[0];
            if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                // Trigger an unhandled rejection if the user hasn't registered any error handlers.
                // If you are seeing stack traces here, make sure to handle errors via either:
                // - runner.on('error', () => ...)
                // - await runner.done()
                // - await runner.final...()
                // - etc.
                Promise.reject(error);
            }
            __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
            __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
        }
    }
    _emitFinal() {
        const finalMessage = this.receivedMessages.at(-1);
        if (finalMessage) {
            this._emit('finalMessage', __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this));
        }
    }
    async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted)
                this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
            this._connected(null);
            const stream = Stream.fromReadableStream(readableStream, this.controller);
            for await (const event of stream) {
                __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new APIUserAbortError();
            }
            __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
        }
        finally {
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    [(_BetaMessageStream_currentMessageSnapshot = new WeakMap(), _BetaMessageStream_params = new WeakMap(), _BetaMessageStream_connectedPromise = new WeakMap(), _BetaMessageStream_resolveConnectedPromise = new WeakMap(), _BetaMessageStream_rejectConnectedPromise = new WeakMap(), _BetaMessageStream_endPromise = new WeakMap(), _BetaMessageStream_resolveEndPromise = new WeakMap(), _BetaMessageStream_rejectEndPromise = new WeakMap(), _BetaMessageStream_listeners = new WeakMap(), _BetaMessageStream_ended = new WeakMap(), _BetaMessageStream_errored = new WeakMap(), _BetaMessageStream_aborted = new WeakMap(), _BetaMessageStream_catchingPromiseCreated = new WeakMap(), _BetaMessageStream_response = new WeakMap(), _BetaMessageStream_request_id = new WeakMap(), _BetaMessageStream_logger = new WeakMap(), _BetaMessageStream_handleError = new WeakMap(), _BetaMessageStream_instances = new WeakSet(), _BetaMessageStream_getFinalMessage = function _BetaMessageStream_getFinalMessage() {
        if (this.receivedMessages.length === 0) {
            throw new error_AnthropicError('stream ended without producing a Message with role=assistant');
        }
        return this.receivedMessages.at(-1);
    }, _BetaMessageStream_getFinalText = function _BetaMessageStream_getFinalText() {
        if (this.receivedMessages.length === 0) {
            throw new error_AnthropicError('stream ended without producing a Message with role=assistant');
        }
        const textBlocks = this.receivedMessages
            .at(-1)
            .content.filter((block) => block.type === 'text')
            .map((block) => block.text);
        if (textBlocks.length === 0) {
            throw new error_AnthropicError('stream ended without producing a content block with type=text');
        }
        return textBlocks.join(' ');
    }, _BetaMessageStream_beginRequest = function _BetaMessageStream_beginRequest() {
        if (this.ended)
            return;
        __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, undefined, "f");
    }, _BetaMessageStream_addStreamEvent = function _BetaMessageStream_addStreamEvent(event) {
        if (this.ended)
            return;
        const messageSnapshot = __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_accumulateMessage).call(this, event);
        this._emit('streamEvent', event, messageSnapshot);
        switch (event.type) {
            case 'content_block_delta': {
                const content = messageSnapshot.content.at(-1);
                switch (event.delta.type) {
                    case 'text_delta': {
                        if (content.type === 'text') {
                            this._emit('text', event.delta.text, content.text || '');
                        }
                        break;
                    }
                    case 'citations_delta': {
                        if (content.type === 'text') {
                            this._emit('citation', event.delta.citation, content.citations ?? []);
                        }
                        break;
                    }
                    case 'input_json_delta': {
                        if (tracksToolInput(content) && content.input) {
                            this._emit('inputJson', event.delta.partial_json, content.input);
                        }
                        break;
                    }
                    case 'thinking_delta': {
                        if (content.type === 'thinking') {
                            this._emit('thinking', event.delta.thinking, content.thinking);
                        }
                        break;
                    }
                    case 'signature_delta': {
                        if (content.type === 'thinking') {
                            this._emit('signature', content.signature);
                        }
                        break;
                    }
                    case 'compaction_delta': {
                        if (content.type === 'compaction' && content.content) {
                            this._emit('compaction', content.content);
                        }
                        break;
                    }
                    default:
                        checkNever(event.delta);
                }
                break;
            }
            case 'message_stop': {
                this._addMessageParam(messageSnapshot);
                this._addMessage(maybeParseBetaMessage(messageSnapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") }), true);
                break;
            }
            case 'content_block_stop': {
                this._emit('contentBlock', messageSnapshot.content.at(-1));
                break;
            }
            case 'message_start': {
                __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, messageSnapshot, "f");
                break;
            }
            case 'content_block_start':
            case 'message_delta':
                break;
        }
    }, _BetaMessageStream_endRequest = function _BetaMessageStream_endRequest() {
        if (this.ended) {
            throw new error_AnthropicError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
        if (!snapshot) {
            throw new error_AnthropicError(`request ended without sending any chunks`);
        }
        __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, undefined, "f");
        return maybeParseBetaMessage(snapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") });
    }, _BetaMessageStream_accumulateMessage = function _BetaMessageStream_accumulateMessage(event) {
        let snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
        if (event.type === 'message_start') {
            if (snapshot) {
                throw new error_AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
            }
            return event.message;
        }
        if (!snapshot) {
            throw new error_AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
        }
        switch (event.type) {
            case 'message_stop':
                return snapshot;
            case 'message_delta':
                snapshot.container = event.delta.container;
                snapshot.stop_reason = event.delta.stop_reason;
                snapshot.stop_sequence = event.delta.stop_sequence;
                snapshot.usage.output_tokens = event.usage.output_tokens;
                snapshot.context_management = event.context_management;
                if (event.usage.input_tokens != null) {
                    snapshot.usage.input_tokens = event.usage.input_tokens;
                }
                if (event.usage.cache_creation_input_tokens != null) {
                    snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
                }
                if (event.usage.cache_read_input_tokens != null) {
                    snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
                }
                if (event.usage.server_tool_use != null) {
                    snapshot.usage.server_tool_use = event.usage.server_tool_use;
                }
                if (event.usage.iterations != null) {
                    snapshot.usage.iterations = event.usage.iterations;
                }
                return snapshot;
            case 'content_block_start':
                snapshot.content.push(event.content_block);
                return snapshot;
            case 'content_block_delta': {
                const snapshotContent = snapshot.content.at(event.index);
                switch (event.delta.type) {
                    case 'text_delta': {
                        if (snapshotContent?.type === 'text') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                text: (snapshotContent.text || '') + event.delta.text,
                            };
                        }
                        break;
                    }
                    case 'citations_delta': {
                        if (snapshotContent?.type === 'text') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                citations: [...(snapshotContent.citations ?? []), event.delta.citation],
                            };
                        }
                        break;
                    }
                    case 'input_json_delta': {
                        if (snapshotContent && tracksToolInput(snapshotContent)) {
                            // we need to keep track of the raw JSON string as well so that we can
                            // re-parse it for each delta, for now we just store it as an untyped
                            // non-enumerable property on the snapshot
                            let jsonBuf = snapshotContent[JSON_BUF_PROPERTY] || '';
                            jsonBuf += event.delta.partial_json;
                            const newContent = { ...snapshotContent };
                            Object.defineProperty(newContent, JSON_BUF_PROPERTY, {
                                value: jsonBuf,
                                enumerable: false,
                                writable: true,
                            });
                            if (jsonBuf) {
                                try {
                                    newContent.input = partialParse(jsonBuf);
                                }
                                catch (err) {
                                    const error = new error_AnthropicError(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${err}. JSON: ${jsonBuf}`);
                                    __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f").call(this, error);
                                }
                            }
                            snapshot.content[event.index] = newContent;
                        }
                        break;
                    }
                    case 'thinking_delta': {
                        if (snapshotContent?.type === 'thinking') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                thinking: snapshotContent.thinking + event.delta.thinking,
                            };
                        }
                        break;
                    }
                    case 'signature_delta': {
                        if (snapshotContent?.type === 'thinking') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                signature: event.delta.signature,
                            };
                        }
                        break;
                    }
                    case 'compaction_delta': {
                        if (snapshotContent?.type === 'compaction') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                content: (snapshotContent.content || '') + event.delta.content,
                            };
                        }
                        break;
                    }
                    default:
                        checkNever(event.delta);
                }
                return snapshot;
            }
            case 'content_block_stop':
                return snapshot;
        }
    }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on('streamEvent', (event) => {
            const reader = readQueue.shift();
            if (reader) {
                reader.resolve(event);
            }
            else {
                pushQueue.push(event);
            }
        });
        this.on('end', () => {
            done = true;
            for (const reader of readQueue) {
                reader.resolve(undefined);
            }
            readQueue.length = 0;
        });
        this.on('abort', (err) => {
            done = true;
            for (const reader of readQueue) {
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        this.on('error', (err) => {
            done = true;
            for (const reader of readQueue) {
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        return {
            next: async () => {
                if (!pushQueue.length) {
                    if (done) {
                        return { value: undefined, done: true };
                    }
                    return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk) => (chunk ? { value: chunk, done: false } : { value: undefined, done: true }));
                }
                const chunk = pushQueue.shift();
                return { value: chunk, done: false };
            },
            return: async () => {
                this.abort();
                return { value: undefined, done: true };
            },
        };
    }
    toReadableStream() {
        const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
    }
}
// used to ensure exhaustive case matching without throwing a runtime error
function checkNever(x) { }
//# sourceMappingURL=BetaMessageStream.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs
/**
 * An error that can be thrown from a tool's `run` method to return structured
 * content blocks as the error result, rather than just a string message.
 *
 * When the ToolRunner catches this error, it will use the `content` property
 * as the tool result with `is_error: true`.
 *
 * @example
 * ```ts
 * const tool = {
 *   name: 'my_tool',
 *   run: async (input) => {
 *     if (somethingWentWrong) {
 *       throw new ToolError([
 *         { type: 'text', text: 'Error details here' },
 *         { type: 'image', source: { type: 'base64', data: '...', media_type: 'image/png' } },
 *       ]);
 *     }
 *     return 'success';
 *   },
 * };
 * ```
 */
class ToolError extends Error {
    constructor(content) {
        const message = typeof content === 'string' ? content : (content
            .map((block) => {
            if (block.type === 'text')
                return block.text;
            return `[${block.type}]`;
        })
            .join(' '));
        super(message);
        this.name = 'ToolError';
        this.content = content;
    }
}
//# sourceMappingURL=ToolError.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/tools/CompactionControl.mjs
const DEFAULT_TOKEN_THRESHOLD = 100000;
const DEFAULT_SUMMARY_PROMPT = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete—err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`;
//# sourceMappingURL=CompactionControl.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/tools/BetaToolRunner.mjs
var _BetaToolRunner_instances, _BetaToolRunner_consumed, _BetaToolRunner_mutated, _BetaToolRunner_state, _BetaToolRunner_options, _BetaToolRunner_message, _BetaToolRunner_toolResponse, _BetaToolRunner_completion, _BetaToolRunner_iterationCount, _BetaToolRunner_checkAndCompact, _BetaToolRunner_generateToolResponse;






/**
 * Just Promise.withResolvers(), which is not available in all environments.
 */
function promiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve, reject: reject };
}
/**
 * A ToolRunner handles the automatic conversation loop between the assistant and tools.
 *
 * A ToolRunner is an async iterable that yields either BetaMessage or BetaMessageStream objects
 * depending on the streaming configuration.
 */
class BetaToolRunner {
    constructor(client, params, options) {
        _BetaToolRunner_instances.add(this);
        this.client = client;
        /** Whether the async iterator has been consumed */
        _BetaToolRunner_consumed.set(this, false);
        /** Whether parameters have been mutated since the last API call */
        _BetaToolRunner_mutated.set(this, false);
        /** Current state containing the request parameters */
        _BetaToolRunner_state.set(this, void 0);
        _BetaToolRunner_options.set(this, void 0);
        /** Promise for the last message received from the assistant */
        _BetaToolRunner_message.set(this, void 0);
        /** Cached tool response to avoid redundant executions */
        _BetaToolRunner_toolResponse.set(this, void 0);
        /** Promise resolvers for waiting on completion */
        _BetaToolRunner_completion.set(this, void 0);
        /** Number of iterations (API requests) made so far */
        _BetaToolRunner_iterationCount.set(this, 0);
        __classPrivateFieldSet(this, _BetaToolRunner_state, {
            params: {
                // You can't clone the entire params since there are functions as handlers.
                // You also don't really need to clone params.messages, but it probably will prevent a foot gun
                // somewhere.
                ...params,
                messages: structuredClone(params.messages),
            },
        }, "f");
        const helpers = collectStainlessHelpers(params.tools, params.messages);
        const helperValue = ['BetaToolRunner', ...helpers].join(', ');
        __classPrivateFieldSet(this, _BetaToolRunner_options, {
            ...options,
            headers: buildHeaders([{ 'x-stainless-helper': helperValue }, options?.headers]),
        }, "f");
        __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
        if (params.compactionControl?.enabled) {
            console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. ' +
                'Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. ' +
                'See https://platform.claude.com/docs/en/build-with-claude/compaction');
        }
    }
    async *[(_BetaToolRunner_consumed = new WeakMap(), _BetaToolRunner_mutated = new WeakMap(), _BetaToolRunner_state = new WeakMap(), _BetaToolRunner_options = new WeakMap(), _BetaToolRunner_message = new WeakMap(), _BetaToolRunner_toolResponse = new WeakMap(), _BetaToolRunner_completion = new WeakMap(), _BetaToolRunner_iterationCount = new WeakMap(), _BetaToolRunner_instances = new WeakSet(), _BetaToolRunner_checkAndCompact = async function _BetaToolRunner_checkAndCompact() {
        const compactionControl = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.compactionControl;
        if (!compactionControl || !compactionControl.enabled) {
            return false;
        }
        let tokensUsed = 0;
        if (__classPrivateFieldGet(this, _BetaToolRunner_message, "f") !== undefined) {
            try {
                const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
                const totalInputTokens = message.usage.input_tokens +
                    (message.usage.cache_creation_input_tokens ?? 0) +
                    (message.usage.cache_read_input_tokens ?? 0);
                tokensUsed = totalInputTokens + message.usage.output_tokens;
            }
            catch {
                // If we can't get the message, skip compaction
                return false;
            }
        }
        const threshold = compactionControl.contextTokenThreshold ?? DEFAULT_TOKEN_THRESHOLD;
        if (tokensUsed < threshold) {
            return false;
        }
        const model = compactionControl.model ?? __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.model;
        const summaryPrompt = compactionControl.summaryPrompt ?? DEFAULT_SUMMARY_PROMPT;
        const messages = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages;
        if (messages[messages.length - 1].role === 'assistant') {
            // Remove tool_use blocks from the last message to avoid 400 error
            // (tool_use requires tool_result, which we don't have yet)
            const lastMessage = messages[messages.length - 1];
            if (Array.isArray(lastMessage.content)) {
                const nonToolBlocks = lastMessage.content.filter((block) => block.type !== 'tool_use');
                if (nonToolBlocks.length === 0) {
                    // If all blocks were tool_use, just remove the message entirely
                    messages.pop();
                }
                else {
                    lastMessage.content = nonToolBlocks;
                }
            }
        }
        const response = await this.client.beta.messages.create({
            model,
            messages: [
                ...messages,
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: summaryPrompt,
                        },
                    ],
                },
            ],
            max_tokens: __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_tokens,
        }, {
            signal: __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal,
            headers: buildHeaders([__classPrivateFieldGet(this, _BetaToolRunner_options, "f").headers, { 'x-stainless-helper': 'compaction' }]),
        });
        if (response.content[0]?.type !== 'text') {
            throw new error_AnthropicError('Expected text response for compaction');
        }
        __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages = [
            {
                role: 'user',
                content: response.content,
            },
        ];
        return true;
    }, Symbol.asyncIterator)]() {
        var _a;
        if (__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
            throw new error_AnthropicError('Cannot iterate over a consumed stream');
        }
        __classPrivateFieldSet(this, _BetaToolRunner_consumed, true, "f");
        __classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
        __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, undefined, "f");
        try {
            while (true) {
                let stream;
                try {
                    if (__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations &&
                        __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f") >= __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations) {
                        break;
                    }
                    __classPrivateFieldSet(this, _BetaToolRunner_mutated, false, "f");
                    __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, undefined, "f");
                    __classPrivateFieldSet(this, _BetaToolRunner_iterationCount, (_a = __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f"), _a++, _a), "f");
                    __classPrivateFieldSet(this, _BetaToolRunner_message, undefined, "f");
                    const { max_iterations, compactionControl, ...params } = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
                    if (params.stream) {
                        stream = this.client.beta.messages.stream({ ...params }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f"));
                        __classPrivateFieldSet(this, _BetaToolRunner_message, stream.finalMessage(), "f");
                        // Make sure that this promise doesn't throw before we get the option to do something about it.
                        // Error will be caught when we call await this.#message ultimately
                        __classPrivateFieldGet(this, _BetaToolRunner_message, "f").catch(() => { });
                        yield stream;
                    }
                    else {
                        __classPrivateFieldSet(this, _BetaToolRunner_message, this.client.beta.messages.create({ ...params, stream: false }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f")), "f");
                        yield __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
                    }
                    const isCompacted = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_checkAndCompact).call(this);
                    if (!isCompacted) {
                        if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
                            const { role, content } = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
                            __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push({ role, content });
                        }
                        const toolMessage = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.at(-1));
                        if (toolMessage) {
                            __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push(toolMessage);
                        }
                        else if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
                            break;
                        }
                    }
                }
                finally {
                    if (stream) {
                        stream.abort();
                    }
                }
            }
            if (!__classPrivateFieldGet(this, _BetaToolRunner_message, "f")) {
                throw new error_AnthropicError('ToolRunner concluded without a message from the server');
            }
            __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").resolve(await __classPrivateFieldGet(this, _BetaToolRunner_message, "f"));
        }
        catch (error) {
            __classPrivateFieldSet(this, _BetaToolRunner_consumed, false, "f");
            // Silence unhandled promise errors
            __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise.catch(() => { });
            __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").reject(error);
            __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
            throw error;
        }
    }
    setMessagesParams(paramsOrMutator) {
        if (typeof paramsOrMutator === 'function') {
            __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params);
        }
        else {
            __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator;
        }
        __classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
        // Invalidate cached tool response since parameters changed
        __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, undefined, "f");
    }
    setRequestOptions(optionsOrMutator) {
        if (typeof optionsOrMutator === 'function') {
            __classPrivateFieldSet(this, _BetaToolRunner_options, optionsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_options, "f")), "f");
        }
        else {
            __classPrivateFieldSet(this, _BetaToolRunner_options, { ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"), ...optionsOrMutator }, "f");
        }
    }
    /**
     * Get the tool response for the last message from the assistant.
     * Avoids redundant tool executions by caching results.
     *
     * @returns A promise that resolves to a BetaMessageParam containing tool results, or null if no tools need to be executed
     *
     * @example
     * const toolResponse = await runner.generateToolResponse();
     * if (toolResponse) {
     *   console.log('Tool results:', toolResponse.content);
     * }
     */
    async generateToolResponse(signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
        const message = (await __classPrivateFieldGet(this, _BetaToolRunner_message, "f")) ?? this.params.messages.at(-1);
        if (!message) {
            return null;
        }
        return __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, message, signal);
    }
    /**
     * Wait for the async iterator to complete. This works even if the async iterator hasn't yet started, and
     * will wait for an instance to start and go to completion.
     *
     * @returns A promise that resolves to the final BetaMessage when the iterator completes
     *
     * @example
     * // Start consuming the iterator
     * for await (const message of runner) {
     *   console.log('Message:', message.content);
     * }
     *
     * // Meanwhile, wait for completion from another part of the code
     * const finalMessage = await runner.done();
     * console.log('Final response:', finalMessage.content);
     */
    done() {
        return __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise;
    }
    /**
     * Returns a promise indicating that the stream is done. Unlike .done(), this will eagerly read the stream:
     * * If the iterator has not been consumed, consume the entire iterator and return the final message from the
     * assistant.
     * * If the iterator has been consumed, waits for it to complete and returns the final message.
     *
     * @returns A promise that resolves to the final BetaMessage from the conversation
     * @throws {AnthropicError} If no messages were processed during the conversation
     *
     * @example
     * const finalMessage = await runner.runUntilDone();
     * console.log('Final response:', finalMessage.content);
     */
    async runUntilDone() {
        // If not yet consumed, start consuming and wait for completion
        if (!__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
            for await (const _ of this) {
                // Iterator naturally populates this.#message
            }
        }
        // If consumed but not completed, wait for completion
        return this.done();
    }
    /**
     * Get the current parameters being used by the ToolRunner.
     *
     * @returns A readonly view of the current ToolRunnerParams
     *
     * @example
     * const currentParams = runner.params;
     * console.log('Current model:', currentParams.model);
     * console.log('Message count:', currentParams.messages.length);
     */
    get params() {
        return __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
    }
    /**
     * Add one or more messages to the conversation history.
     *
     * @param messages - One or more BetaMessageParam objects to add to the conversation
     *
     * @example
     * runner.pushMessages(
     *   { role: 'user', content: 'Also, what about the weather in NYC?' }
     * );
     *
     * @example
     * // Adding multiple messages
     * runner.pushMessages(
     *   { role: 'user', content: 'What about NYC?' },
     *   { role: 'user', content: 'And Boston?' }
     * );
     */
    pushMessages(...messages) {
        this.setMessagesParams((params) => ({
            ...params,
            messages: [...params.messages, ...messages],
        }));
    }
    /**
     * Makes the ToolRunner directly awaitable, equivalent to calling .runUntilDone()
     * This allows using `await runner` instead of `await runner.runUntilDone()`
     */
    then(onfulfilled, onrejected) {
        return this.runUntilDone().then(onfulfilled, onrejected);
    }
}
_BetaToolRunner_generateToolResponse = async function _BetaToolRunner_generateToolResponse(lastMessage, signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
    if (__classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f") !== undefined) {
        return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
    }
    __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, generateToolResponse(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params, lastMessage, {
        ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"),
        signal,
    }), "f");
    return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
};
async function generateToolResponse(params, lastMessage = params.messages.at(-1), requestOptions) {
    // Only process if the last message is from the assistant and has tool use blocks
    if (!lastMessage ||
        lastMessage.role !== 'assistant' ||
        !lastMessage.content ||
        typeof lastMessage.content === 'string') {
        return null;
    }
    const toolUseBlocks = lastMessage.content.filter((content) => content.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
        return null;
    }
    const toolResults = await Promise.all(toolUseBlocks.map(async (toolUse) => {
        const tool = params.tools.find((t) => ('name' in t ? t.name : t.mcp_server_name) === toolUse.name);
        if (!tool || !('run' in tool)) {
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `Error: Tool '${toolUse.name}' not found`,
                is_error: true,
            };
        }
        try {
            let input = toolUse.input;
            if ('parse' in tool && tool.parse) {
                input = tool.parse(input);
            }
            const result = await tool.run(input, {
                toolUseBlock: toolUse,
                signal: requestOptions?.signal,
            });
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: result,
            };
        }
        catch (error) {
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: error instanceof ToolError ?
                    error.content
                    : `Error: ${error instanceof Error ? error.message : String(error)}`,
                is_error: true,
            };
        }
    }));
    return {
        role: 'user',
        content: toolResults,
    };
}
//# sourceMappingURL=BetaToolRunner.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.











const DEPRECATED_MODELS = {
    'claude-1.3': 'November 6th, 2024',
    'claude-1.3-100k': 'November 6th, 2024',
    'claude-instant-1.1': 'November 6th, 2024',
    'claude-instant-1.1-100k': 'November 6th, 2024',
    'claude-instant-1.2': 'November 6th, 2024',
    'claude-3-sonnet-20240229': 'July 21st, 2025',
    'claude-3-opus-20240229': 'January 5th, 2026',
    'claude-2.1': 'July 21st, 2025',
    'claude-2.0': 'July 21st, 2025',
    'claude-3-7-sonnet-latest': 'February 19th, 2026',
    'claude-3-7-sonnet-20250219': 'February 19th, 2026',
};
const MODELS_TO_WARN_WITH_THINKING_ENABLED = ['claude-mythos-preview', 'claude-opus-4-6'];
class Messages extends APIResource {
    constructor() {
        super(...arguments);
        this.batches = new Batches(this._client);
    }
    create(params, options) {
        // Transform deprecated output_format to output_config.format
        const modifiedParams = transformOutputFormat(params);
        const { betas, ...body } = modifiedParams;
        if (body.model in DEPRECATED_MODELS) {
            console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        }
        if (MODELS_TO_WARN_WITH_THINKING_ENABLED.includes(body.model) &&
            body.thinking &&
            body.thinking.type === 'enabled') {
            console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
        }
        let timeout = this._client._options.timeout;
        if (!body.stream && timeout == null) {
            const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? undefined;
            timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
        }
        // Collect helper info from tools and messages
        const helperHeader = stainlessHelperHeader(body.tools, body.messages);
        return this._client.post('/v1/messages?beta=true', {
            body,
            timeout: timeout ?? 600000,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                helperHeader,
                options?.headers,
            ]),
            stream: modifiedParams.stream ?? false,
        });
    }
    /**
     * Send a structured list of input messages with text and/or image content, along with an expected `output_format` and
     * the response will be automatically parsed and available in the `parsed_output` property of the message.
     *
     * @example
     * ```ts
     * const message = await client.beta.messages.parse({
     *   model: 'claude-3-5-sonnet-20241022',
     *   max_tokens: 1024,
     *   messages: [{ role: 'user', content: 'What is 2+2?' }],
     *   output_format: zodOutputFormat(z.object({ answer: z.number() }), 'math'),
     * });
     *
     * console.log(message.parsed_output?.answer); // 4
     * ```
     */
    parse(params, options) {
        options = {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(params.betas ?? []), 'structured-outputs-2025-12-15'].toString() },
                options?.headers,
            ]),
        };
        return this.create(params, options).then((message) => parseBetaMessage(message, params, { logger: this._client.logger ?? console }));
    }
    /**
     * Create a Message stream
     */
    stream(body, options) {
        return BetaMessageStream.createMessage(this, body, options);
    }
    /**
     * Count the number of tokens in a Message.
     *
     * The Token Count API can be used to count the number of tokens in a Message,
     * including tools, images, and documents, without creating it.
     *
     * Learn more about token counting in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
     *
     * @example
     * ```ts
     * const betaMessageTokensCount =
     *   await client.beta.messages.countTokens({
     *     messages: [{ content: 'Hello, world', role: 'user' }],
     *     model: 'claude-opus-4-6',
     *   });
     * ```
     */
    countTokens(params, options) {
        // Transform deprecated output_format to output_config.format
        const modifiedParams = transformOutputFormat(params);
        const { betas, ...body } = modifiedParams;
        return this._client.post('/v1/messages/count_tokens?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'token-counting-2024-11-01'].toString() },
                options?.headers,
            ]),
        });
    }
    toolRunner(body, options) {
        return new BetaToolRunner(this._client, body, options);
    }
}
/**
 * Transform deprecated output_format to output_config.format
 * Returns a modified copy of the params without mutating the original
 */
function transformOutputFormat(params) {
    if (!params.output_format) {
        return params;
    }
    if (params.output_config?.format) {
        throw new error_AnthropicError('Both output_format and output_config.format were provided. ' +
            'Please use only output_config.format (output_format is deprecated).');
    }
    const { output_format, ...rest } = params;
    return {
        ...rest,
        output_config: {
            ...params.output_config,
            format: output_format,
        },
    };
}


Messages.Batches = Batches;
Messages.BetaToolRunner = BetaToolRunner;
Messages.ToolError = ToolError;
//# sourceMappingURL=messages.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/sessions/events.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Events extends APIResource {
    /**
     * List Events
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionEvent of client.beta.sessions.events.list(
     *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(sessionID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/sessions/${sessionID}/events?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Send Events
     *
     * @example
     * ```ts
     * const betaManagedAgentsSendSessionEvents =
     *   await client.beta.sessions.events.send(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *     {
     *       events: [
     *         {
     *           content: [
     *             {
     *               text: 'Where is my order #1234?',
     *               type: 'text',
     *             },
     *           ],
     *           type: 'user.message',
     *         },
     *       ],
     *     },
     *   );
     * ```
     */
    send(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/sessions/${sessionID}/events?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Stream Events
     *
     * @example
     * ```ts
     * const betaManagedAgentsStreamSessionEvents =
     *   await client.beta.sessions.events.stream(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */
    stream(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/sessions/${sessionID}/events/stream?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
            stream: true,
        });
    }
}
//# sourceMappingURL=events.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/sessions/resources.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Resources extends APIResource {
    /**
     * Get Session Resource
     *
     * @example
     * ```ts
     * const resource =
     *   await client.beta.sessions.resources.retrieve(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    retrieve(resourceID, params, options) {
        const { session_id, betas } = params;
        return this._client.get(path `/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Session Resource
     *
     * @example
     * ```ts
     * const resource =
     *   await client.beta.sessions.resources.update(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     {
     *       session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *       authorization_token: 'ghp_exampletoken',
     *     },
     *   );
     * ```
     */
    update(resourceID, params, options) {
        const { session_id, betas, ...body } = params;
        return this._client.post(path `/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Session Resources
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionResource of client.beta.sessions.resources.list(
     *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(sessionID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/sessions/${sessionID}/resources?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Session Resource
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeleteSessionResource =
     *   await client.beta.sessions.resources.delete(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    delete(resourceID, params, options) {
        const { session_id, betas } = params;
        return this._client.delete(path `/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Add Session Resource
     *
     * @example
     * ```ts
     * const betaManagedAgentsFileResource =
     *   await client.beta.sessions.resources.add(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *     {
     *       file_id: 'file_011CNha8iCJcU1wXNR6q4V8w',
     *       type: 'file',
     *     },
     *   );
     * ```
     */
    add(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/sessions/${sessionID}/resources?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=resources.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/sessions/threads/events.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class events_Events extends APIResource {
    /**
     * List Session Thread Events
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionEvent of client.beta.sessions.threads.events.list(
     *   'sthr_011CZkZVWa6oIjw0rgXZpnBt',
     *   { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(threadID, params, options) {
        const { session_id, betas, ...query } = params;
        return this._client.getAPIList(path `/v1/sessions/${session_id}/threads/${threadID}/events?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Stream Session Thread Events
     *
     * @example
     * ```ts
     * const betaManagedAgentsStreamSessionThreadEvents =
     *   await client.beta.sessions.threads.events.stream(
     *     'sthr_011CZkZVWa6oIjw0rgXZpnBt',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    stream(threadID, params, options) {
        const { session_id, betas } = params;
        return this._client.get(path `/v1/sessions/${session_id}/threads/${threadID}/stream?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
            stream: true,
        });
    }
}
//# sourceMappingURL=events.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/sessions/threads/threads.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.






class Threads extends APIResource {
    constructor() {
        super(...arguments);
        this.events = new events_Events(this._client);
    }
    /**
     * Get Session Thread
     *
     * @example
     * ```ts
     * const betaManagedAgentsSessionThread =
     *   await client.beta.sessions.threads.retrieve(
     *     'sthr_011CZkZVWa6oIjw0rgXZpnBt',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    retrieve(threadID, params, options) {
        const { session_id, betas } = params;
        return this._client.get(path `/v1/sessions/${session_id}/threads/${threadID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Session Threads
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionThread of client.beta.sessions.threads.list(
     *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(sessionID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/sessions/${sessionID}/threads?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive Session Thread
     *
     * @example
     * ```ts
     * const betaManagedAgentsSessionThread =
     *   await client.beta.sessions.threads.archive(
     *     'sthr_011CZkZVWa6oIjw0rgXZpnBt',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    archive(threadID, params, options) {
        const { session_id, betas } = params;
        return this._client.post(path `/v1/sessions/${session_id}/threads/${threadID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
Threads.Events = events_Events;
//# sourceMappingURL=threads.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/sessions/sessions.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.










class Sessions extends APIResource {
    constructor() {
        super(...arguments);
        this.events = new Events(this._client);
        this.resources = new Resources(this._client);
        this.threads = new Threads(this._client);
    }
    /**
     * Create Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.create({
     *     agent: 'agent_011CZkYpogX7uDKUyvBTophP',
     *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   });
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/sessions?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Get Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.retrieve(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */
    retrieve(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/sessions/${sessionID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.update(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */
    update(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/sessions/${sessionID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Sessions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSession of client.beta.sessions.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/sessions?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedSession =
     *   await client.beta.sessions.delete(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */
    delete(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/v1/sessions/${sessionID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.archive(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */
    archive(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/sessions/${sessionID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
Sessions.Events = Events;
Sessions.Resources = Resources;
Sessions.Threads = Threads;
//# sourceMappingURL=sessions.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/skills/versions.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.





class versions_Versions extends APIResource {
    /**
     * Create Skill Version
     *
     * @example
     * ```ts
     * const version = await client.beta.skills.versions.create(
     *   'skill_id',
     * );
     * ```
     */
    create(skillID, params = {}, options) {
        const { betas, ...body } = params ?? {};
        return this._client.post(path `/v1/skills/${skillID}/versions?beta=true`, multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        }, this._client));
    }
    /**
     * Get Skill Version
     *
     * @example
     * ```ts
     * const version = await client.beta.skills.versions.retrieve(
     *   'version',
     *   { skill_id: 'skill_id' },
     * );
     * ```
     */
    retrieve(version, params, options) {
        const { skill_id, betas } = params;
        return this._client.get(path `/v1/skills/${skill_id}/versions/${version}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Skill Versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const versionListResponse of client.beta.skills.versions.list(
     *   'skill_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(skillID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/skills/${skillID}/versions?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Skill Version
     *
     * @example
     * ```ts
     * const version = await client.beta.skills.versions.delete(
     *   'version',
     *   { skill_id: 'skill_id' },
     * );
     * ```
     */
    delete(version, params, options) {
        const { skill_id, betas } = params;
        return this._client.delete(path `/v1/skills/${skill_id}/versions/${version}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=versions.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/skills/skills.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.







class Skills extends APIResource {
    constructor() {
        super(...arguments);
        this.versions = new versions_Versions(this._client);
    }
    /**
     * Create Skill
     *
     * @example
     * ```ts
     * const skill = await client.beta.skills.create();
     * ```
     */
    create(params = {}, options) {
        const { betas, ...body } = params ?? {};
        return this._client.post('/v1/skills?beta=true', multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        }, this._client, false));
    }
    /**
     * Get Skill
     *
     * @example
     * ```ts
     * const skill = await client.beta.skills.retrieve('skill_id');
     * ```
     */
    retrieve(skillID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/skills/${skillID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Skills
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const skillListResponse of client.beta.skills.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/skills?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Skill
     *
     * @example
     * ```ts
     * const skill = await client.beta.skills.delete('skill_id');
     * ```
     */
    delete(skillID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/v1/skills/${skillID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'skills-2025-10-02'].toString() },
                options?.headers,
            ]),
        });
    }
}
Skills.Versions = versions_Versions;
//# sourceMappingURL=skills.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/vaults/credentials.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Credentials extends APIResource {
    /**
     * Create Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.create(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *     {
     *       auth: {
     *         token: 'bearer_exampletoken',
     *         mcp_server_url:
     *           'https://example-server.modelcontextprotocol.io/sse',
     *         type: 'static_bearer',
     *       },
     *     },
     *   );
     * ```
     */
    create(vaultID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/vaults/${vaultID}/credentials?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Get Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.retrieve(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    retrieve(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.get(path `/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.update(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    update(credentialID, params, options) {
        const { vault_id, betas, ...body } = params;
        return this._client.post(path `/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Credentials
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsCredential of client.beta.vaults.credentials.list(
     *   'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(vaultID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/vaults/${vaultID}/credentials?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedCredential =
     *   await client.beta.vaults.credentials.delete(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    delete(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.delete(path `/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.archive(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    archive(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.post(path `/v1/vaults/${vault_id}/credentials/${credentialID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Validate Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredentialValidation =
     *   await client.beta.vaults.credentials.mcpOAuthValidate(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    mcpOAuthValidate(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.post(path `/v1/vaults/${vault_id}/credentials/${credentialID}/mcp_oauth_validate?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=credentials.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/vaults/vaults.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.






class Vaults extends APIResource {
    constructor() {
        super(...arguments);
        this.credentials = new Credentials(this._client);
    }
    /**
     * Create Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.create({
     *     display_name: 'Example vault',
     *   });
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/vaults?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Get Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.retrieve(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */
    retrieve(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/vaults/${vaultID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.update(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */
    update(vaultID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/vaults/${vaultID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List Vaults
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsVault of client.beta.vaults.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/vaults?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedVault =
     *   await client.beta.vaults.delete(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */
    delete(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/v1/vaults/${vaultID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.archive(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */
    archive(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/vaults/${vaultID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                options?.headers,
            ]),
        });
    }
}
Vaults.Credentials = Credentials;
//# sourceMappingURL=vaults.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.























class Beta extends APIResource {
    constructor() {
        super(...arguments);
        this.models = new Models(this._client);
        this.messages = new Messages(this._client);
        this.agents = new Agents(this._client);
        this.environments = new Environments(this._client);
        this.sessions = new Sessions(this._client);
        this.vaults = new Vaults(this._client);
        this.memoryStores = new MemoryStores(this._client);
        this.files = new Files(this._client);
        this.skills = new Skills(this._client);
        this.webhooks = new Webhooks(this._client);
        this.userProfiles = new UserProfiles(this._client);
    }
}
Beta.Models = Models;
Beta.Messages = Messages;
Beta.Agents = Agents;
Beta.Environments = Environments;
Beta.Sessions = Sessions;
Beta.Vaults = Vaults;
Beta.MemoryStores = MemoryStores;
Beta.Files = Files;
Beta.Skills = Skills;
Beta.Webhooks = Webhooks;
Beta.UserProfiles = UserProfiles;
//# sourceMappingURL=beta.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/completions.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


class Completions extends APIResource {
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/complete', {
            body,
            timeout: this._client._options.timeout ?? 600000,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
            stream: params.stream ?? false,
        });
    }
}
//# sourceMappingURL=completions.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/parser.mjs

function parser_getOutputFormat(params) {
    return params?.output_config?.format;
}
function maybeParseMessage(message, params, opts) {
    const outputFormat = parser_getOutputFormat(params);
    if (!params || !('parse' in (outputFormat ?? {}))) {
        return {
            ...message,
            content: message.content.map((block) => {
                if (block.type === 'text') {
                    const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                        value: null,
                        enumerable: false,
                    });
                    return parsedBlock;
                }
                return block;
            }),
            parsed_output: null,
        };
    }
    return parseMessage(message, params, opts);
}
function parseMessage(message, params, opts) {
    let firstParsedOutput = null;
    const content = message.content.map((block) => {
        if (block.type === 'text') {
            const parsedOutput = parseOutputFormat(params, block.text);
            if (firstParsedOutput === null) {
                firstParsedOutput = parsedOutput;
            }
            const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                value: parsedOutput,
                enumerable: false,
            });
            return parsedBlock;
        }
        return block;
    });
    return {
        ...message,
        content,
        parsed_output: firstParsedOutput,
    };
}
function parseOutputFormat(params, content) {
    const outputFormat = parser_getOutputFormat(params);
    if (outputFormat?.type !== 'json_schema') {
        return null;
    }
    try {
        if ('parse' in outputFormat) {
            return outputFormat.parse(content);
        }
        return JSON.parse(content);
    }
    catch (error) {
        throw new error_AnthropicError(`Failed to parse structured output: ${error}`);
    }
}
//# sourceMappingURL=parser.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs
var _MessageStream_instances, _MessageStream_currentMessageSnapshot, _MessageStream_params, _MessageStream_connectedPromise, _MessageStream_resolveConnectedPromise, _MessageStream_rejectConnectedPromise, _MessageStream_endPromise, _MessageStream_resolveEndPromise, _MessageStream_rejectEndPromise, _MessageStream_listeners, _MessageStream_ended, _MessageStream_errored, _MessageStream_aborted, _MessageStream_catchingPromiseCreated, _MessageStream_response, _MessageStream_request_id, _MessageStream_logger, _MessageStream_getFinalMessage, _MessageStream_getFinalText, _MessageStream_handleError, _MessageStream_beginRequest, _MessageStream_addStreamEvent, _MessageStream_endRequest, _MessageStream_accumulateMessage;






const MessageStream_JSON_BUF_PROPERTY = '__json_buf';
function MessageStream_tracksToolInput(content) {
    return content.type === 'tool_use' || content.type === 'server_tool_use';
}
class MessageStream {
    constructor(params, opts) {
        _MessageStream_instances.add(this);
        this.messages = [];
        this.receivedMessages = [];
        _MessageStream_currentMessageSnapshot.set(this, void 0);
        _MessageStream_params.set(this, null);
        this.controller = new AbortController();
        _MessageStream_connectedPromise.set(this, void 0);
        _MessageStream_resolveConnectedPromise.set(this, () => { });
        _MessageStream_rejectConnectedPromise.set(this, () => { });
        _MessageStream_endPromise.set(this, void 0);
        _MessageStream_resolveEndPromise.set(this, () => { });
        _MessageStream_rejectEndPromise.set(this, () => { });
        _MessageStream_listeners.set(this, {});
        _MessageStream_ended.set(this, false);
        _MessageStream_errored.set(this, false);
        _MessageStream_aborted.set(this, false);
        _MessageStream_catchingPromiseCreated.set(this, false);
        _MessageStream_response.set(this, void 0);
        _MessageStream_request_id.set(this, void 0);
        _MessageStream_logger.set(this, void 0);
        _MessageStream_handleError.set(this, (error) => {
            __classPrivateFieldSet(this, _MessageStream_errored, true, "f");
            if (isAbortError(error)) {
                error = new APIUserAbortError();
            }
            if (error instanceof APIUserAbortError) {
                __classPrivateFieldSet(this, _MessageStream_aborted, true, "f");
                return this._emit('abort', error);
            }
            if (error instanceof error_AnthropicError) {
                return this._emit('error', error);
            }
            if (error instanceof Error) {
                const anthropicError = new error_AnthropicError(error.message);
                // @ts-ignore
                anthropicError.cause = error;
                return this._emit('error', anthropicError);
            }
            return this._emit('error', new error_AnthropicError(String(error)));
        });
        __classPrivateFieldSet(this, _MessageStream_connectedPromise, new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _MessageStream_resolveConnectedPromise, resolve, "f");
            __classPrivateFieldSet(this, _MessageStream_rejectConnectedPromise, reject, "f");
        }), "f");
        __classPrivateFieldSet(this, _MessageStream_endPromise, new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _MessageStream_resolveEndPromise, resolve, "f");
            __classPrivateFieldSet(this, _MessageStream_rejectEndPromise, reject, "f");
        }), "f");
        // Don't let these promises cause unhandled rejection errors.
        // we will manually cause an unhandled rejection error later
        // if the user hasn't registered any error listener or called
        // any promise-returning method.
        __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f").catch(() => { });
        __classPrivateFieldGet(this, _MessageStream_endPromise, "f").catch(() => { });
        __classPrivateFieldSet(this, _MessageStream_params, params, "f");
        __classPrivateFieldSet(this, _MessageStream_logger, opts?.logger ?? console, "f");
    }
    get response() {
        return __classPrivateFieldGet(this, _MessageStream_response, "f");
    }
    get request_id() {
        return __classPrivateFieldGet(this, _MessageStream_request_id, "f");
    }
    /**
     * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
     * returned vie the `request-id` header which is useful for debugging requests and resporting
     * issues to Anthropic.
     *
     * This is the same as the `APIPromise.withResponse()` method.
     *
     * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
     * as no `Response` is available.
     */
    async withResponse() {
        __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
        const response = await __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f");
        if (!response) {
            throw new Error('Could not resolve a `Response` object');
        }
        return {
            data: this,
            response,
            request_id: response.headers.get('request-id'),
        };
    }
    /**
     * Intended for use on the frontend, consuming a stream produced with
     * `.toReadableStream()` on the backend.
     *
     * Note that messages sent to the model do not appear in `.on('message')`
     * in this context.
     */
    static fromReadableStream(stream) {
        const runner = new MessageStream(null);
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
    }
    static createMessage(messages, params, options, { logger } = {}) {
        const runner = new MessageStream(params, { logger });
        for (const message of params.messages) {
            runner._addMessageParam(message);
        }
        __classPrivateFieldSet(runner, _MessageStream_params, { ...params, stream: true }, "f");
        runner._run(() => runner._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, 'X-Stainless-Helper-Method': 'stream' } }));
        return runner;
    }
    _run(executor) {
        executor().then(() => {
            this._emitFinal();
            this._emit('end');
        }, __classPrivateFieldGet(this, _MessageStream_handleError, "f"));
    }
    _addMessageParam(message) {
        this.messages.push(message);
    }
    _addMessage(message, emit = true) {
        this.receivedMessages.push(message);
        if (emit) {
            this._emit('message', message);
        }
    }
    async _createMessage(messages, params, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted)
                this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
            const { response, data: stream } = await messages
                .create({ ...params, stream: true }, { ...options, signal: this.controller.signal })
                .withResponse();
            this._connected(response);
            for await (const event of stream) {
                __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new APIUserAbortError();
            }
            __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
        }
        finally {
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    _connected(response) {
        if (this.ended)
            return;
        __classPrivateFieldSet(this, _MessageStream_response, response, "f");
        __classPrivateFieldSet(this, _MessageStream_request_id, response?.headers.get('request-id'), "f");
        __classPrivateFieldGet(this, _MessageStream_resolveConnectedPromise, "f").call(this, response);
        this._emit('connect');
    }
    get ended() {
        return __classPrivateFieldGet(this, _MessageStream_ended, "f");
    }
    get errored() {
        return __classPrivateFieldGet(this, _MessageStream_errored, "f");
    }
    get aborted() {
        return __classPrivateFieldGet(this, _MessageStream_aborted, "f");
    }
    abort() {
        this.controller.abort();
    }
    /**
     * Adds the listener function to the end of the listeners array for the event.
     * No checks are made to see if the listener has already been added. Multiple calls passing
     * the same combination of event and listener will result in the listener being added, and
     * called, multiple times.
     * @returns this MessageStream, so that calls can be chained
     */
    on(event, listener) {
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
        listeners.push({ listener });
        return this;
    }
    /**
     * Removes the specified listener from the listener array for the event.
     * off() will remove, at most, one instance of a listener from the listener array. If any single
     * listener has been added multiple times to the listener array for the specified event, then
     * off() must be called multiple times to remove each instance.
     * @returns this MessageStream, so that calls can be chained
     */
    off(event, listener) {
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
        if (!listeners)
            return this;
        const index = listeners.findIndex((l) => l.listener === listener);
        if (index >= 0)
            listeners.splice(index, 1);
        return this;
    }
    /**
     * Adds a one-time listener function for the event. The next time the event is triggered,
     * this listener is removed and then invoked.
     * @returns this MessageStream, so that calls can be chained
     */
    once(event, listener) {
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
        listeners.push({ listener, once: true });
        return this;
    }
    /**
     * This is similar to `.once()`, but returns a Promise that resolves the next time
     * the event is triggered, instead of calling a listener callback.
     * @returns a Promise that resolves the next time given event is triggered,
     * or rejects if an error is emitted.  (If you request the 'error' event,
     * returns a promise that resolves with the error).
     *
     * Example:
     *
     *   const message = await stream.emitted('message') // rejects if the stream errors
     */
    emitted(event) {
        return new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
            if (event !== 'error')
                this.once('error', reject);
            this.once(event, resolve);
        });
    }
    async done() {
        __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
        await __classPrivateFieldGet(this, _MessageStream_endPromise, "f");
    }
    get currentMessage() {
        return __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
    }
    /**
     * @returns a promise that resolves with the the final assistant Message response,
     * or rejects if an error occurred or the stream ended prematurely without producing a Message.
     * If structured outputs were used, this will be a ParsedMessage with a `parsed_output` field.
     */
    async finalMessage() {
        await this.done();
        return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this);
    }
    /**
     * @returns a promise that resolves with the the final assistant Message's text response, concatenated
     * together if there are more than one text blocks.
     * Rejects if an error occurred or the stream ended prematurely without producing a Message.
     */
    async finalText() {
        await this.done();
        return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalText).call(this);
    }
    _emit(event, ...args) {
        // make sure we don't emit any MessageStreamEvents after end
        if (__classPrivateFieldGet(this, _MessageStream_ended, "f"))
            return;
        if (event === 'end') {
            __classPrivateFieldSet(this, _MessageStream_ended, true, "f");
            __classPrivateFieldGet(this, _MessageStream_resolveEndPromise, "f").call(this);
        }
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
        if (listeners) {
            __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
            listeners.forEach(({ listener }) => listener(...args));
        }
        if (event === 'abort') {
            const error = args[0];
            if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                Promise.reject(error);
            }
            __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
            __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
            return;
        }
        if (event === 'error') {
            // NOTE: _emit('error', error) should only be called from #handleError().
            const error = args[0];
            if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                // Trigger an unhandled rejection if the user hasn't registered any error handlers.
                // If you are seeing stack traces here, make sure to handle errors via either:
                // - runner.on('error', () => ...)
                // - await runner.done()
                // - await runner.final...()
                // - etc.
                Promise.reject(error);
            }
            __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
            __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
        }
    }
    _emitFinal() {
        const finalMessage = this.receivedMessages.at(-1);
        if (finalMessage) {
            this._emit('finalMessage', __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this));
        }
    }
    async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted)
                this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
            this._connected(null);
            const stream = Stream.fromReadableStream(readableStream, this.controller);
            for await (const event of stream) {
                __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new APIUserAbortError();
            }
            __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
        }
        finally {
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    [(_MessageStream_currentMessageSnapshot = new WeakMap(), _MessageStream_params = new WeakMap(), _MessageStream_connectedPromise = new WeakMap(), _MessageStream_resolveConnectedPromise = new WeakMap(), _MessageStream_rejectConnectedPromise = new WeakMap(), _MessageStream_endPromise = new WeakMap(), _MessageStream_resolveEndPromise = new WeakMap(), _MessageStream_rejectEndPromise = new WeakMap(), _MessageStream_listeners = new WeakMap(), _MessageStream_ended = new WeakMap(), _MessageStream_errored = new WeakMap(), _MessageStream_aborted = new WeakMap(), _MessageStream_catchingPromiseCreated = new WeakMap(), _MessageStream_response = new WeakMap(), _MessageStream_request_id = new WeakMap(), _MessageStream_logger = new WeakMap(), _MessageStream_handleError = new WeakMap(), _MessageStream_instances = new WeakSet(), _MessageStream_getFinalMessage = function _MessageStream_getFinalMessage() {
        if (this.receivedMessages.length === 0) {
            throw new error_AnthropicError('stream ended without producing a Message with role=assistant');
        }
        return this.receivedMessages.at(-1);
    }, _MessageStream_getFinalText = function _MessageStream_getFinalText() {
        if (this.receivedMessages.length === 0) {
            throw new error_AnthropicError('stream ended without producing a Message with role=assistant');
        }
        const textBlocks = this.receivedMessages
            .at(-1)
            .content.filter((block) => block.type === 'text')
            .map((block) => block.text);
        if (textBlocks.length === 0) {
            throw new error_AnthropicError('stream ended without producing a content block with type=text');
        }
        return textBlocks.join(' ');
    }, _MessageStream_beginRequest = function _MessageStream_beginRequest() {
        if (this.ended)
            return;
        __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, undefined, "f");
    }, _MessageStream_addStreamEvent = function _MessageStream_addStreamEvent(event) {
        if (this.ended)
            return;
        const messageSnapshot = __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_accumulateMessage).call(this, event);
        this._emit('streamEvent', event, messageSnapshot);
        switch (event.type) {
            case 'content_block_delta': {
                const content = messageSnapshot.content.at(-1);
                switch (event.delta.type) {
                    case 'text_delta': {
                        if (content.type === 'text') {
                            this._emit('text', event.delta.text, content.text || '');
                        }
                        break;
                    }
                    case 'citations_delta': {
                        if (content.type === 'text') {
                            this._emit('citation', event.delta.citation, content.citations ?? []);
                        }
                        break;
                    }
                    case 'input_json_delta': {
                        if (MessageStream_tracksToolInput(content) && content.input) {
                            this._emit('inputJson', event.delta.partial_json, content.input);
                        }
                        break;
                    }
                    case 'thinking_delta': {
                        if (content.type === 'thinking') {
                            this._emit('thinking', event.delta.thinking, content.thinking);
                        }
                        break;
                    }
                    case 'signature_delta': {
                        if (content.type === 'thinking') {
                            this._emit('signature', content.signature);
                        }
                        break;
                    }
                    default:
                        MessageStream_checkNever(event.delta);
                }
                break;
            }
            case 'message_stop': {
                this._addMessageParam(messageSnapshot);
                this._addMessage(maybeParseMessage(messageSnapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") }), true);
                break;
            }
            case 'content_block_stop': {
                this._emit('contentBlock', messageSnapshot.content.at(-1));
                break;
            }
            case 'message_start': {
                __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, messageSnapshot, "f");
                break;
            }
            case 'content_block_start':
            case 'message_delta':
                break;
        }
    }, _MessageStream_endRequest = function _MessageStream_endRequest() {
        if (this.ended) {
            throw new error_AnthropicError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
        if (!snapshot) {
            throw new error_AnthropicError(`request ended without sending any chunks`);
        }
        __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, undefined, "f");
        return maybeParseMessage(snapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") });
    }, _MessageStream_accumulateMessage = function _MessageStream_accumulateMessage(event) {
        let snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
        if (event.type === 'message_start') {
            if (snapshot) {
                throw new error_AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
            }
            return event.message;
        }
        if (!snapshot) {
            throw new error_AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
        }
        switch (event.type) {
            case 'message_stop':
                return snapshot;
            case 'message_delta':
                snapshot.stop_reason = event.delta.stop_reason;
                snapshot.stop_sequence = event.delta.stop_sequence;
                snapshot.usage.output_tokens = event.usage.output_tokens;
                // Update other usage fields if they exist in the event
                if (event.usage.input_tokens != null) {
                    snapshot.usage.input_tokens = event.usage.input_tokens;
                }
                if (event.usage.cache_creation_input_tokens != null) {
                    snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
                }
                if (event.usage.cache_read_input_tokens != null) {
                    snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
                }
                if (event.usage.server_tool_use != null) {
                    snapshot.usage.server_tool_use = event.usage.server_tool_use;
                }
                return snapshot;
            case 'content_block_start':
                snapshot.content.push({ ...event.content_block });
                return snapshot;
            case 'content_block_delta': {
                const snapshotContent = snapshot.content.at(event.index);
                switch (event.delta.type) {
                    case 'text_delta': {
                        if (snapshotContent?.type === 'text') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                text: (snapshotContent.text || '') + event.delta.text,
                            };
                        }
                        break;
                    }
                    case 'citations_delta': {
                        if (snapshotContent?.type === 'text') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                citations: [...(snapshotContent.citations ?? []), event.delta.citation],
                            };
                        }
                        break;
                    }
                    case 'input_json_delta': {
                        if (snapshotContent && MessageStream_tracksToolInput(snapshotContent)) {
                            // we need to keep track of the raw JSON string as well so that we can
                            // re-parse it for each delta, for now we just store it as an untyped
                            // non-enumerable property on the snapshot
                            let jsonBuf = snapshotContent[MessageStream_JSON_BUF_PROPERTY] || '';
                            jsonBuf += event.delta.partial_json;
                            const newContent = { ...snapshotContent };
                            Object.defineProperty(newContent, MessageStream_JSON_BUF_PROPERTY, {
                                value: jsonBuf,
                                enumerable: false,
                                writable: true,
                            });
                            if (jsonBuf) {
                                newContent.input = partialParse(jsonBuf);
                            }
                            snapshot.content[event.index] = newContent;
                        }
                        break;
                    }
                    case 'thinking_delta': {
                        if (snapshotContent?.type === 'thinking') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                thinking: snapshotContent.thinking + event.delta.thinking,
                            };
                        }
                        break;
                    }
                    case 'signature_delta': {
                        if (snapshotContent?.type === 'thinking') {
                            snapshot.content[event.index] = {
                                ...snapshotContent,
                                signature: event.delta.signature,
                            };
                        }
                        break;
                    }
                    default:
                        MessageStream_checkNever(event.delta);
                }
                return snapshot;
            }
            case 'content_block_stop':
                return snapshot;
        }
    }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on('streamEvent', (event) => {
            const reader = readQueue.shift();
            if (reader) {
                reader.resolve(event);
            }
            else {
                pushQueue.push(event);
            }
        });
        this.on('end', () => {
            done = true;
            for (const reader of readQueue) {
                reader.resolve(undefined);
            }
            readQueue.length = 0;
        });
        this.on('abort', (err) => {
            done = true;
            for (const reader of readQueue) {
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        this.on('error', (err) => {
            done = true;
            for (const reader of readQueue) {
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        return {
            next: async () => {
                if (!pushQueue.length) {
                    if (done) {
                        return { value: undefined, done: true };
                    }
                    return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk) => (chunk ? { value: chunk, done: false } : { value: undefined, done: true }));
                }
                const chunk = pushQueue.shift();
                return { value: chunk, done: false };
            },
            return: async () => {
                this.abort();
                return { value: undefined, done: true };
            },
        };
    }
    toReadableStream() {
        const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
    }
}
// used to ensure exhaustive case matching without throwing a runtime error
function MessageStream_checkNever(x) { }
//# sourceMappingURL=MessageStream.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/messages/batches.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.






class batches_Batches extends APIResource {
    /**
     * Send a batch of Message creation requests.
     *
     * The Message Batches API can be used to process multiple Messages API requests at
     * once. Once a Message Batch is created, it begins processing immediately. Batches
     * can take up to 24 hours to complete.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.create({
     *   requests: [
     *     {
     *       custom_id: 'my-custom-id-1',
     *       params: {
     *         max_tokens: 1024,
     *         messages: [
     *           { content: 'Hello, world', role: 'user' },
     *         ],
     *         model: 'claude-opus-4-6',
     *       },
     *     },
     *   ],
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/v1/messages/batches', { body, ...options });
    }
    /**
     * This endpoint is idempotent and can be used to poll for Message Batch
     * completion. To access the results of a Message Batch, make a request to the
     * `results_url` field in the response.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.retrieve(
     *   'message_batch_id',
     * );
     * ```
     */
    retrieve(messageBatchID, options) {
        return this._client.get(path `/v1/messages/batches/${messageBatchID}`, options);
    }
    /**
     * List all Message Batches within a Workspace. Most recently created batches are
     * returned first.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const messageBatch of client.messages.batches.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/messages/batches', (Page), { query, ...options });
    }
    /**
     * Delete a Message Batch.
     *
     * Message Batches can only be deleted once they've finished processing. If you'd
     * like to delete an in-progress batch, you must first cancel it.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const deletedMessageBatch =
     *   await client.messages.batches.delete('message_batch_id');
     * ```
     */
    delete(messageBatchID, options) {
        return this._client.delete(path `/v1/messages/batches/${messageBatchID}`, options);
    }
    /**
     * Batches may be canceled any time before processing ends. Once cancellation is
     * initiated, the batch enters a `canceling` state, at which time the system may
     * complete any in-progress, non-interruptible requests before finalizing
     * cancellation.
     *
     * The number of canceled requests is specified in `request_counts`. To determine
     * which requests were canceled, check the individual results within the batch.
     * Note that cancellation may not result in any canceled requests if they were
     * non-interruptible.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.cancel(
     *   'message_batch_id',
     * );
     * ```
     */
    cancel(messageBatchID, options) {
        return this._client.post(path `/v1/messages/batches/${messageBatchID}/cancel`, options);
    }
    /**
     * Streams the results of a Message Batch as a `.jsonl` file.
     *
     * Each line in the file is a JSON object containing the result of a single request
     * in the Message Batch. Results are not guaranteed to be in the same order as
     * requests. Use the `custom_id` field to match results to requests.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatchIndividualResponse =
     *   await client.messages.batches.results('message_batch_id');
     * ```
     */
    async results(messageBatchID, options) {
        const batch = await this.retrieve(messageBatchID);
        if (!batch.results_url) {
            throw new error_AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        return this._client
            .get(batch.results_url, {
            ...options,
            headers: buildHeaders([{ Accept: 'application/binary' }, options?.headers]),
            stream: true,
            __binaryResponse: true,
        })
            ._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
    }
}
//# sourceMappingURL=batches.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.








class messages_Messages extends APIResource {
    constructor() {
        super(...arguments);
        this.batches = new batches_Batches(this._client);
    }
    create(body, options) {
        if (body.model in messages_DEPRECATED_MODELS) {
            console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${messages_DEPRECATED_MODELS[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        }
        if (messages_MODELS_TO_WARN_WITH_THINKING_ENABLED.includes(body.model) &&
            body.thinking &&
            body.thinking.type === 'enabled') {
            console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
        }
        let timeout = this._client._options.timeout;
        if (!body.stream && timeout == null) {
            const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? undefined;
            timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
        }
        // Collect helper info from tools and messages
        const helperHeader = stainlessHelperHeader(body.tools, body.messages);
        return this._client.post('/v1/messages', {
            body,
            timeout: timeout ?? 600000,
            ...options,
            headers: buildHeaders([helperHeader, options?.headers]),
            stream: body.stream ?? false,
        });
    }
    /**
     * Send a structured list of input messages with text and/or image content, along with an expected `output_config.format` and
     * the response will be automatically parsed and available in the `parsed_output` property of the message.
     *
     * @example
     * ```ts
     * const message = await client.messages.parse({
     *   model: 'claude-sonnet-4-5-20250929',
     *   max_tokens: 1024,
     *   messages: [{ role: 'user', content: 'What is 2+2?' }],
     *   output_config: {
     *     format: zodOutputFormat(z.object({ answer: z.number() })),
     *   },
     * });
     *
     * console.log(message.parsed_output?.answer); // 4
     * ```
     */
    parse(params, options) {
        return this.create(params, options).then((message) => parseMessage(message, params, { logger: this._client.logger ?? console }));
    }
    /**
     * Create a Message stream.
     *
     * If `output_config.format` is provided with a parseable format (like `zodOutputFormat()`),
     * the final message will include a `parsed_output` property with the parsed content.
     *
     * @example
     * ```ts
     * const stream = client.messages.stream({
     *   model: 'claude-sonnet-4-5-20250929',
     *   max_tokens: 1024,
     *   messages: [{ role: 'user', content: 'What is 2+2?' }],
     *   output_config: {
     *     format: zodOutputFormat(z.object({ answer: z.number() })),
     *   },
     * });
     *
     * const message = await stream.finalMessage();
     * console.log(message.parsed_output?.answer); // 4
     * ```
     */
    stream(body, options) {
        return MessageStream.createMessage(this, body, options, { logger: this._client.logger ?? console });
    }
    /**
     * Count the number of tokens in a Message.
     *
     * The Token Count API can be used to count the number of tokens in a Message,
     * including tools, images, and documents, without creating it.
     *
     * Learn more about token counting in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
     *
     * @example
     * ```ts
     * const messageTokensCount =
     *   await client.messages.countTokens({
     *     messages: [{ content: 'Hello, world', role: 'user' }],
     *     model: 'claude-opus-4-6',
     *   });
     * ```
     */
    countTokens(body, options) {
        return this._client.post('/v1/messages/count_tokens', { body, ...options });
    }
}
const messages_DEPRECATED_MODELS = {
    'claude-1.3': 'November 6th, 2024',
    'claude-1.3-100k': 'November 6th, 2024',
    'claude-instant-1.1': 'November 6th, 2024',
    'claude-instant-1.1-100k': 'November 6th, 2024',
    'claude-instant-1.2': 'November 6th, 2024',
    'claude-3-sonnet-20240229': 'July 21st, 2025',
    'claude-3-opus-20240229': 'January 5th, 2026',
    'claude-2.1': 'July 21st, 2025',
    'claude-2.0': 'July 21st, 2025',
    'claude-3-7-sonnet-latest': 'February 19th, 2026',
    'claude-3-7-sonnet-20250219': 'February 19th, 2026',
    'claude-3-5-haiku-latest': 'February 19th, 2026',
    'claude-3-5-haiku-20241022': 'February 19th, 2026',
    'claude-opus-4-0': 'June 15th, 2026',
    'claude-opus-4-20250514': 'June 15th, 2026',
    'claude-sonnet-4-0': 'June 15th, 2026',
    'claude-sonnet-4-20250514': 'June 15th, 2026',
};
const messages_MODELS_TO_WARN_WITH_THINKING_ENABLED = ['claude-mythos-preview', 'claude-opus-4-6'];
messages_Messages.Batches = batches_Batches;
//# sourceMappingURL=messages.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/models.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class models_Models extends APIResource {
    /**
     * Get a specific model.
     *
     * The Models API response can be used to determine information about a specific
     * model or resolve a model alias to a model ID.
     */
    retrieve(modelID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/models/${modelID}`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * List available models.
     *
     * The Models API response can be used to determine which models are available for
     * use in the API. More recently released models are listed first.
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/models', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
}
//# sourceMappingURL=models.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/resources/index.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.





//# sourceMappingURL=index.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/client.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _BaseAnthropic_instances, _a, _BaseAnthropic_encoder, _BaseAnthropic_baseURLOverridden;



























const HUMAN_PROMPT = '\\n\\nHuman:';
const AI_PROMPT = '\\n\\nAssistant:';
/**
 * Base class for Anthropic API clients.
 */
class BaseAnthropic {
    /**
     * The active credential provider. Default credential resolution runs once
     * at construction time. If it fails, the error is surfaced on every
     * request and the client must be reconstructed — there is no retry path.
     *
     * Clones returned by {@link withOptions} share the parent's auth state
     * (provider, token cache, pending resolution, and any resolution error)
     * unless the caller passes an explicit `apiKey`, `authToken`,
     * `credentials`, `config`, or `profile` override.
     */
    get credentials() {
        return this._authState.provider;
    }
    /**
     * API Client for interfacing with the Anthropic API.
     *
     * @param {string | null | undefined} [opts.apiKey=process.env['ANTHROPIC_API_KEY'] ?? null]
     * @param {string | null | undefined} [opts.authToken=process.env['ANTHROPIC_AUTH_TOKEN'] ?? null]
     * @param {string | null | undefined} [opts.webhookKey=process.env['ANTHROPIC_WEBHOOK_SIGNING_KEY'] ?? null]
     * @param {string} [opts.baseURL=process.env['ANTHROPIC_BASE_URL'] ?? https://api.anthropic.com] - Override the default base URL for the API.
     * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
     * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
     * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */
    constructor({ baseURL = readEnv('ANTHROPIC_BASE_URL'), apiKey, authToken, webhookKey = readEnv('ANTHROPIC_WEBHOOK_SIGNING_KEY') ?? null, ...opts } = {}) {
        _BaseAnthropic_instances.add(this);
        this._requestAuthFlags = new WeakMap();
        _BaseAnthropic_encoder.set(this, void 0);
        // An explicit `profile` is a constructor-level credential choice; when set,
        // do not let env ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN shadow it.
        if (apiKey === undefined) {
            apiKey = opts.profile != null ? null : readEnv('ANTHROPIC_API_KEY') ?? null;
        }
        if (authToken === undefined) {
            authToken = opts.profile != null ? null : readEnv('ANTHROPIC_AUTH_TOKEN') ?? null;
        }
        if (opts.profile != null && (opts.credentials != null || opts.config != null)) {
            throw new TypeError('Pass at most one of `profile`, `credentials`, or `config`.');
        }
        const options = {
            apiKey,
            authToken,
            webhookKey,
            ...opts,
            baseURL: baseURL || `https://api.anthropic.com`,
        };
        if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
            throw new error_AnthropicError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Anthropic({ apiKey, dangerouslyAllowBrowser: true });\n");
        }
        this.baseURL = options.baseURL;
        // After destructuring, `baseURL` is the constructor arg or
        // ANTHROPIC_BASE_URL — both count as an explicit choice that a profile
        // base_url must not override. A falsy value means we fell through to the
        // hardcoded default above and a profile may supply the host. withOptions()
        // propagates the parent's flag via __baseURLIsExplicit so a non-overriding
        // clone doesn't mistake the inherited baseURL for a caller-supplied one.
        this._baseURLIsExplicit = opts.__baseURLIsExplicit ?? !!baseURL;
        this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT /* 10 minutes */;
        this.logger = options.logger ?? console;
        const defaultLogLevel = 'warn';
        // Set default logLevel early so that we can log a warning in parseLogLevel.
        this.logLevel = defaultLogLevel;
        this.logLevel =
            parseLogLevel(options.logLevel, 'ClientOptions.logLevel', this) ??
                parseLogLevel(readEnv('ANTHROPIC_LOG'), "process.env['ANTHROPIC_LOG']", this) ??
                defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.fetch = options.fetch ?? getDefaultFetch();
        __classPrivateFieldSet(this, _BaseAnthropic_encoder, FallbackEncoder, "f");
        const customHeadersEnv = readEnv('ANTHROPIC_CUSTOM_HEADERS');
        if (customHeadersEnv) {
            const parsed = {};
            for (const line of customHeadersEnv.split('\n')) {
                const colon = line.indexOf(':');
                if (colon >= 0) {
                    parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
                }
            }
            options.defaultHeaders = { ...parsed, ...options.defaultHeaders };
        }
        const inherited = opts.__auth;
        // Never persist the internal __auth handle on _options — it's a
        // one-shot constructor signal, and leaking it through _options would
        // cause withOptions() to spread a stale value into clones.
        delete options.__auth;
        delete options.__baseURLIsExplicit;
        this._options = options;
        this.apiKey = typeof apiKey === 'string' ? apiKey : null;
        this.authToken = authToken;
        this.webhookKey = webhookKey;
        if (inherited) {
            this._authState = inherited;
            if (!this._baseURLIsExplicit && inherited.baseURL) {
                this.baseURL = inherited.baseURL;
            }
        }
        else {
            this._authState = { provider: null, tokenCache: null, resolution: null, error: null, extraHeaders: {} };
            // apiKey/authToken win over credentials/config/profile; don't build a
            // token cache or resolve a config that the request path will then ignore.
            if (this.apiKey == null && this.authToken == null) {
                const credentials = options.credentials ?? null;
                if (credentials) {
                    this._authState.provider = credentials;
                    this._authState.tokenCache = this._makeTokenCache(credentials);
                }
                else if (options.config != null) {
                    const result = resolveCredentialsFromConfig(options.config, this._credentialResolverOptions());
                    this._authState.provider = result.provider;
                    this._authState.tokenCache = this._makeTokenCache(result.provider);
                    this._authState.extraHeaders = result.extraHeaders;
                    this._applyCredentialBaseURL(result.baseURL);
                }
                else if (options.profile != null) {
                    this._authState.resolution = this._resolveDefaultCredentials(options.profile);
                }
                else {
                    // No explicit auth provided — lazily resolve from the credential
                    // chain on first request. Errors are captured into _auth.error and
                    // surfaced on first use rather than as an unhandled rejection.
                    this._authState.resolution = this._resolveDefaultCredentials();
                }
            }
        }
    }
    /**
     * Stores a profile/config-supplied base URL on the shared auth state and, if
     * the caller did not pin `baseURL` via constructor option or env, adopts it
     * as this client's outbound API host. Precedence: ctor opt > env > profile >
     * hardcoded default.
     */
    _applyCredentialBaseURL(baseURL) {
        if (!baseURL)
            return;
        const normalized = baseURL.replace(/\/+$/, '');
        this._authState.baseURL = normalized;
        if (!this._baseURLIsExplicit) {
            this.baseURL = normalized;
        }
    }
    /**
     * Options bag passed into the credential chain. `baseURL` here is only the
     * fallback host for the token-exchange POST when the config itself omits
     * `base_url`; the chain returns the config's own `base_url` (if any) on
     * {@link CredentialResult.baseURL}, which {@link _applyCredentialBaseURL}
     * then adopts for outbound API requests. The two are deliberately decoupled
     * so this fallback never round-trips into precedence.
     */
    _credentialResolverOptions() {
        return {
            baseURL: this.baseURL,
            fetch: this.fetch,
            userAgent: this.getUserAgent(),
            onCacheWriteError: (err) => {
                loggerFor(this).debug('credential cache write failed (best-effort)', err);
            },
            onSafetyWarning: (msg) => {
                loggerFor(this).warn(msg);
            },
        };
    }
    _makeTokenCache(provider) {
        return new TokenCache(provider, (err) => {
            loggerFor(this).debug('advisory token refresh failed; serving cached token', err);
        });
    }
    /**
     * Create a new client instance re-using the same options given to the current client with optional overriding.
     */
    withOptions(options) {
        // Share the auth state object unless the caller passes any auth-related
        // key. The `in` check is intentional: even `apiKey: undefined` opts the
        // clone out of sharing (it gets its own _auth and TokenCache, though it
        // may still wrap the parent's provider via the credentials spread below).
        const overridesStructuredAuth = 'credentials' in options || 'config' in options || 'profile' in options;
        const overridesAuth = 'apiKey' in options || 'authToken' in options || overridesStructuredAuth;
        const internal = {
            ...this._options,
            // Only forward baseURL when the caller (or env) explicitly chose it.
            // For a non-explicit parent, this.baseURL may have been mutated to the
            // profile-resolved host; pinning that as the clone's options.baseURL
            // would make _options on the clone misreport caller intent and would
            // leave the clone stuck on the parent's host across an auth override.
            // The clone instead receives the construction-time value via
            // ...this._options above and re-adopts the profile host through the
            // shared _authState.baseURL + __baseURLIsExplicit=false path.
            ...(this._baseURLIsExplicit ? { baseURL: this.baseURL } : {}),
            maxRetries: this.maxRetries,
            timeout: this.timeout,
            logger: this.logger,
            logLevel: this.logLevel,
            fetch: this.fetch,
            fetchOptions: this.fetchOptions,
            apiKey: this.apiKey,
            authToken: this.authToken,
            webhookKey: this.webhookKey,
            // credentials: this.credentials is a no-op when __auth is shared (the
            // ctor takes the inherited path and ignores options.credentials); when
            // overridesAuth is true via apiKey/authToken only, it lets the clone
            // build a fresh TokenCache around the parent's provider.
            credentials: this.credentials,
            // When the caller passes a structured-credential override, drop inherited
            // structured-credential options so only `...options` supplies them —
            // otherwise an inherited `credentials`/`config`/`profile` would trip the
            // mutual-exclusion check or precedence over the override.
            ...(overridesStructuredAuth ? { credentials: undefined, config: undefined, profile: undefined } : {}),
            ...options,
            // Always set __auth so any stale value from ...this._options is
            // overwritten. undefined means "build fresh auth from these options".
            __auth: overridesAuth ? undefined : this._authState,
            __baseURLIsExplicit: 'baseURL' in options ? true : this._baseURLIsExplicit,
        };
        return new this.constructor(internal);
    }
    /**
     * Lazily resolves credentials from config files or environment variables.
     * Called once from the constructor when no explicit auth is provided, or
     * when an explicit `profile` was passed (in which case a missing/unresolved
     * profile is surfaced as an error instead of falling through to "no auth").
     * The returned promise is stored and awaited on the first request.
     */
    async _resolveDefaultCredentials(profile) {
        try {
            const result = await defaultCredentials(this._credentialResolverOptions(), profile);
            if (result) {
                this._authState.provider = result.provider;
                this._authState.tokenCache = this._makeTokenCache(result.provider);
                this._authState.extraHeaders = result.extraHeaders;
                this._applyCredentialBaseURL(result.baseURL);
            }
            else if (profile != null) {
                throw new error_AnthropicError(`Profile "${profile}" could not be resolved (no <config_dir>/configs/${profile}.json found).`);
            }
        }
        catch (err) {
            this._authState.error = err;
        }
        finally {
            this._authState.resolution = null;
        }
    }
    defaultQuery() {
        return this._options.defaultQuery;
    }
    validateHeaders({ values, nulls }) {
        if (values.get('x-api-key') || values.get('authorization')) {
            return;
        }
        if (this._authState.error) {
            throw this._authState.error;
        }
        if (this._authState.tokenCache || this._authState.resolution) {
            return; // auth will be injected per-request via authHeaders
        }
        if (this.apiKey && values.get('x-api-key')) {
            return;
        }
        if (nulls.has('x-api-key')) {
            return;
        }
        if (this.authToken && values.get('authorization')) {
            return;
        }
        if (nulls.has('authorization')) {
            return;
        }
        throw new Error('Could not resolve authentication method. Expected one of apiKey, authToken, credentials, config, or profile to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
    }
    _authFlags(opts) {
        let flags = this._requestAuthFlags.get(opts);
        if (!flags) {
            flags = { usedTokenCache: false, didRefreshFor401: false };
            this._requestAuthFlags.set(opts, flags);
        }
        return flags;
    }
    async authHeaders(opts) {
        // Wait for lazy credential resolution if it's in progress. If it failed,
        // return no auth headers — validateHeaders surfaces the stored error
        // after the explicit-header escape hatch has had a chance to apply.
        if (this._authState.resolution) {
            await this._authState.resolution;
        }
        if (this._authState.error) {
            return undefined;
        }
        // If we have a token cache and no API key is set, use token auth
        if (this._authState.tokenCache && this.apiKey == null) {
            const token = await this._authState.tokenCache.getToken();
            this._authFlags(opts).usedTokenCache = true;
            return buildHeaders([{ Authorization: `Bearer ${token}` }]);
        }
        return buildHeaders([await this.apiKeyAuth(opts), await this.bearerAuth(opts)]);
    }
    async apiKeyAuth(opts) {
        if (this.apiKey == null) {
            return undefined;
        }
        return buildHeaders([{ 'X-Api-Key': this.apiKey }]);
    }
    async bearerAuth(opts) {
        if (this.authToken == null) {
            return undefined;
        }
        return buildHeaders([{ Authorization: `Bearer ${this.authToken}` }]);
    }
    stringifyQuery(query) {
        return stringifyQuery(query);
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${VERSION}`;
    }
    defaultIdempotencyKey() {
        return `stainless-node-retry-${uuid4()}`;
    }
    makeStatusError(status, error, message, headers) {
        return APIError.generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
        const baseURL = (!__classPrivateFieldGet(this, _BaseAnthropic_instances, "m", _BaseAnthropic_baseURLOverridden).call(this) && defaultBaseURL) || this.baseURL;
        const url = isAbsoluteURL(path) ?
            new URL(path)
            : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));
        const defaultQuery = this.defaultQuery();
        const pathQuery = Object.fromEntries(url.searchParams);
        if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
            query = { ...pathQuery, ...defaultQuery, ...query };
        }
        if (typeof query === 'object' && query && !Array.isArray(query)) {
            url.search = this.stringifyQuery(query);
        }
        return url.toString();
    }
    _calculateNonstreamingTimeout(maxTokens) {
        const defaultTimeout = 10 * 60;
        const expectedTimeout = (60 * 60 * maxTokens) / 128000;
        if (expectedTimeout > defaultTimeout) {
            throw new error_AnthropicError('Streaming is required for operations that may take longer than 10 minutes. ' +
                'See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details');
        }
        return defaultTimeout * 1000;
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    async prepareOptions(options) { }
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */
    async prepareRequest(request, { url, options }) {
        // Append auth-derived headers when using token auth. Done here (after all
        // header merging) rather than in authHeaders() so we append to any existing
        // anthropic-beta values instead of being overwritten by later header sources.
        if (this._authState.tokenCache && this.apiKey == null) {
            // Normalize to a Headers instance — custom fetch impls or polyfills can
            // hand back arrays / plain objects, and silently dropping the beta
            // header in that case would surface as a confusing server-side 4xx.
            const headers = request.headers instanceof Headers ? request.headers : new Headers(request.headers);
            for (const [k, v] of Object.entries(this._authState.extraHeaders)) {
                if (!headers.has(k))
                    headers.set(k, v);
            }
            const existing = headers
                .get('anthropic-beta')
                ?.split(',')
                .map((s) => s.trim());
            if (!existing?.includes(OAUTH_API_BETA_HEADER)) {
                headers.append('anthropic-beta', OAUTH_API_BETA_HEADER);
            }
            request.headers = headers;
        }
    }
    get(path, opts) {
        return this.methodRequest('get', path, opts);
    }
    post(path, opts) {
        return this.methodRequest('post', path, opts);
    }
    patch(path, opts) {
        return this.methodRequest('patch', path, opts);
    }
    put(path, opts) {
        return this.methodRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.methodRequest('delete', path, opts);
    }
    methodRequest(method, path, opts) {
        return this.request(Promise.resolve(opts).then((opts) => {
            return { method, path, ...opts };
        }));
    }
    request(options, remainingRetries = null) {
        return new APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
    }
    async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
            retriesRemaining = maxRetries;
            // Top-level call: reset per-request auth flags so a reused options object
            // (via client.request(opts)) doesn't carry stale 401-refresh state.
            this._requestAuthFlags.delete(options);
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
            retryCount: maxRetries - retriesRemaining,
        });
        await this.prepareRequest(req, { url, options });
        /** Not an API request ID, just for correlating local log entries. */
        const requestLogID = 'log_' + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, '0');
        const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
            retryOfRequestLogID,
            method: options.method,
            url,
            options,
            headers: req.headers,
        }));
        if (options.signal?.aborted) {
            throw new APIUserAbortError();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
        const headersTime = Date.now();
        if (response instanceof globalThis.Error) {
            const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
            if (options.signal?.aborted) {
                throw new APIUserAbortError();
            }
            // detect native connection timeout errors
            // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
            // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
            // others do not provide enough information to distinguish timeouts from other connection errors
            const isTimeout = isAbortError(response) ||
                /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
            if (retriesRemaining) {
                loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url,
                    durationMs: headersTime - startTime,
                    message: response.message,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
            }
            loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`);
            loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`, formatRequestDetails({
                retryOfRequestLogID,
                url,
                durationMs: headersTime - startTime,
                message: response.message,
            }));
            if (isTimeout) {
                throw new APIConnectionTimeoutError();
            }
            throw new APIConnectionError({ cause: response });
        }
        const specialHeaders = [...response.headers.entries()]
            .filter(([name]) => name === 'request-id')
            .map(([name, value]) => ', ' + name + ': ' + JSON.stringify(value))
            .join('');
        const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? 'succeeded' : 'failed'} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
            const shouldRetry = await this.shouldRetry(response, options);
            if (retriesRemaining && shouldRetry) {
                const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
                // We don't need the body of this response.
                await CancelReadableStream(response.body);
                loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url: response.url,
                    status: response.status,
                    headers: response.headers,
                    durationMs: headersTime - startTime,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
            }
            const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
            loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
            const errText = await response.text().catch((err) => castToError(err).message);
            const errJSON = safeJSON(errText);
            const errMessage = errJSON ? undefined : errText;
            loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                retryOfRequestLogID,
                url: response.url,
                status: response.status,
                headers: response.headers,
                message: errMessage,
                durationMs: Date.now() - startTime,
            }));
            const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
            throw err;
        }
        loggerFor(this).info(responseInfo);
        loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
        }));
        return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
    }
    getAPIList(path, Page, opts) {
        return this.requestAPIList(Page, opts && 'then' in opts ?
            opts.then((opts) => ({ method: 'get', path, ...opts }))
            : { method: 'get', path, ...opts });
    }
    requestAPIList(Page, options) {
        const request = this.makeRequest(options, null, undefined);
        return new PagePromise(this, request, Page);
    }
    async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        // Avoid creating a closure over `this`, `init`, or `options` to prevent memory leaks.
        // An arrow function like `() => controller.abort()` captures the surrounding scope,
        // which includes the request body and other large objects. When the user passes a
        // long-lived AbortSignal, the listener prevents those objects from being GC'd for
        // the lifetime of the signal. Using `.bind()` only retains a reference to the
        // controller itself.
        const abort = this._makeAbort(controller);
        if (signal)
            signal.addEventListener('abort', abort, { once: true });
        const timeout = setTimeout(abort, ms);
        const isReadableBody = (globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream) ||
            (typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body);
        const fetchOptions = {
            signal: controller.signal,
            ...(isReadableBody ? { duplex: 'half' } : {}),
            method: 'GET',
            ...options,
        };
        if (method) {
            // Custom methods like 'patch' need to be uppercased
            // See https://github.com/nodejs/undici/issues/2294
            fetchOptions.method = method.toUpperCase();
        }
        try {
            // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
            return await this.fetch.call(undefined, url, fetchOptions);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async shouldRetry(response, options) {
        // Reactive refresh: on a 401 from a request that used the token cache,
        // invalidate and retry once. Only fires when this specific request was
        // bearer-authenticated (not when an apiKey was used) and only once per
        // request — a second 401 after refresh falls through to the normal
        // retry policy below (which treats 4xx as non-retryable).
        const flags = this._authFlags(options);
        if (response.status === 401 &&
            this._authState.tokenCache &&
            flags.usedTokenCache &&
            !flags.didRefreshFor401) {
            flags.didRefreshFor401 = true;
            this._authState.tokenCache.invalidate();
            return true;
        }
        // Note this is not a standard header.
        const shouldRetryHeader = response.headers.get('x-should-retry');
        // If the server explicitly says whether or not to retry, obey.
        if (shouldRetryHeader === 'true')
            return true;
        if (shouldRetryHeader === 'false')
            return false;
        // Retry on request timeouts.
        if (response.status === 408)
            return true;
        // Retry on lock timeouts.
        if (response.status === 409)
            return true;
        // Retry on rate limits.
        if (response.status === 429)
            return true;
        // Retry internal errors.
        if (response.status >= 500)
            return true;
        return false;
    }
    async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
        const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
        if (retryAfterMillisHeader) {
            const timeoutMs = parseFloat(retryAfterMillisHeader);
            if (!Number.isNaN(timeoutMs)) {
                timeoutMillis = timeoutMs;
            }
        }
        // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
        const retryAfterHeader = responseHeaders?.get('retry-after');
        if (retryAfterHeader && !timeoutMillis) {
            const timeoutSeconds = parseFloat(retryAfterHeader);
            if (!Number.isNaN(timeoutSeconds)) {
                timeoutMillis = timeoutSeconds * 1000;
            }
            else {
                timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
            }
        }
        // If the API asks us to wait a certain amount of time, just do what it
        // says, but otherwise calculate a default
        if (timeoutMillis === undefined) {
            const maxRetries = options.maxRetries ?? this.maxRetries;
            timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await sleep(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8.0;
        const numRetries = maxRetries - retriesRemaining;
        // Apply exponential backoff, but not more than the max.
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        // Apply some jitter, take up to at most 25 percent of the retry time.
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1000;
    }
    calculateNonstreamingTimeout(maxTokens, maxNonstreamingTokens) {
        const maxTime = 60 * 60 * 1000; // 60 minutes
        const defaultTime = 60 * 10 * 1000; // 10 minutes
        const expectedTime = (maxTime * maxTokens) / 128000;
        if (expectedTime > defaultTime || (maxNonstreamingTokens != null && maxTokens > maxNonstreamingTokens)) {
            throw new error_AnthropicError('Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details');
        }
        return defaultTime;
    }
    async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = { ...inputOptions };
        const { method, path, query, defaultBaseURL } = options;
        // Lazy credential resolution may carry a profile-supplied baseURL. Await
        // it before building the request URL so the very first request — and
        // requests on withOptions() clones created before resolution settled —
        // hit the profile's host rather than the hardcoded default.
        if (this._authState.resolution) {
            await this._authState.resolution;
        }
        if (!this._baseURLIsExplicit && this._authState.baseURL && this.baseURL !== this._authState.baseURL) {
            this.baseURL = this._authState.baseURL;
        }
        const url = this.buildURL(path, query, defaultBaseURL);
        if ('timeout' in options)
            validatePositiveInteger('timeout', options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({ options });
        const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
        const req = {
            method,
            headers: reqHeaders,
            ...(options.signal && { signal: options.signal }),
            ...(globalThis.ReadableStream &&
                body instanceof globalThis.ReadableStream && { duplex: 'half' }),
            ...(body && { body }),
            ...(this.fetchOptions ?? {}),
            ...(options.fetchOptions ?? {}),
        };
        return { req, url, timeout: options.timeout };
    }
    async buildHeaders({ options, method, bodyHeaders, retryCount, }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== 'get') {
            if (!options.idempotencyKey)
                options.idempotencyKey = this.defaultIdempotencyKey();
            idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = buildHeaders([
            idempotencyHeaders,
            {
                Accept: 'application/json',
                'User-Agent': this.getUserAgent(),
                'X-Stainless-Retry-Count': String(retryCount),
                ...(options.timeout ? { 'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
                ...getPlatformHeaders(),
                ...(this._options.dangerouslyAllowBrowser ?
                    { 'anthropic-dangerous-direct-browser-access': 'true' }
                    : undefined),
                'anthropic-version': '2023-06-01',
            },
            await this.authHeaders(options),
            this._options.defaultHeaders,
            bodyHeaders,
            options.headers,
        ]);
        this.validateHeaders(headers);
        return headers.values;
    }
    _makeAbort(controller) {
        // note: we can't just inline this method inside `fetchWithTimeout()` because then the closure
        //       would capture all request options, and cause a memory leak.
        return () => controller.abort();
    }
    buildBody({ options: { body, headers: rawHeaders } }) {
        if (!body) {
            return { bodyHeaders: undefined, body: undefined };
        }
        const headers = buildHeaders([rawHeaders]);
        if (
        // Pass raw type verbatim
        ArrayBuffer.isView(body) ||
            body instanceof ArrayBuffer ||
            body instanceof DataView ||
            (typeof body === 'string' &&
                // Preserve legacy string encoding behavior for now
                headers.values.has('content-type')) ||
            // `Blob` is superset of `File`
            (globalThis.Blob && body instanceof globalThis.Blob) ||
            // `FormData` -> `multipart/form-data`
            body instanceof FormData ||
            // `URLSearchParams` -> `application/x-www-form-urlencoded`
            body instanceof URLSearchParams ||
            // Send chunked stream (each chunk has own `length`)
            (globalThis.ReadableStream && body instanceof globalThis.ReadableStream)) {
            return { bodyHeaders: undefined, body: body };
        }
        else if (typeof body === 'object' &&
            (Symbol.asyncIterator in body ||
                (Symbol.iterator in body && 'next' in body && typeof body.next === 'function'))) {
            return { bodyHeaders: undefined, body: ReadableStreamFrom(body) };
        }
        else if (typeof body === 'object' &&
            headers.values.get('content-type') === 'application/x-www-form-urlencoded') {
            return {
                bodyHeaders: { 'content-type': 'application/x-www-form-urlencoded' },
                body: this.stringifyQuery(body),
            };
        }
        else {
            return __classPrivateFieldGet(this, _BaseAnthropic_encoder, "f").call(this, { body, headers });
        }
    }
}
_a = BaseAnthropic, _BaseAnthropic_encoder = new WeakMap(), _BaseAnthropic_instances = new WeakSet(), _BaseAnthropic_baseURLOverridden = function _BaseAnthropic_baseURLOverridden() {
    return this.baseURL !== 'https://api.anthropic.com';
};
BaseAnthropic.Anthropic = _a;
BaseAnthropic.HUMAN_PROMPT = HUMAN_PROMPT;
BaseAnthropic.AI_PROMPT = AI_PROMPT;
BaseAnthropic.DEFAULT_TIMEOUT = 600000; // 10 minutes
BaseAnthropic.AnthropicError = error_AnthropicError;
BaseAnthropic.APIError = APIError;
BaseAnthropic.APIConnectionError = APIConnectionError;
BaseAnthropic.APIConnectionTimeoutError = APIConnectionTimeoutError;
BaseAnthropic.APIUserAbortError = APIUserAbortError;
BaseAnthropic.NotFoundError = NotFoundError;
BaseAnthropic.ConflictError = ConflictError;
BaseAnthropic.RateLimitError = RateLimitError;
BaseAnthropic.BadRequestError = BadRequestError;
BaseAnthropic.AuthenticationError = AuthenticationError;
BaseAnthropic.InternalServerError = InternalServerError;
BaseAnthropic.PermissionDeniedError = PermissionDeniedError;
BaseAnthropic.UnprocessableEntityError = UnprocessableEntityError;
BaseAnthropic.toFile = toFile;
/**
 * API Client for interfacing with the Anthropic API.
 */
class Anthropic extends BaseAnthropic {
    constructor() {
        super(...arguments);
        this.completions = new Completions(this);
        this.messages = new messages_Messages(this);
        this.models = new models_Models(this);
        this.beta = new Beta(this);
    }
}
Anthropic.Completions = Completions;
Anthropic.Messages = messages_Messages;
Anthropic.Models = models_Models;
Anthropic.Beta = Beta;
//# sourceMappingURL=client.mjs.map
;// CONCATENATED MODULE: ./node_modules/@anthropic-ai/sdk/index.mjs
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.






//# sourceMappingURL=index.mjs.map

/***/ })

};
