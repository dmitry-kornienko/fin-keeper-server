const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tax_rate: {
        type: Number,
        default: 6
    },
    tax_from: {
        type: String,
        enum: ["value1", "value2", "value3"],
        default: "value1"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token_stat: {
        type: String,
        default: ''
    },
    reports: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
        default: []
    }
})

const SupplierModel = mongoose.model("Supplier", SupplierSchema);

module.exports = {
    SupplierModel
}