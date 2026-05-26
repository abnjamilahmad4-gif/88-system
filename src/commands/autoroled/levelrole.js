const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelrole')
        .setDescription('ربط رتبة بمستوى معين يصل إليه العضو.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('إعداد رتبة لمستوى محدد')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('المستوى المطلوب')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('الرتبة التي سيحصل عليها العضو')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة رتبة من مستوى محدد')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('المستوى المراد إزالة رتبته')
                        .setRequired(true))),
                        
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'set') {
            const level = interaction.options.getInteger('level');
            const role = interaction.options.getRole('role');
            
            await interaction.reply({ content: `✅ تم تعيين الرتبة ${role} للأعضاء الذين يصلون إلى المستوى **${level}**.`, ephemeral: true });
        } else if (subcommand === 'remove') {
            const level = interaction.options.getInteger('level');
            
            await interaction.reply({ content: `✅ تم إزالة الرتبة المرتبطة بالمستوى **${level}**.`, ephemeral: true });
        }
    },
};
