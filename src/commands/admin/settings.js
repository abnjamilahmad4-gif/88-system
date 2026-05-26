const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('تعديل إعدادات السيرفر (اللغة، البريفكس، اللون)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('prefix')
                .setDescription('تغيير بادئة الأوامر (Prefix)')
                .addStringOption(option => option.setName('new_prefix').setDescription('البريفكس الجديد').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('language')
                .setDescription('تغيير لغة البوت')
                .addStringOption(option => 
                    option.setName('lang')
                    .setDescription('اختر اللغة')
                    .setRequired(true)
                    .addChoices(
                        { name: 'العربية', value: 'ar' }, 
                        { name: 'English', value: 'en' }
                    )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('color')
                .setDescription('تغيير اللون الأساسي لرسائل البوت (Embed Color)')
                .addStringOption(option => option.setName('hex_color').setDescription('رمز اللون (مثال: #ff0000)').setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        const embed = new EmbedBuilder()
            .setTitle('تم تحديث الإعدادات ✅')
            .setColor('Green');

        if (subcommand === 'prefix') {
            const prefix = interaction.options.getString('new_prefix');
            // Update database logic here
            embed.setDescription(`تم تغيير البريفكس بنجاح إلى: \`${prefix}\``);
        } else if (subcommand === 'language') {
            const lang = interaction.options.getString('lang');
            // Update database logic here
            embed.setDescription(`تم تغيير لغة البوت إلى: \`${lang === 'ar' ? 'العربية' : 'English'}\``);
        } else if (subcommand === 'color') {
            const color = interaction.options.getString('hex_color');
            // Update database logic here
            embed.setDescription(`تم تغيير اللون الأساسي إلى: \`${color}\``);
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
