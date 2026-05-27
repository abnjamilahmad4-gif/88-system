const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const XP = require('../../models/XP');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('عرض أعلى الأعضاء تفاعلاً في السيرفر')
        .addSubcommand(subcommand =>
            subcommand
                .setName('messages')
                .setDescription('أعلى الأعضاء في الرسائل النصية'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('voice')
                .setDescription('أعلى الأعضاء في التفاعل الصوتي'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('invites')
                .setDescription('أعلى الأعضاء في الدعوات'))
        .setDMPermission(false),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder()
            .setColor(config.colors?.primary || '#FFD700')
            .setFooter({ text: 'سيرفر 08' })
            .setTimestamp();

        if (subcommand === 'messages') {
            const topList = await XP.find({ guildId: interaction.guild.id }).sort({ messages: -1 }).limit(10);
            
            embed.setTitle('💬 أعلى الأعضاء في الرسائل');
            if (topList.length > 0) {
                const desc = topList.map((user, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const prefix = medals[index] || `**${index + 1}.**`;
                    return `${prefix} <@${user.userId}> — **${user.messages || 0}** رسالة`;
                }).join('\n');
                embed.setDescription(desc);
            } else {
                embed.setDescription('❌ لا يوجد تفاعل رسائل مسجل في السيرفر حالياً.');
            }

        } else if (subcommand === 'voice') {
            const topList = await XP.find({ guildId: interaction.guild.id }).sort({ voiceMinutes: -1 }).limit(10);
            
            embed.setTitle('🎙️ أعلى الأعضاء في التفاعل الصوتي');
            if (topList.length > 0) {
                const desc = topList.map((user, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const prefix = medals[index] || `**${index + 1}.**`;
                    
                    // تحويل الدقائق إلى صيغة ساعات ودقائق
                    const totalMins = user.voiceMinutes || 0;
                    const hours = Math.floor(totalMins / 60);
                    const mins = totalMins % 60;
                    const timeStr = hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`;
                    
                    return `${prefix} <@${user.userId}> — **${timeStr}**`;
                }).join('\n');
                embed.setDescription(desc);
            } else {
                embed.setDescription('❌ لا يوجد تفاعل صوتي مسجل في السيرفر حالياً.');
            }

        } else if (subcommand === 'invites') {
            embed.setTitle('✉️ أعلى الأعضاء في الدعوات');
            await interaction.deferReply();
            
            try {
                const invites = await interaction.guild.invites.fetch().catch(() => null);
                if (invites) {
                    const inviteCounts = {};
                    invites.forEach(invite => {
                        if (invite.inviter) {
                            inviteCounts[invite.inviter.id] = (inviteCounts[invite.inviter.id] || 0) + invite.uses;
                        }
                    });
                    
                    const sortedInvites = Object.entries(inviteCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10);
                    
                    if (sortedInvites.length > 0) {
                        const desc = sortedInvites.map(([userId, count], index) => {
                            const medals = ['🥇', '🥈', '🥉'];
                            const prefix = medals[index] || `**${index + 1}.**`;
                            return `${prefix} <@${userId}> — **${count}** دعوة صالحة`;
                        }).join('\n');
                        embed.setDescription(desc);
                    } else {
                        embed.setDescription('❌ لا توجد دعوات مسجلة لها استخدامات في السيرفر.');
                    }
                } else {
                    embed.setDescription('❌ فشل جلب الدعوات. يرجى التأكد من صلاحيات البوت (Manage Server).');
                }
                await interaction.editReply({ embeds: [embed] });
            } catch (err) {
                console.error(err);
                embed.setDescription('❌ حدث خطأ أثناء جلب تفاصيل الدعوات.');
                await interaction.editReply({ embeds: [embed] });
            }
            return;
        }

        await interaction.reply({ embeds: [embed] });
    }
};
