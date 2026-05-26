const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('عرض معلومات رتبة معينة')
        .addRoleOption(option => option.setName('role').setDescription('الرتبة المراد عرض معلوماتها').setRequired(true)),
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        
        const embed = new EmbedBuilder()
            .setTitle(`معلومات الرتبة: ${role.name}`)
            .setColor(role.color ? role.hexColor : '#2b2d31')
            .addFields(
                { name: '🆔 الايدي', value: role.id, inline: true },
                { name: '🎨 اللون', value: role.hexColor, inline: true },
                { name: '👥 عدد الأعضاء', value: `${role.members.size}`, inline: true },
                { name: '📅 تاريخ الإنشاء', value: `<t:${parseInt(role.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📌 منفصلة (Hoisted)', value: role.hoist ? 'نعم' : 'لا', inline: true },
                { name: '🔔 قابلة للمنشن', value: role.mentionable ? 'نعم' : 'لا', inline: true }
            )
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
