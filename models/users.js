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

const mongoose = require('mongoose');
const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: false
    },
    addressBook: [{
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    }],
    balance: {
        availableBal: {
            type: Number,
            required: false
        },
        lockedBal: {
            type: Number,
            required: false
        }
    }
})
const User = module.exports = mongoose.model('User', UserSchema, 'users');

module.exports.getUsers = function (callback) {
    User.find(callback);
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByEmail = function (email, callback) {
    const query = {email: email}
    User.findOne(query, callback);
}

module.exports.addUser = function (newUserObj, callback) {
    bcrypt.genSalt(10, function (err, salt) {    //check bcrypt js document
        bcrypt.hash(newUserObj.password, salt, function (err, hash) {
            if (err) throw err;
            newUserObj.password = hash;
            newUserObj.save(callback);
        });
    });
}

module.exports.comparePassword = function (userpassword, hash, callback) {
    bcrypt.compare(userpassword, hash, function (err, res) {
        if (err) throw err;
        callback(null, res);
    });
}

module.exports.addNewContact = function (id, newContact) {
    User.findByIdAndUpdate(
        id,
        {'$push': {addressBook: {name: newContact.name, address: newContact.address}}},
        function (err, contact) {
            if (err) {
                console.log(err);
            }
        }
    );
}

module.exports.removeContact = function (userId, contactId,) {
    User.findByIdAndUpdate(
        userId,
        {'$pull': {addressBook: {"_id": contactId}}},
        function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Contact: ", contactId, " removed");
            }
        });

}
