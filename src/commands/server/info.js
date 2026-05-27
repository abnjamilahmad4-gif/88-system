const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('يعرض معلومات عن سيرفر 08'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🌟 معلومات سيرفر 08 🌟')
            .setDescription('مرحباً بك في سيرفر 08! هنا تجد أفضل مجتمع وأكثر الفعاليات متعة.')
            .setColor('#FFD700')
            .addFields(
                { name: '👑 المالك', value: `<@${interaction.guild.ownerId}>`, inline: true },
                { name: '👥 عدد الأعضاء', value: `${interaction.guild.memberCount}`, inline: true },
                { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'سيرفر 08', iconURL: interaction.guild.iconURL() });

        await interaction.reply({ embeds: [embed] });
    },
};

