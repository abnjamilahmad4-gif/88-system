const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('إدارة الرتب التلقائية في السيرفر (Join, Boost, Verify, Level).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة رتبة تلقائية جديدة')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('الحدث الذي سيقوم بإعطاء الرتبة')
                        .setRequired(true)
                        .addChoices(
                            { name: 'عند الانضمام (Join)', value: 'join' },
                            { name: 'عند دعم السيرفر (Boost)', value: 'boost' },
                            { name: 'عند التوثيق (Verify)', value: 'verify' },
                            { name: 'عند الوصول لمستوى (Level)', value: 'level' }
                        ))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('الرتبة المراد إعطاؤها')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة رتبة تلقائية')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('الحدث المرتبط بالرتبة')
                        .setRequired(true)
                        .addChoices(
                            { name: 'عند الانضمام (Join)', value: 'join' },
                            { name: 'عند دعم السيرفر (Boost)', value: 'boost' },
                            { name: 'عند التوثيق (Verify)', value: 'verify' },
                            { name: 'عند الوصول لمستوى (Level)', value: 'level' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض قائمة الرتب التلقائية الحالية')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        // سيتم إضافة المنطق الخاص بقاعدة البيانات هنا لاحقاً
        
        if (subcommand === 'add') {
            const trigger = interaction.options.getString('trigger');
            const role = interaction.options.getRole('role');
            await interaction.reply({ content: `✅ تم إضافة الرتبة ${role} لحدث **${trigger}** بنجاح.`, ephemeral: true });
        } else if (subcommand === 'remove') {
            const trigger = interaction.options.getString('trigger');
            await interaction.reply({ content: `✅ تم إزالة الرتبة التلقائية المرتبطة بحدث **${trigger}**.`, ephemeral: true });
        } else if (subcommand === 'list') {
            const embed = new EmbedBuilder()
                .setTitle('📋 قائمة الرتب التلقائية')
                .setColor('#0099ff')
                .setDescription('لا توجد رتب مضافة حالياً.');
            await interaction.reply({ embeds: [embed] });
        }
    },
};
