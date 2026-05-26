const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08partners')
        .setDescription('قائمة شركاء سيرفر 08'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🤝 شركاء سيرفر 08 🤝')
            .setDescription('نحن فخورون بشراكاتنا مع هذه السيرفرات المميزة:')
            .setColor('#FFD700')
            .addFields(
                { name: 'سيرفر الشريك 1', value: 'وصف مختصر عن السيرفر الشريك ورابط الدعوة' },
                { name: 'سيرفر الشريك 2', value: 'وصف مختصر عن السيرفر الشريك ورابط الدعوة' }
            )
            .setFooter({ text: 'للشراكة يرجى فتح تذكرة' });

        await interaction.reply({ embeds: [embed] });
    },
};
