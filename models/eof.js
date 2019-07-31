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
const ErrorOrFeatureSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    replies: [{
        subject: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        }
    }]
})
const EoFReplySchema = mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})
const EoF = module.exports = mongoose.model('EoF', ErrorOrFeatureSchema, 'eof');
const EoFReply = module.exports = mongoose.model('EoFReply', EoFReplySchema);

/*
{
    userid: "5b3fb07dcf464b136c6bc532",
    status: "denied",       // done, pending, denied, in processing
    title: "need more qwerty",
    message: "poor guy, more coins blah blah",
    replies: [
        {
            0: "blah",
            1: "wow, so much blaah"
        }
    ]
}
*/

module.exports.addEoF = function (newEoFObj, callback) {
    newEoFObj.save(callback);
}

module.exports.getEoFs = function (userId, callback) {
    const query = {userId: userId}
    EoF.find(query, callback);
}

module.exports.getAllEoFs = function (callback) {
    EoF.find(callback);
}

module.exports.addEoFReply = function (id, newEoFReply) {
    EoF.findByIdAndUpdate(
        id,
        {'$push': {replies: {subject: newEoFReply.subject, message: newEoFReply.message}}},
        function (err, newReply) {
            if (err) {
                console.log(err);
            }
        }
    );
}

module.exports.removeEoF = function (eofId,) {

    EoF.findByIdAndUpdate(
        eofId,
        {'$pull': {"_id": eofId}},
        function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("EoF: ", eofId, " removed");
            }
        }
    );
}

module.exports.removeEoFreply = function (eofId, eofReplyId) {

    EoF.findByIdAndUpdate(
        eofId,
        {'$pull': {replies: {"_id": eofReplyId}}},
        function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("EoF Reply: ", eofReplyId, " removed");
            }
        }
    )
};
