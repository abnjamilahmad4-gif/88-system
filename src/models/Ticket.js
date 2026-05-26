const { Schema, model } = require('mongoose');

const ticketSchema = new Schema({
    ticketId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    userId: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'open' },
    claimerId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null }
});

module.exports = model('Ticket', ticketSchema);
