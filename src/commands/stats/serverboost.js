const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverboost')
        .setDescription('عرض معلومات الدعم (البوست) الخاص بالسيرفر'),
    async execute(interaction) {
        const { guild } = interaction;
        
        const embed = new EmbedBuilder()
            .setTitle('🚀 معلومات البوست (Boosts)')
            .setColor('#f47fff') // لون البوست الوردي المميز
            .addFields(
                { name: '⭐ المستوى الحالي (Tier)', value: `المستوى ${guild.premiumTier}`, inline: true },
                { name: '💎 عدد البوستات', value: `${guild.premiumSubscriptionCount || 0} بوست`, inline: true }
            )
            .setThumbnail('https://i.imgur.com/vHq4R72.png') // أيقونة بوست للديسكورد (اختياري)
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
