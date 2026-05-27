const { Schema, model } = require('mongoose');

const streakSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    lastStreakDate: { type: Date, default: null },
    totalPhotos: { type: Number, default: 0 },
    todayPhotos: { type: Number, default: 0 }
});

module.exports = model('Streak', streakSchema);
