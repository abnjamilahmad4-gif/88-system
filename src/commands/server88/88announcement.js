const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88announcement')
        .setDescription('إرسال إعلان مميز يمنشن everyone (للإداريين فقط)')
        .addStringOption(opt => opt.setName('title').setDescription('عنوان الإعلان').setRequired(true))
        .addStringOption(opt => opt.setName('content').setDescription('محتوى الإعلان').setRequired(true))
        .addChannelOption(opt => opt.setName('channel').setDescription('روم الإعلان').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');
        const channel = interaction.options.getChannel('channel');

        const embed = new EmbedBuilder()
            .setTitle(`📢 ${title} 📢`)
            .setDescription(content)
            .setColor('#FFD700')
            .setFooter({ text: 'إدارة سيرفر 88' })
            .setTimestamp();

        try {
            await channel.send({ content: '@everyone', embeds: [embed] });
            await interaction.reply({ content: `تم إرسال الإعلان بنجاح في <#${channel.id}>`, ephemeral: true });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'لم أتمكن من إرسال الإعلان، تأكد من صلاحياتي في الروم المختار.', ephemeral: true });
        }
    },
};
