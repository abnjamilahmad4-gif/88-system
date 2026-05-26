const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('عرض معلومات وإحصائيات البوت'),
    async execute(interaction) {
        const client = interaction.client;
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 معلومات البوت')
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('#2b2d31')
            .addFields(
                { name: 'الاسم', value: client.user.username, inline: true },
                { name: 'المطور', value: 'مبرمج 88', inline: true },
                { name: '🏓 البينج', value: `${client.ws.ping}ms`, inline: true },
                { name: '🌐 السيرفرات', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 المستخدمين', value: `${client.users.cache.size}`, inline: true },
                { name: '📚 المكتبة', value: `Discord.js v14`, inline: true }
            )
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
