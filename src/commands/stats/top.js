const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('عرض أعلى الأعضاء تفاعلاً في السيرفر')
        .addSubcommand(subcommand =>
            subcommand
                .setName('messages')
                .setDescription('أعلى الأعضاء في الرسائل النصية'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('voice')
                .setDescription('أعلى الأعضاء في التفاعل الصوتي'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('invites')
                .setDescription('أعلى الأعضاء في الدعوات')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder().setColor('#2b2d31').setFooter({ text: 'سيرفر 88' }).setTimestamp();

        if (subcommand === 'messages') {
            embed.setTitle('💬 أعلى الأعضاء في الرسائل');
            embed.setDescription('**1.** <@123456789012345678> - 5000 رسالة\n**2.** <@234567890123456789> - 3200 رسالة\n**3.** <@345678901234567890> - 1500 رسالة\n\n*(البيانات تجريبية ستُربط بقاعدة البيانات لاحقاً)*');
        } else if (subcommand === 'voice') {
            embed.setTitle('🎙️ أعلى الأعضاء في التفاعل الصوتي');
            embed.setDescription('**1.** <@123456789012345678> - 50 ساعة\n**2.** <@234567890123456789> - 30 ساعة\n**3.** <@345678901234567890> - 15 ساعة\n\n*(البيانات تجريبية ستُربط بقاعدة البيانات لاحقاً)*');
        } else if (subcommand === 'invites') {
            embed.setTitle('✉️ أعلى الأعضاء في الدعوات');
            embed.setDescription('**1.** <@123456789012345678> - 150 دعوة\n**2.** <@234567890123456789> - 90 دعوة\n**3.** <@345678901234567890> - 45 دعوة\n\n*(البيانات تجريبية ستُربط بقاعدة البيانات لاحقاً)*');
        }

        await interaction.reply({ embeds: [embed] });
    }
};
