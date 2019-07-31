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
