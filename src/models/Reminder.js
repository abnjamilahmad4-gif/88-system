const { Schema, model } = require('mongoose');

const reminderSchema = new Schema({
    reminderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    message: { type: String, required: true },
    triggerAt: { type: Date, required: true }
});

module.exports = model('Reminder', reminderSchema);
