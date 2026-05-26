const { Schema, model } = require('mongoose');

const xpSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    voiceMinutes: { type: Number, default: 0 },
    lastMessage: { type: Date, default: null }
});

module.exports = model('XP', xpSchema);
