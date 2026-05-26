const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed, infoEmbed } = require('./embeds');
const Guild = require('../models/Guild');

/**
 * تسجيل إجراء في قناة السجلات (Log Channel) المحددة في إعدادات السيرفر
 * @param {import('discord.js').Guild} guild السيرفر
 * @param {import('discord.js').EmbedBuilder} embed رسالة الـ Embed
 * @returns {Promise<boolean>}
 */
const logAction = async (guild, embed) => {
    try {
        const guildData = await Guild.findOne({ guildId: guild.id });
        if (!guildData || !guildData.log_channel) return false;
        
        const channel = guild.channels.cache.get(guildData.log_channel) || 
                         await guild.channels.fetch(guildData.log_channel).catch(() => null);
        
        if (!channel || !channel.isTextBased()) return false;
        
        await channel.send({ embeds: [embed] });
        return true;
    } catch (error) {
        console.error('[Logger] خطأ في تسجيل الإجراء:', error);
        return false;
    }
};

/**
 * تسجيل حدث معين بسرعة
 * @param {import('discord.js').Guild} guild السيرفر
 * @param {string} type نوع الحدث (success, error, warning, info)
 * @param {string} description وصف الحدث
 */
const logEvent = async (guild, type, description) => {
    let embed;
    switch (type) {
        case 'success': embed = successEmbed(description); break;
        case 'error': embed = errorEmbed(description); break;
        case 'warning': embed = warningEmbed(description); break;
        case 'info': embed = infoEmbed(description); break;
        default: embed = infoEmbed(description);
    }
    
    return await logAction(guild, embed);
};

module.exports = {
    logAction,
    logEvent
};
