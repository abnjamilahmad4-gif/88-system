const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88roles')
        .setDescription('قائمة رتب سيرفر 88'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎭 رتب سيرفر 88 🎭')
            .setDescription('تعرف على الرتب الأساسية في سيرفر 88:')
            .setColor('#FFD700')
            .addFields(
                { name: '👑 الإدارة العليا', value: 'المسؤولون عن إدارة السيرفر بشكل كامل.' },
                { name: '🛡️ المشرفين', value: 'للحفاظ على النظام وتطبيق القوانين.' },
                { name: '✨ المتميزين', value: 'أعضاء نشطين ومساهمين في السيرفر.' },
                { name: '✅ الموثقين', value: 'الأعضاء الذين قاموا بتوثيق حساباتهم.' }
            )
            .setFooter({ text: 'سيرفر 88' });

        await interaction.reply({ embeds: [embed] });
    },
};
