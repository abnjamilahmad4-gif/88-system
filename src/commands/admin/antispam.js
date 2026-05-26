const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antispam')
        .setDescription('إعدادات نظام الحماية من السبام (الرسائل المزعجة)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('level')
                .setDescription('تغيير مستوى حماية السبام (1 إلى 5)')
                .addIntegerOption(option => 
                    option.setName('value')
                    .setDescription('اختر المستوى (1: ضعيف، 5: صارم)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(5)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('action')
                .setDescription('تحديد الإجراء المتخذ عند اكتشاف سبام')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('اختر الإجراء')
                    .setRequired(true)
                    .addChoices(
                        { name: 'تحذير (Warn)', value: 'warn' },
                        { name: 'إسكات (Mute)', value: 'mute' },
                        { name: 'طرد (Kick)', value: 'kick' }
                    )
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder().setColor('Orange');

        if (subcommand === 'level') {
            const level = interaction.options.getInteger('value');
            // Update database logic here
            embed.setTitle('تم تحديث مستوى الحماية 🛡️')
                 .setDescription(`تم تغيير مستوى حماية السبام إلى: **${level}**`);
        } else if (subcommand === 'action') {
            const action = interaction.options.getString('type');
            // Update database logic here
            embed.setTitle('تم تحديث الإجراء ⚙️')
                 .setDescription(`تم تغيير الإجراء المتخذ عند اكتشاف سبام إلى: **${action}**`);
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
