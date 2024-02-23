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
    tokenWB: {
        type: String,
        default: "",
    },
    bill: {
        type: Number,
        default: 5,
    },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = {
    UserModel,
};
