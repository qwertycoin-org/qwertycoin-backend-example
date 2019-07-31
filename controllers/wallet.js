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
const Wallet = function (hostname, port) {
    this.hostname = hostname || '127.0.0.1';
    //this.port = port || 6971;
    this.port = port || 6972; //QWC
}

// general API wallet request
Wallet.prototype._request = function (body) {
    // encode the request into JSON
    let requestJSON = JSON.stringify(body);

    // set basic headers
    let headers = {};
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(requestJSON, 'utf8');

    // make a request to the wallet
    let options = {
        hostname: this.hostname,
        port: this.port,
        path: '/json_rpc',
        method: 'POST',
        headers: headers
    };
    let requestPromise = new Promise((resolve, reject) => {
        let data = '';
        let req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', function () {
                let body = JSON.parse(data);
                if (body && body.result) {
                    resolve(body.result);
                } else if (body && body.error) {
                    resolve(body.error);
                } else {
                    resolve('Wallet response error. Please try again.');
                }
            });
        });
        req.on('error', (e) => resolve(e));
        req.write(requestJSON);
        req.end();
    });

    return requestPromise;
};

// build request body
Wallet.prototype._body = function (method, params) {
    let body = {
        jsonrpc: '2.0',
        id: '0',
        method: method,
        params: params
    };
    return this._request(body);
};

/**
 * Wallet Methods
 * @type {Wallet}
 */


/**
 * @method getBalance
 * @description returns the balance of a wallet
 * @param {string} address the address of the wallet
 */
Wallet.prototype.getBalance = function (address) {
    let method = 'getBalance';
    let params = Object.assign({address: address})
    return this._body(method, params);
};

/**
 * @method getAddress
 * @description returns an array of wallet addresses
 */
Wallet.prototype.getAddresses = function () {
    let method = 'getAddresses';
    return this._body(method);
};

/**
 * @method createAddress
 * @description Creates a new address {param: value}
 * @param {object} secretSpendKey Not Required
 *      Private spend key. If secretSpendKey was specified, RPC Wallet creates spend address
 * @param {object} publicSpendKey Not Required
 *      Public spend key. If publicSpendKey was specified, RPC Wallet creates view address
 **/
Wallet.prototype.createAddress = function (params) {
    let method = 'createAddress';
    if (params && params.hasOwnProperty('secretSpendKey') &&
        params.hasOwnProperty('publicSpendKey')) {
        return 'invalid parameters. Cannot have both.'
    } else {
        return this._body(method, params);
    }
}

/**
 * @method getViewKey
 * @description returns the view key of the wallet
 */
Wallet.prototype.getViewKey = function () {
    let method = 'getViewKey';
    return this._body(method);
}

/**
 * @method getSpendKeys
 * @description returns the spend keys of the address
 * @param {string} address
 */
Wallet.prototype.getSpendKeys = function (address) {
    let method = 'getSpendKeys';
    let params = {address: address};
    return this._body(method, params);
}


/**
 * @method getMnemonicSeed
 * @description return the mnemonics of the address
 * @param {string} address
 */
Wallet.prototype.getMnemonicSeed = function (address) {
    let method = 'getMnemonicSeed';
    let params = {address: address};
    return this._body(method, params);
}

/**
 * @method getStatus
 * @description returns the status of the wallet daemon
 */
Wallet.prototype.getStatus = function () {
    let method = 'getStatus';
    return this._body(method);
}

/**
 * @method deleteAddress
 * @description deletes and address from the wallet
 * @param {string} address
 */
Wallet.prototype.deleteAddress = function (address) {
    let method = 'deleteAddress';
    let params = {address: address};
    return this._body(method, params);
}

/**
 * @method getBlockHashes
 * @description get an array of block hashes
 * @param {number} firstBlockIndex the first block to get
 * @param {number} blockCount the number of block hashes to get
 */
Wallet.prototype.getBlockHashes = function (firstBlockIndex, blockCount) {
    let method = 'getBlockHashes';
    let params = {firstBlockIndex: firstBlockIndex, blockCount: blockCount};
    return this._body(method, params);
}

/**
 * @method getTransactionHashes
 * @description returns the transaction hashes from a ranges of blocks
 * @param {array} addresses not required
 * @param {string} blockHash blockHash or firstBlockIndex
 * @param {string} firstBlockIndex blockHash or firstBlockIndex
 * @param {number} blockCount required
 * @param {string} paymentId not required
 */
