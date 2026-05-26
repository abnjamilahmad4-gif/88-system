const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88boosters')
        .setDescription('قائمة الداعمين (الداعمين للسيرفر)'),
    async execute(interaction) {
        const boosters = interaction.guild.members.cache.filter(m => m.premiumSince);
        const boosterList = boosters.size > 0 ? boosters.map(m => `<@${m.id}> - منذ <t:${Math.floor(m.premiumSinceTimestamp / 1000)}:R>`).join('\n') : 'لا يوجد داعمين حالياً 😢';

        const embed = new EmbedBuilder()
            .setTitle('🚀 داعمين سيرفر 88 🚀')
            .setDescription(`شكراً لكل من دعم السيرفر بالبوستات!\n\n${boosterList}`)
            .setColor('#FFD700')
            .setFooter({ text: `إجمالي البوستات: ${interaction.guild.premiumSubscriptionCount || 0}` });

        await interaction.reply({ embeds: [embed] });
    },
};
