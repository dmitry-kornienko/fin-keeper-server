const mongoose = require('mongoose');

const GoodSchema = new mongoose.Schema({
    article: String,
    cost_price: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
})

const GoodModel = mongoose.model('Good', GoodSchema);

module.exports = {
    GoodModel
}