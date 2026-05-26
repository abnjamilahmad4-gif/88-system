const { Events, EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const { COLORS } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        try {
            const settings = await Guild.findOne({ guildId: member.guild.id });
            if (!settings || !settings.isSetup) return;

            // 1. إرسال رسالة الترحيب (Welcome Message)
            if (settings.welcome_channel) {
                const welcomeChannel = member.guild.channels.cache.get(settings.welcome_channel);
                if (welcomeChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`${config.emojis?.star || '⭐'} عضو جديد!`)
                        .setDescription(`أهلاً وسهلاً بك ${member} في سيرفر **88**!\nنحن سعداء بانضمامك إلينا. ${config.emojis?.gift || '🎁'}`)
                        .setColor(COLORS.GOLD)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ text: `أنت العضو رقم ${member.guild.memberCount}` })
                        .setTimestamp();
                    
                    await welcomeChannel.send({ content: `${member}`, embeds: [embed] }).catch(() => {});
                }
            }

            // 2. تسجيل الدخول في الـ Log
            if (settings.log_channel) {
                const logChannel = member.guild.channels.cache.get(settings.log_channel);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`${config.emojis?.members || '👥'} دخول عضو`)
                        .setDescription(`انضم **${member.user.tag}** إلى السيرفر.`)
                        .setColor(COLORS.GOLD)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { name: 'الآيدي', value: member.id, inline: true },
                            { name: 'تاريخ إنشاء الحساب', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        } catch (error) {
            console.error('خطأ في حدث دخول العضو:', error);
        }
    },
};
