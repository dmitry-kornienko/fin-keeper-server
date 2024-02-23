const mongoose = require('mongoose');

const GoodSchema = new mongoose.Schema({
    article: {
        type: String,
        unique: true,
    },
    cost_price: {
        type: Number,
        default: 0,
    }
})

const GoodModel = mongoose.model('Good', GoodSchema);

module.exports = {
    GoodModel
}