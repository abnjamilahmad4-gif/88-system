const { Schema, model } = require('mongoose');

const hallOfFameSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
});

module.exports = model('HallOfFame', hallOfFameSchema);
