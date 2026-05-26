const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08legend')
        .setDescription('عرض قائمة أساطير سيرفر 08'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🌟 أساطير سيرفر 08 🌟')
            .setDescription('الأعضاء الذين تركوا بصمة لا تُنسى في السيرفر:')
            .setColor('#FFD700')
            .addFields(
                { name: '👑 الأسطورة 1', value: 'ساهم في بناء السيرفر وتطويره.' },
                { name: '👑 الأسطورة 2', value: 'أقدم داعم وأكثر الأعضاء تفاعلاً.' }
            )
            .setFooter({ text: 'سيرفر 08' });

        await interaction.reply({ embeds: [embed] });
    },
};
