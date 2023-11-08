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
    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user",
    },
    password: {
        type: String,
        required: true,
    },
    bill: {
        type: Number,
        default: 5,
    },
    suppliers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
        default: [],
    },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = {
    UserModel,
};
