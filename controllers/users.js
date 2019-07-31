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

const express = require('express');
const router = express.Router();
const User = require('../models/users');
const EoF = require('../models/eof');
const Contact = require('../models/contact');
const News = require('../models/news');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const qwcWallet = require('./wallet.js');
const qwcExplorer = require('./explorer.js');
const qwcElections = require('./election.js');

const wallet = new qwcWallet();
const explorer = new qwcExplorer();
const election = new qwcElections();

router.get('/', function (req, res) {
    res.send('ok');
});

router.post('/register', (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        res.json({success: false, msg: 'Please provide email and password'});
        return;
    }
    wallet.createAddress().then(addr => {
        let newUser = new User({
            email: req.body.email,
            password: req.body.password,
            address: addr.address,
            addressBook: [
                {
                    name: "DevTeam",
                    address: "QWC1hmDTmXtgoYGBbKWvFVTimpK3qYJWJgiQLxo7bVxpAHMzp8DFSWaBVSkLmCcEFXXeRtJqg8dpGbvyRxpjqJ2u9kN716FEaY"
                }
            ],
            balance: {
                availableBal: 0,
                lockedBal: 0
            }
        });

        User.addUser(newUser, (err, user) => {
            if (err) {
                res.json({success: false, msg: 'Failed to register'});
            } else {
                res.json({success: true, msg: 'User Registered'});
            }
        });
    });
});

router.post('/addAddress', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    //const { name, address } = req.body;

    const id = req.user.id;

    let newContact = new Contact({
        name: req.body.name,
        address: req.body.address
    })

    console.log(Date.now(), newContact, id);

    User.addNewContact(id, newContact, (err) => {
        if (err) {
            res.json({success: false, msg: 'Failed to add Contact'});
        } else {
            res.json({success: true, msg: 'Contact added to address book'});
        }
    });
});

router.post('/removeContact', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const userId = req.user.id;
    const contactId = req.body.cId;
    console.log(Date.now() + " Remove Contact with ID: ", contactId);
    User.removeContact(userId, contactId, (err) => {
        if (err) {
            res.json({success: false, msg: 'Failed to remove Contact'});
        } else {
            res.json({success: true, msg: 'Contact removed from address book'});
        }
    });
});

router.post('/authenticate', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'User not found'});
        }

        User.comparePassword(password, user.password, (err, res2) => {
            if (err) throw err;
            if (res2) {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800 // 30 minutes
                });
                console.log(Date.now() + " User: ", user.id, "successfully logged in");
                return res.json({
                    success: true,
                    token: 'jwt ' + token,
                    user: {
                        id: user.id,
                        email: user.email,
                        address: user.address
                    }
                });
            } else {
                return res.json({success: false, msg: 'Wrong Password'});
            }
        });
    });
});

router.get('/address', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.send({address: req.user.address});
});

router.get('/getMnemonic', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    wallet.getMnemonicSeed(req.user.address).then(seed => res.json(seed));
});

router.get('/addressBook', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.send({addressBook: req.user.addressBook});
});

router.get('/balance', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    wallet.getBalance(req.user.address).then(b => res.json(b));
});

router.get('/spendKeys', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    wallet.getSpendKeys(req.user.address).then(sK => res.json(sK));
});

router.post('/send', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {address, amount, fee} = req.body;
    if (fee <= 100000000) {
        let params = {
            'anonymity': 5,
            'fee': fee,
            'unlockTime': 0,
            'addresses': [req.user.address],
            'transfers': [
                {
                    'amount': amount * 100000000,
                    'address': address
                }
            ],
            'changeAddress': req.user.address
        }
        wallet.sendTransaction(params).then(tr => res.json(tr));
    } else {
        let params = {
            'anonymity': 2,
            'fee': 100000000,
            'unlockTime': 0,
            'addresses': [req.user.address],
            'transfers': [
                {
                    'amount': amount * 100000000,
                    'address': address
                },
                {
                    'amount': fee - 1 * 100000000,
                    'address': "QWC1Nsegh9NRyaSH7A1hch59VpvsjjwZwGRFvEUXFbs9QMj145gXJQDbdcR5r6rTQPX6hPy1ij5SCTr2SFkrnuNBAH1Gh2EshP"
                }
            ],
            'changeAddress': req.user.address
        }
        wallet.sendTransaction(params).then(tr => res.json(tr));
    }
});

