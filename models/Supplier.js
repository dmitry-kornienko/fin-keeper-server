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
        enum: ["ppvz_for_pay", "retail_amount", "var3", "var4"],
        default: "ppvz_for_pay"
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
    is_active: {
        type: Boolean,
        default: false,
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