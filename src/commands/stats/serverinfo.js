const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('عرض معلومات وتفاصيل السيرفر'),
    async execute(interaction) {
        const { guild } = interaction;
        
        const embed = new EmbedBuilder()
            .setTitle(`معلومات السيرفر: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .setColor('#2b2d31')
            .addFields(
                { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 تاريخ الإنشاء', value: `<t:${parseInt(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 عدد الأعضاء', value: `${guild.memberCount}`, inline: true },
                { name: '🛡️ الرتب', value: `${guild.roles.cache.size}`, inline: true },
                { name: '📁 القنوات', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🚀 مستوى البوست', value: `المستوى ${guild.premiumTier}`, inline: true }
            )
            .setImage(guild.bannerURL({ size: 1024 }))
            .setFooter({ text: `ايدي السيرفر: ${guild.id}` })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
