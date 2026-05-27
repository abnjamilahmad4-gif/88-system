const { Schema, model } = require('mongoose');

const partnerSchema = new Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    inviteUrl: { type: String, default: '' },
    order: { type: Number, default: 0 }
});

module.exports = model('Partner', partnerSchema);