Wallet.prototype.getTransactionHashes = function (params) {
    let method = 'getTransactionHashes';
    return this._body(method, params);
}

/**
 * @method getTransactions
 * @description returns the transaction from a ranges of blocks
 * @param {array} addresses not required
 * @param {string} blockHash blockHash or firstBlockIndex
 * @param {string} firstBlockIndex blockHash or firstBlockIndex
 * @param {number} blockCount required
 * @param {string} paymentId not required
 */
Wallet.prototype.getTransactions = function (params) {
    let method = 'getTransactions';
    //let transactions = this._body(method, params);
    //console.log(transactions[0]);
    return this._body(method, params);
}

/**
 * @method getUnconfirmedTransactionsHashes
 * @description returns an array of unconfirmed transaction hashes
 * @param {array} addresses not required
 */
Wallet.prototype.getUnconfirmedTransactionHashes = function (addresses) {
    let method = 'getUnconfirmedTransactionHashes';
    let params = {addresses: addresses};
    return this._body(method, params);
}

/**
 * @method getTransaction
 * @description returns a transaction from a given hash
 * @param {string} transactionHash
 */
Wallet.prototype.getTransaction = function (transactionHash) {
    let method = 'getTransaction';
    let params = {transactionHash: transactionHash};

    return this._body(method, params);
}

/**
 * @method sendTransaction
 * @description Sends a transaction
 * @param {array} transfers Required. An array that contains an object of the transfer
 *      @param {string} address The address to recieve a transfer
 *      @param {unit64} amount  The amount to transfer
 * @param {unit64} anonimity Required. Privacy level. 6 is recommended.
 * @param {unit64} fee Required. The minimal fee is 0.01 cxx.
 * @param {array} addresses Not required. An array of addresses to take the funds from
 * @param {unit64} unlockTime Not Required. Height of the block until the transaction stays locked
 * @param {string} extra Not Required. Attach a string to the transaction a-z, 0-9.
 * @param {string} paymentId Not Required. some paymentId
 * @param {string} changeAddress Not Required. Valid and existing address in this wallet. If there is only one addresses
 *                               in the transfer area, that address with be used and changeAddress is not required
 */
Wallet.prototype.sendTransaction = function (params) {
    let method = 'sendTransaction';
    return this._body(method, params);
}

/**
 * @method createDelayedTransaction
 * @description See sendTransaction method for details
 */
Wallet.prototype.createDelayedTransaction = function (params) {
    let method = 'createDelayedTransaction';
    return this._body(method, params);
}

/**
 * @method sendDelayedTransaction
 * @description sends a delayed transaction
 * @param {string} transactionHash Required. Valid, exisiting delayed transaction.
 */
Wallet.prototype.sendDelayedTransaction = function (transactionHash) {
    let method = 'sendDelayedTransactionHash';
    let params = {transactionHash: transactionHash};
    return this._body(method, params);
}

/**
 * @method getDelayedTransactionHashes
 * @description gets delayed transaction hashes
 */
Wallet.prototype.getDelayedTransactionHashes = function () {
    let method = 'getDelayedTransactionHashes';
    return this._body(method);
}

/**
 * @method deleteDelayedTransaction
 * @description deletes a valid delayed transaction
 * @param {string} transactionHash Required. Valid, delayed transaction hash.
 */
Wallet.prototype.deleteDelayedTransactionHash = function (transactionHash) {
    let method = 'deleteDelayedTransactionHash';
    return this._body(method, params);
}

/**
 * @method sendFusionTransaction
 * @description sends a transaction from multiple addresses
 * @param {unit64} threshold Required. Only values less than threshold will be included
 * @param {unit64} anonymity Required. Privacy level for the transaction.
 * @param {array} addresses Not Required. Array of addresses to take funds from.
 * @param {string} destinationAddress Not required. An address where funds will be sent to.
 */
Wallet.prototype.sendFusionTransaction = function (params) {
    let method = 'sendFusionTransaction';
    return this._body(method, params);
}

/**
 * @method estimateFusion
 * @description counts number of unspent outouts of addresses and returns estimate of optimization
 *             Used to determine if a fusion transaction can be created.
 * @param {uint64} threshold Required. Maximal value below which outputs will be optimized.
 * @param {addresses} addresses Not required. Array of addresses to take funds from.
 */
Wallet.prototype.estimateFusion = function (param) {
    let method = 'estimateFusion';
    return this._body(method, param)
}

module.exports = Wallet;
