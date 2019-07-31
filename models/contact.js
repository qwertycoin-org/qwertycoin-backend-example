const mongoose = require('mongoose');
const ContactSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
})
const Contact = module.exports = mongoose.model('Contact', ContactSchema);
