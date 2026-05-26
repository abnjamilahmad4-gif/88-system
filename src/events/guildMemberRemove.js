const { Events, EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const { COLORS } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member, client) {
        try {
            const settings = await Guild.findOne({ guildId: member.guild.id });
            if (!settings || !settings.isSetup) return;

            // تسجيل خروج العضو في الـ Log
            if (settings.log_channel) {
                const logChannel = member.guild.channels.cache.get(settings.log_channel);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`${config.emojis?.error || '❌'} خروج عضو`)
                        .setDescription(`غادر **${member.user.tag}** السيرفر.`)
                        .setColor('#FF4444')
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { name: 'الآيدي', value: member.id, inline: true },
                            { name: 'تاريخ الانضمام', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'غير معروف', inline: true }
                        )
                        .setFooter({ text: `العدد الحالي: ${member.guild.memberCount}` })
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        } catch (error) {
            console.error('خطأ في حدث خروج العضو:', error);
        }
    },
};
