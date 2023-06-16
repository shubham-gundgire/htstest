const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
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
    create_at: {
        type: Date,
        default: Date.now()
    }
});

const user = mongoose.model("userAuth", userSchema);

module.exports = user;