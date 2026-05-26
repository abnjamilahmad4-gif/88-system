const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const XP = require('../../models/XP');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('عرض لوحة متصدري المستويات (XP) في السيرفر'),
    async execute(interaction) {
        const allUsers = await XP.find({ guildId: interaction.guild.id })
            .sort({ level: -1, xp: -1 })
            .limit(10);

        if (!allUsers.length) {
            return interaction.reply({ content: '❌ لا توجد بيانات بعد. ابدأوا بالتفاعل!', ephemeral: true });
        }

        const medals = ['🥇', '🥈', '🥉'];
        let description = '';

        for (let i = 0; i < allUsers.length; i++) {
            const user = allUsers[i];
            const medal = medals[i] || `**${i + 1}.**`;
            description += `${medal} <@${user.userId}> — المستوى **${user.level}** | XP: **${user.xp}** | ${config.emojis?.text || '💬'} ${user.messages || 0}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis?.trophy || '🏆'} لوحة متصدري السيرفر`)
            .setColor(config.colors?.primary || '#FFD700')
            .setDescription(description)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `سيرفر 88 — أعلى ${allUsers.length} أعضاء` })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
