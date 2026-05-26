const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08status')
        .setDescription('حالة السيرفر وإحصائياته'),
    async execute(interaction) {
        const guild = interaction.guild;
        const onlineCount = guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'dnd' || m.presence?.status === 'idle').size;
        
        const embed = new EmbedBuilder()
            .setTitle('📊 حالة سيرفر 08 📊')
            .setColor('#FFD700')
            .addFields(
                { name: '🟢 المتصلين', value: `${onlineCount} عضو`, inline: true },
                { name: '📝 إجمالي الأعضاء', value: `${guild.memberCount} عضو`, inline: true },
                { name: '🚀 البوستات', value: `${guild.premiumSubscriptionCount || 0} بوست`, inline: true },
                { name: '💬 الرومات', value: `${guild.channels.cache.size} روم`, inline: true },
                { name: '🎭 الرتب', value: `${guild.roles.cache.size} رتبة`, inline: true }
            )
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'إحصائيات سيرفر 08' });

        await interaction.reply({ embeds: [embed] });
    },
};
