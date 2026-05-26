const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('عرض بانر حساب العضو')
        .addUserOption(option => option.setName('user').setDescription('العضو المراد عرض البانر الخاص به').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        // جلب تفاصيل المستخدم للحصول على البانر
        await user.fetch();
        const bannerUrl = user.bannerURL({ dynamic: true, size: 1024 });
        
        if (!bannerUrl) {
            return interaction.reply({ content: '❌ | هذا العضو لا يمتلك بانر.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`بانر حساب: ${user.username}`)
            .setURL(bannerUrl)
            .setImage(bannerUrl)
            .setColor('#2b2d31')
            .setFooter({ text: 'سيرفر 08' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
