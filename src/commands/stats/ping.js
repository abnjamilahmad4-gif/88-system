const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('عرض سرعة استجابة البوت (Ping)'),
    async execute(interaction) {
        const sent = await interaction.deferReply({ fetchReply: true });
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 بونق!')
            .setColor('#2b2d31')
            .addFields(
                { name: '🤖 سرعة استجابة البوت', value: `${ping}ms`, inline: true },
                { name: '🌐 سرعة اتصال الـ API', value: `${interaction.client.ws.ping}ms`, inline: true }
            )
            .setFooter({ text: 'سيرفر 08' })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};
