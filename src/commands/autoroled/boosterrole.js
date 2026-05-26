const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boosterrole')
        .setDescription('إعداد رتبة مخصصة لداعمي السيرفر (Boosters).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('الرتبة التي سيحصل عليها الداعم')
                .setRequired(true)),
                
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        // يمكن حفظ التكوين في قاعدة البيانات هنا
        
        await interaction.reply({ content: `✅ تم تحديد الرتبة ${role} كـ رتبة خاصة لداعمي السيرفر.`, ephemeral: true });
    },
};
