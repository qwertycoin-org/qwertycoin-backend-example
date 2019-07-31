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
