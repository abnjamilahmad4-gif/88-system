const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antiraid')
        .setDescription('إعدادات حماية السيرفر من الريد (Anti-Raid)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('تفعيل أو إيقاف نظام الحماية من الريد')
                .addBooleanOption(option => option.setName('state').setDescription('اختر تفعيل (True) أو إيقاف (False)').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('action')
                .setDescription('تحديد الإجراء عند اكتشاف هجوم ريد')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('اختر الإجراء')
                    .setRequired(true)
                    .addChoices(
                        { name: 'طرد (Kick)', value: 'kick' },
                        { name: 'حظر (Ban)', value: 'ban' },
                        { name: 'إسكات (Mute)', value: 'mute' }
                    )
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder().setColor('Blue');

        if (subcommand === 'toggle') {
            const state = interaction.options.getBoolean('state');
            // Update database logic here
            embed.setTitle(state ? 'تم تفعيل الحماية 🛡️' : 'تم إيقاف الحماية ⚠️')
                 .setDescription(state ? 'تم تفعيل نظام الحماية من الريد بنجاح.' : 'تم إيقاف نظام الحماية من الريد. السيرفر الآن عرضة للهجمات.');
        } else if (subcommand === 'action') {
            const action = interaction.options.getString('type');
            // Update database logic here
            embed.setTitle('تم تحديث الإجراء ⚙️')
                 .setDescription(`تم تغيير الإجراء المتخذ عند اكتشاف ريد إلى: **${action}**`);
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
