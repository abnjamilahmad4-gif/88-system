const { Schema, model } = require('mongoose');

const reportSchema = new Schema({
    reportId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    reporterId: { type: String, required: true },
    reportedUserId: { type: String, required: true },
    messageId: { type: String, default: null },
    reason: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'pending' },
    claimerId: { type: String, default: null }
});

module.exports = model('Report', reportSchema);
