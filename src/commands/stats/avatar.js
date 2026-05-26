const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('عرض صورة حساب العضو')
        .addUserOption(option => option.setName('user').setDescription('العضو المراد عرض صورته').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });
        
        const embed = new EmbedBuilder()
            .setTitle(`صورة حساب: ${user.username}`)
            .setURL(avatarUrl)
            .setImage(avatarUrl)
            .setColor('#2b2d31')
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
