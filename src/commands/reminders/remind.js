const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Reminder = require('../../models/Reminder');
const ms = require('ms');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('نظام التذكير الشخصي أو للقنوات.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('إنشاء تذكير جديد')
                .addStringOption(option =>
                    option.setName('time')
                        .setDescription('الوقت (مثال: 10m, 1h, 2d)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('رسالة التذكير')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة التي سيتم إرسال التذكير إليها (اختياري)')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض التذكيرات النشطة الخاصة بك'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cancel')
                .setDescription('إلغاء تذكير نشط')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('معرف التذكير')
                        .setRequired(true))),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            const timeStr = interaction.options.getString('time');
            const message = interaction.options.getString('message');
            const channel = interaction.options.getChannel('channel') || interaction.channel;
            
            const duration = ms(timeStr);
            if (!duration || duration < 10000 || duration > 30 * 24 * 60 * 60 * 1000) {
                return interaction.reply({ 
                    content: '❌ الوقت غير صالح. استخدم صيغة مثل: `10m`, `1h`, `2d` (الحد الأقصى 30 يوم)', 
                    ephemeral: true 
                });
            }

            const triggerAt = new Date(Date.now() + duration);

            const reminder = new Reminder({
                reminderId: `${interaction.user.id}-${Date.now()}`,
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                channelId: channel.id,
                message: message,
                triggerAt: triggerAt,
            });
            await reminder.save();

            // تشغيل المؤقت
            setTimeout(async () => {
                try {
                    const targetChannel = client.channels.cache.get(channel.id);
                    if (targetChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle(`${config.emojis?.bell || '🔔'} تذكير!`)
                            .setDescription(message)
                            .setColor(config.colors?.primary || '#FFD700')
                            .setTimestamp();
                        
                        await targetChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
                    }
                    await Reminder.deleteOne({ reminderId: reminder.reminderId });
                } catch (err) {
                    console.error('خطأ في التذكير:', err);
                }
            }, duration);

            await interaction.reply({ 
                content: `✅ تم إعداد التذكير بنجاح! سيتم تنبيهك في ${channel} <t:${Math.floor(triggerAt.getTime() / 1000)}:R>\n${config.emojis?.text || '💬'} الرسالة: "${message}"`, 
                ephemeral: true 
            });

        } else if (subcommand === 'list') {
            const reminders = await Reminder.find({ userId: interaction.user.id, guildId: interaction.guild.id });

            if (!reminders.length) {
                return interaction.reply({ content: '❌ لا توجد تذكيرات نشطة.', ephemeral: true });
            }

            const description = reminders.map((r, i) => 
                `**${i + 1}.** \`${r.reminderId.split('-').pop()}\` — ${r.message}\n⏰ <t:${Math.floor(r.triggerAt.getTime() / 1000)}:R> في <#${r.channelId}>`
            ).join('\n\n');

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.bell || '🔔'} تذكيراتك النشطة`)
                .setColor(config.colors?.primary || '#FFD700')
                .setDescription(description)
                .setFooter({ text: `${reminders.length} تذكير نشط` });

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'cancel') {
            const id = interaction.options.getString('id');
            const deleted = await Reminder.findOneAndDelete({ 
                userId: interaction.user.id, 
                reminderId: { $regex: id } 
            });

            if (!deleted) {
                return interaction.reply({ content: '❌ لم يتم العثور على تذكير بهذا المعرف.', ephemeral: true });
            }

            await interaction.reply({ content: `✅ تم إلغاء التذكير بنجاح.`, ephemeral: true });
        }
    },
};
