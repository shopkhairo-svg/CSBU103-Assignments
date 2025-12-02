// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho User
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Đảm bảo email là duy nhất
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;