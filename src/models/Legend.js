const { Schema, model } = require('mongoose');

const legendSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, default: '' },
    order: { type: Number, default: 0 }
});

module.exports = model('Legend', legendSchema);
