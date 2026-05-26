const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voicexp')
        .setDescription('تفعيل أو إيقاف حصول الأعضاء على XP في القنوات الصوتية')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('تفعيل (True) أو إيقاف (False)')
                .setRequired(true)),
    async execute(interaction) {
        const isEnabled = interaction.options.getBoolean('enabled');
        
        const embed = new EmbedBuilder()
            .setColor(isEnabled ? '#00FF00' : '#FF0000')
            .setDescription(`✅ | تم ${isEnabled ? '**تفعيل**' : '**إيقاف**'} ميزة الحصول على نقاط XP أثناء التواجد في القنوات الصوتية.`)
            .setFooter({ text: 'سيرفر 08' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
