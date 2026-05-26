const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('عرض معلومات وتفاصيل العضو')
        .addUserOption(option => option.setName('user').setDescription('العضو المراد عرض معلوماته').setRequired(false)),
    async execute(interaction) {
        const member = interaction.options.getMember('user') || interaction.member;
        const user = member.user;
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: `معلومات العضو: ${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(member.displayHexColor !== '#000000' ? member.displayHexColor : '#2b2d31')
            .addFields(
                { name: '👤 الاسم', value: user.tag, inline: true },
                { name: '🆔 الايدي', value: user.id, inline: true },
                { name: '🤖 بوت؟', value: user.bot ? 'نعم' : 'لا', inline: true },
                { name: '📅 تاريخ الانضمام للديسكورد', value: `<t:${parseInt(user.createdTimestamp / 1000)}:f>\n(<t:${parseInt(user.createdTimestamp / 1000)}:R>)`, inline: false },
                { name: '📥 تاريخ الانضمام للسيرفر', value: `<t:${parseInt(member.joinedTimestamp / 1000)}:f>\n(<t:${parseInt(member.joinedTimestamp / 1000)}:R>)`, inline: false }
            )
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