router.post('/transactions', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {blockCount, firstBlockIndex} = req.body;
    let params = {
        'addresses': [req.user.address],
        'blockCount': -1,
        'firstBlockIndex': 1
    }
    wallet.getTransactions(params).then(tr => res.json(tr));
});

router.get('/getTxByCount', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    let params = {
        'addresses': [req.user.address],
        'blockCount': -1,
        'firstBlockIndex': 1
    }

    wallet.getTransactionHashes(params).then(txHashes => res.json(txHashes));
});

router.post('/getTransaction', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let txHash = req.body;
    wallet.getTransaction(txHash.txHash).then(tx => res.json(tx));
});

router.post('/txHashes', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {blockCount, firstBlockIndex} = req.body;
    let params = {
        'addresses': [req.user.address],
        'blockCount': blockCount,
        'firstBlockIndex': firstBlockIndex - blockCount
    }
    wallet.getTransactionHashes(params).then(tr => res.json(tr));
});

router.get('/status', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    wallet.getStatus().then(st => res.json(st));
});

router.post('/addEoF', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let newEoF = new EoF({
        userId: req.user.id,
        status: "pending",
        timestamp: Date.now(),
        type: req.body.type,
        title: req.body.title,
        message: req.body.message
    });

    EoF.addEoF(newEoF, (err, eof) => {
        if (err) {
            res.json({success: false, msg: 'Failed to send EoF'});
        } else {
            res.json({success: true, msg: 'EoF send'});
        }
    });
});

router.get('/getEoF', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let userID = req.user.id;

    EoF.getEoFs(userID, (err, geof) => {
        if (err) {
            res.json({success: false, msg: 'Cant get EoFs'});
        } else {
            res.send(geof);
        }
    });
});

router.post('/getEoFByUserId', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let userId = req.body.userId;
    EoF.getEoFs(userId, (err, geof) => {
        if (err) {
            res.json({success: false, msg: 'Cant get EoFs'});
        } else {
            res.json(geof);
        }
    });
});

router.post('/addNews', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    let newNews = new News({
        countryCode: req.body.news['countryCode'],
        headline: req.body.news['headline'],
        timestamp: Date.now(),
        subline: req.body.news['subline'],
        content: req.body.news['content']
    });
    News.addNews(newNews, (err, news) => {
        console.log(newNews);
        if (err) {
            res.json({success: false, msg: 'Failed to send News'});
        } else {
            res.json({success: true, msg: 'News sended'});
        }
    });
});

router.post('/getNews', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let countryCode = req.body;

    News.getNews(countryCode, (err, geNews) => {
        if (err) {
            res.json({success: false, msg: 'Cant get News'});
        } else {
            res.send(geNews);
        }
    });
});

router.get('/getAllUser', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let email = req.user.email;

    User.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'You shall not pass!'});
        } else if (user.admin != true) {
            console.log(user.admin);
            return res.json({success: false, msg: 'Go away, theres no place for you'});
        } else {
            User.getUsers((err, geus) => {
                if (err) {
                    res.json({success: false, msg: geus});
                } else {
                    res.json(geus);
                }
            });
        }
    });

});

router.get('/getAllAddresses', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let email = req.user.email;

    User.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'You shall not pass!'});
        } else if (user.admin != true) {
            return res.json({success: false, msg: 'Go away, theres no place for you'});
        } else {
            wallet.getAddresses().then(addr => res.json(addr));
        }
    });
});

router.post('/AdmingetBalance', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let address = req.body.address;
    let email = req.user.email;

    User.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'You shall not pass!'});
        } else if (user.admin != true) {
            return res.json({success: false, msg: 'Go away, theres no place for you'});
        } else {
            wallet.getBalance(address).then(b => res.json(b));
        }
    });
});

