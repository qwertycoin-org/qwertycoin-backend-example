'use strict';
const https = require('https');
const request = require('request-promise-native');
const util = require('util');
const Election = function (opts) {
    opts = opts || {};
    if (!(this instanceof Election)) return new Election(opts);
    this.host = opts.host || 'voting.qwertycoin.org/api';
    this.timeout = opts.timeout || 2000;
};

Election.prototype.getElections = function () {
    return new Promise((resolve, reject) => {
        this._get().then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        });
    });
};

Election.prototype._get = function () {
    return new Promise((resolve, reject) => {
        request({
            uri: util.format('https://%s', this.host),
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

module.exports = Election;
