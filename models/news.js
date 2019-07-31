const mongoose = require('mongoose');
const NewsSchema = mongoose.Schema({
    countryCode: {
        type: String,
        required: true
    },
    headline: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    subline: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    }
})
const News = module.exports = mongoose.model('News', NewsSchema, 'news');

module.exports.addNews = function (newNewsObj, callback) {
    newNewsObj.save(callback);
}

module.exports.getNews = function (countryCode, callback) {
    const query = {countryCode: countryCode.countryCode}
    News.find(query, callback);
}
