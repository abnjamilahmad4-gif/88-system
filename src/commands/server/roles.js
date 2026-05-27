const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('قائمة رتب سيرفر 08'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎭 رتب سيرفر 08 🎭')
            .setDescription('تعرف على الرتب الأساسية في سيرفر 08:')
            .setColor('#FFD700')
            .addFields(
                { name: '👑 الإدارة العليا', value: 'المسؤولون عن إدارة السيرفر بشكل كامل.' },
                { name: '🛡️ المشرفين', value: 'للحفاظ على النظام وتطبيق القوانين.' },
                { name: '✨ المتميزين', value: 'أعضاء نشطين ومساهمين في السيرفر.' },
                { name: '✅ الموثقين', value: 'الأعضاء الذين قاموا بتوثيق حساباتهم.' }
            )
            .setFooter({ text: 'سيرفر 08' });

        await interaction.reply({ embeds: [embed] });
    },
};

