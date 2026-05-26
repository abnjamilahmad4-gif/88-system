const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelup')
        .setDescription('تخصيص رسالة الترقية عند الوصول لمستوى جديد (للإدارة فقط)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('الرسالة الجديدة (استخدم {user} لمنشن العضو و {level} للمستوى)')
                .setRequired(true)),
    async execute(interaction) {
        const msg = interaction.options.getString('message');
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('تحديث إعدادات المستويات')
            .setDescription(`✅ | تم تعيين رسالة الترقية بنجاح إلى:\n\n\`${msg}\``)
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
