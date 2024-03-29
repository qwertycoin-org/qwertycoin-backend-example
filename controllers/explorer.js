/**
 *     Copyright (c) 2019, ExploShot
 *     Copyright (c) 2019, The Qwertycoin Project
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';
const http = require('http');
const request = require('request-promise-native');
const util = require('util');
const Explorer = function (opts) {
    opts = opts || {};
    if (!(this instanceof Explorer)) return new Explorer(opts);
    this.host = opts.host || 'explorer.qwertycoin.org';
    this.port = opts.port || 8197;
    this.timeout = opts.timeout || 2000;
};

Explorer.prototype.getBlocks = function (opts) {
    return new Promise((resolve, reject) => {
        opts = opts || {};
        if (!opts.height) return reject(new Error('must specify height'));

        this._post('f_blocks_list_json', {
            height: opts.height
        }).then((result) => {
            return resolve(result.blocks);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getBlock = function (opts) {
    return new Promise((resolve, reject) => {
        opts = opts || {};
        if (!opts.hash) return reject(new Error('must specify hash'));

        this._post('f_block_json', {
            hash: opts.hash
        }).then((result) => {
            return resolve(result.block);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getTransaction = function (opts) {
    return new Promise((resolve, reject) => {
        opts = opts || {};
        if (!opts.hash) return reject(new Error('must specify hash'));

        this._post('f_transaction_json', {
            hash: opts.hash
        }).then((result) => {
            return resolve(result)
        }).catch((err) => {
            return reject(err)
        });
    });
};

Explorer.prototype.getTransactionPool = function () {
    return new Promise((resolve, reject) => {
        this._post('f_mempool_json').then((result) => {
            return resolve(result.mempool);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getBlockCount = function () {
    return new Promise((resolve, reject) => {
        this._post('getblockcount').then((result) => {
            return resolve(result.count);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getBlockHash = function (opts) {
    return new Promise((resolve, reject) => {
        let opts = opts || {};
        if (!opts.height) return reject(new Error('must specify height'));

        this._post('on_getblockhash', [
            opts.height
        ]).then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getLastBlockheader = function () {
    return new Promise((resolve, reject) => {
        this._post('getlastblockheader').then((result) => {
            return resolve(result.block_header);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getBlockHeaderByHash = function (opts) {
    return new Promise((resolve, reject) => {
        opts = opts || {};
        if (!opts.hash) return reject(new Error('must specify hash'));

        this._post('getblockheaderbyhash', {
            hash: opts.hash
        }).then((result) => {
            return resolve(result.block_header);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getBlockHeaderByHeight = function (opts) {
    return new Promise((resolve, reject) => {
        opts = opts || {};
        if (!opts.height) return reject(new Error('must specify height'));

        this._post('getblockheaderbyheight', {
            height: opts.height
        }).then((result) => {
            return resolve(result.block_header);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getCurrencyId = function () {
    return new Promise((resolve, reject) => {
        this._post('getcurrencyid').then((result) => {
            return resolve(result.currency_id_blob);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getHeight = function () {
    return new Promise((resolve, reject) => {
        this._get('getheight').then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getInfo = function () {
    return new Promise((resolve, reject) => {
        this._get('getinfo').then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.feeInfo = function () {
    return new Promise((resolve, rejct) => {
        this._get('feeinfo').then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getTransactions = function () {
    return new Promise((resolve, reject) => {
        this._get('gettransactions').then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype.getPeers = function () {
    return new Promise((resolve, reject) => {
        this._get('getpeers').then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype._get = function (method) {
    return new Promise((resolve, reject) => {
        if (method.length === 0) return reject(new Error('no method supplied'));

        request({
            uri: util.format('https://%s:%s/%s', this.host, this.port, method),
            method: 'GET',
            json: true,
            timeout: this.timeout
        }).then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype._post = function (method, params) {
    return new Promise((resolve, reject) => {
        if (method.length === 0) return reject(new Error('no method supplied'))
        params = params || {};

        let body = {
            jsonrpc: '2.0',
            method: method,
            params: params
        };

        this._rawPost('json_rpc', body).then((result) => {
            if (!result.error) {
                return resolve(result.result);
            } else {
                return reject(result.error.message);
            }
        }).catch((err) => {
            return reject(err);
        });
    });
};

Explorer.prototype._rawPost = function (endpoint, body) {
    return new Promise((resolve, reject) => {
        if (endpoint.length === 0) return reject(new Error('no endpoint supplied'));
        if (body === undefined) return reject(new Error('no body supplied'));

        request({
            uri: util.format('https://%s:%s/%s', this.host, this.port, endpoint),
            method: 'POST',
            body: body,
            json: true,
            timeout: this.timeout
        }).then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err)
        });
    });
};

module.exports = Explorer;
