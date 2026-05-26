const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('إحصائيات دقيقة لعدد الأعضاء بالسيرفر'),
    async execute(interaction) {
        const { guild } = interaction;
        const total = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = total - bots;

        const embed = new EmbedBuilder()
            .setTitle('👥 إحصائيات أعضاء السيرفر')
            .setColor('#2b2d31')
            .addFields(
                { name: '📊 العدد الكلي', value: `${total}`, inline: true },
                { name: '👤 الأعضاء البشر', value: `${humans}`, inline: true },
                { name: '🤖 البوتات', value: `${bots}`, inline: true }
            )
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
