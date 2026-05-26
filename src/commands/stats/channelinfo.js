const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription('عرض معلومات القناة')
        .addChannelOption(option => option.setName('channel').setDescription('القناة المراد عرض معلوماتها').setRequired(false)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        
        // تحويل نوع القناة إلى نص مقروء
        const typeMap = {
            [ChannelType.GuildText]: 'نصية',
            [ChannelType.GuildVoice]: 'صوتية',
            [ChannelType.GuildCategory]: 'قسم (Category)',
            [ChannelType.GuildAnnouncement]: 'إعلانات',
            [ChannelType.GuildStageVoice]: 'منصة (Stage)',
            [ChannelType.GuildForum]: 'منتدى (Forum)'
        };
        const channelType = typeMap[channel.type] || 'أخرى';

        const embed = new EmbedBuilder()
            .setTitle(`معلومات القناة: ${channel.name}`)
            .setColor('#2b2d31')
            .addFields(
                { name: '🆔 الايدي', value: channel.id, inline: true },
                { name: 'نوع القناة', value: channelType, inline: true },
                { name: '📅 تاريخ الإنشاء', value: `<t:${parseInt(channel.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📁 القسم التابعة له', value: channel.parent ? channel.parent.name : 'لا يوجد', inline: true }
            )
            .setFooter({ text: 'سيرفر 08' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
