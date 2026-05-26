const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08top')
        .setDescription('عرض أفضل الأعضاء تفاعلاً في سيرفر 08'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏆 أفضل الأعضاء تفاعلاً 🏆')
            .setDescription('قائمة التوب في سيرفر 08 هذا الأسبوع:')
            .setColor('#FFD700')
            .addFields(
                { name: '🥇 المركز الأول', value: 'عضو 1 (أكثر من 1000 رسالة)' },
                { name: '🥈 المركز الثاني', value: 'عضو 2 (أكثر من 800 رسالة)' },
                { name: '🥉 المركز الثالث', value: 'عضو 3 (أكثر من 500 رسالة)' }
            )
            .setFooter({ text: 'تحديث أسبوعي' });

        await interaction.reply({ embeds: [embed] });
    },
};
