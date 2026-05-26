const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Guild = require('../../models/Guild');
const Report = require('../../models/Report');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-close')
        .setDescription('إغلاق البلاغ الحالي وحفظ السجل كملف نصي'),

    async execute(interaction) {
        const report = await Report.findOne({ channelId: interaction.channel.id });
        if (!report) {
            return interaction.reply({ content: '❌ هذا الأمر يمكن استخدامه داخل قناة بلاغ فقط.', ephemeral: true });
        }

        await interaction.reply({ content: '🔒 جاري إغلاق البلاغ وتجهيز السجل...' });

        // Fetch messages for transcript
        let messages = [];
        let lastId;
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;
            const fetched = await interaction.channel.messages.fetch(options);
            messages.push(...fetched.values());
            if (fetched.size !== 100) break;
            lastId = fetched.last().id;
        }

        messages.reverse(); // Order from oldest to newest

        let transcriptText = `سجل بلاغ (Report Transcript)\n`;
        transcriptText += `القناة: ${interaction.channel.name}\n`;
        transcriptText += `التاريخ: ${new Date().toLocaleString()}\n\n`;
        transcriptText += `الرسائل:\n`;
        transcriptText += `--------------------------------------------------\n`;

        messages.forEach(msg => {
            const time = new Date(msg.createdTimestamp).toLocaleString();
            transcriptText += `[${time}] ${msg.author.tag}: ${msg.content}\n`;
            if (msg.attachments.size > 0) {
                transcriptText += `[مرفقات: ${msg.attachments.map(a => a.url).join(', ')}]\n`;
            }
        });

        const attachment = new AttachmentBuilder(Buffer.from(transcriptText, 'utf-8'), { name: `transcript-${interaction.channel.name}.txt` });

        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (guildData && guildData.log_channel) {
            const logChannel = interaction.guild.channels.cache.get(guildData.log_channel);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🔒 تم إغلاق بلاغ')
                    .addFields(
                        { name: 'القناة', value: interaction.channel.name, inline: true },
                        { name: 'بواسطة', value: `${interaction.user}`, inline: true }
                    )
                    .setColor('Red')
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            }
        }

        await Report.deleteOne({ channelId: interaction.channel.id });
        
        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 3000);
    }
};
