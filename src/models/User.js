const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String, default: null }
});

module.exports = model('User', userSchema);
