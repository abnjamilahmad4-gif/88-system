const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08rules')
        .setDescription('قوانين سيرفر 08'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📜 قوانين سيرفر 08 📜')
            .setDescription('يرجى الالتزام بالقوانين التالية لتجنب العقوبات:')
            .setColor('#FFD700')
            .addFields(
                { name: '1️⃣ الاحترام المتبادل', value: 'يمنع الشتم والسب بأي شكل من الأشكال.' },
                { name: '2️⃣ الإعلانات', value: 'يمنع نشر روابط سيرفرات أخرى أو إعلانات بدون إذن.' },
                { name: '3️⃣ المحتوى اللائق', value: 'يمنع نشر أي محتوى غير لائق أو مخالف لشروط ديسكورد.' },
                { name: '4️⃣ التذاكر', value: 'استخدم التذاكر عند الحاجة للإدارة فقط ولا تفتح تذاكر وهمية.' }
            )
            .setFooter({ text: 'إدارة سيرفر 08' });

        await interaction.reply({ embeds: [embed] });
    },
};
