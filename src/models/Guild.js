const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '!' },
    admin_roles: { type: [String], default: [] },
    mod_roles: { type: [String], default: [] },
    helper_roles: { type: [String], default: [] },
    muted_roles: { type: [String], default: [] },
    log_channel: { type: String, default: null },
    streak_channel: { type: String, default: null },
    ticket_channel: { type: String, default: null },
    t_orders_channel: { type: String, default: null },
    report_category: { type: String, default: null },
    verify_channel: { type: String, default: null },
    welcome_channel: { type: String, default: null },
    level_channel: { type: String, default: null },
    isSetup: { type: Boolean, default: false }
});

module.exports = model('Guild', guildSchema);
