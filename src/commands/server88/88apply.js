const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88apply')
        .setDescription('تقديم طلب للإدارة (يفتح تذكرة)'),
    async execute(interaction) {
        // Config: قم بتغيير هذه الأي ديهات إلى الخاصة بسيرفرك
        const reportCategoryId = 'REPORT_CATEGORY_ID';
        const adminRoleId = 'ADMIN_ROLE_ID';

        const category = interaction.guild.channels.cache.get(reportCategoryId);

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `apply-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: category || null,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: adminRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle('📝 طلب تقديم للإدارة 📝')
                .setDescription(`مرحباً <@${interaction.user.id}>،\nلقد قمت بفتح تذكرة تقديم للإدارة. يرجى كتابة تفاصيل طلبك هنا.\n\nمنشن الإدارة: <@&${adminRoleId}>`)
                .setColor('#FFD700')
                .setFooter({ text: 'سيرفر 88' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_apply_ticket')
                        .setLabel('إغلاق التذكرة')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await ticketChannel.send({ content: `<@&${adminRoleId}> | <@${interaction.user.id}>`, embeds: [embed], components: [row] });

            const replyEmbed = new EmbedBuilder()
                .setTitle('✅ تم إنشاء طلبك')
                .setDescription(`تم فتح تذكرة تقديم بنجاح: <#${ticketChannel.id}>`)
                .setColor('#FFD700');

            await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'حدث خطأ أثناء محاولة فتح التذكرة. تأكد من إعدادات السيرفر.', ephemeral: true });
        }
    },
};
