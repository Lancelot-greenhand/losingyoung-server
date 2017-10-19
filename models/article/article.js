var mongoose = require('../../db/db.js')

var ArticleSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    brief_intro: {
        type: String
    },
    href: {
        type: String
    },
    text: {
        type: String
    },
    category: {
        type: String
    },
    tags: {
        type: String
    },
    author: {
        type: String
    },
    created_date: {
        type: Date
    }
})
var ArticleModel = mongoose.model('article', ArticleSchema)
module.exports = ArticleModel