const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('عرض مدة تشغيل البوت المستمرة'),
    async execute(interaction) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime) % 60;

        const embed = new EmbedBuilder()
            .setTitle('⏱️ مدة تشغيل البوت')
            .setDescription(`البوت يعمل بدون انقطاع منذ:\n\n**${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية**`)
            .setColor('#2b2d31')
            .setFooter({ text: 'سيرفر 88' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