router.get('/AdminGetEoFs', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let email = req.user.email;

    User.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'You shall not pass!'});
        } else if (user.admin != true) {
            return res.json({success: false, msg: 'Go away, theres no place for you'});
        } else {
            EoF.getAllEoFs((err, geAEoFs) => {
                if (err) {
                    res.json({success: false, msg: geAEoFs});
                } else {
                    res.json(geAEoFs);
                }
            });
        }
    });
});

router.post('/addEoFReply', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const id = req.body.id;

    let newEoFReply = new EoFReply({
        subject: req.body.subject,
        message: req.body.message
    })

    EoF.addEoFReply(id, newEoFReply, (err) => {
        if (err) {
            res.json({success: false, msg: 'Failed to add EoF Reply'});
        } else {
            res.json({success: true, msg: 'Reply added to EoF: ' + id});
        }
    });
});

router.post('/removeEoF', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const eofId = req.boy.eofId;
    EoF.removeEoF(eofId, (err) => {
        if (err) {
            res.json({success: false, msg: 'Failed to remove EoF'});
        } else {
            res.json({success: true, msg: 'EoF with ID ' + eofId + ' successfully removed'});
        }
    });
});

router.post('/removeEoFreply', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const eofId = req.body.eofId;
    const eofReplyId = req.body.eofReplyId;
    EoF.removeEoFreply(eofId, eofReplyId, (err) => {
        if (err) {
            res.json({success: false, msg: 'Failed to remove EoF Reply'});
        } else {
            res.json({success: true, msg: 'EoF Reply removed from EoF: ' + eofId});
        }
    });
});

// Explorer Stuff

router.post('/ExplorerGetBlocks', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {height} = req.body;
    let params = {
        'height': height
    }
    explorer.getBlocks(params).then(getBlocks => res.json(getBlocks));
});

router.post('/ExplorerGetBlock', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {hash} = req.body;
    let params = {
        'hash': hash
    }
    explorer.getBlock(params).then(getBlock => res.json(getBlock));
});

router.post('/ExplorerTxByHash', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {hash} = req.body;
    let params = {
        'hash': hash
    }
    explorer.getTransaction(params).then(getTx => res.json(getTx));
});

router.get('/ExplorerGetTxPool', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    explorer.getTransactionPool().then(getTxPool => res.json(getTxPool));
});

router.get('/ExplorerGetBlockCount', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    explorer.getBlockCount().then(getBlockCount => res.json(getBlockCount));
});

router.post('/ExplorerGetBlockHash', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {height} = req.body;
    let params = {
        'height': height
    }
    explorer.getBlockHash(params).then(getBlockHash => res.json(getBlockHash));
});

router.get('/ExplorerGetLastBlockHeader', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    explorer.getLastBlockheader().then(getLastBlockheader => res.json(getLastBlockheader));
});

router.post('/ExplorerGetBlockHeaderByHash', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {hash} = req.body;
    let params = {
        'hash': hash
    }
    explorer.getBlockHeaderByHash(params).then(getBlockHeaderByHash => res.json(getBlockHeaderByHash));
});

router.post('/ExplorerGetBlockHeaderByHeight', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {height} = req.body;
    let params = {
        'height': height
    }
    explorer.getBlockHeaderByHeight().then(getBlockHeaderByHeight => res.json(getBlockHeaderByHeight));
});

router.get('/ExplorerGetCurrencyId', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    explorer.getCurrencyId().then(getCurrencyId => res.json(getCurrencyId));
});

router.get('/ExplorerGetInfo', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    explorer.getInfo().then(getInfo => res.json(getInfo));
});

router.get('/ExplorerGetTransactions', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    explorer.getTransactions().then(getTransactions => res.json(getTransactions));
});

// Voting stuff

router.get('/Elections', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    election.getElections().then(getElections => res.json(getElections));
});

module.exports = router;
