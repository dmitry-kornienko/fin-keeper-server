const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bill: {
        type: Number,
        default: 5,
    },
    supliers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Suplier" }],
        default: [],
    },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = {
    UserModel,
};
