const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88complaint')
        .setDescription('تقديم شكوى سريعة (يفتح تذكرة)'),
    async execute(interaction) {
        const categoryId = 'COMPLAINT_CATEGORY_ID'; // قم بتغييره للأي دي الخاص بالكاتيجوري
        const staffRoleId = 'STAFF_ROLE_ID'; // قم بتغييره للأي دي الخاص برتبة الاستاف

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `complaint-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: interaction.guild.channels.cache.get(categoryId) || null,
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
                        id: staffRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle('🚨 تذكرة شكوى 🚨')
                .setDescription(`مرحباً <@${interaction.user.id}>،\nيرجى طرح شكواك بالتفصيل هنا وسيقوم فريق الدعم بالرد عليك في أقرب وقت.\n\nمنشن الدعم: <@&${staffRoleId}>`)
                .setColor('#FFD700')
                .setFooter({ text: 'سيرفر 88' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_complaint_ticket')
                        .setLabel('إغلاق التذكرة')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await ticketChannel.send({ content: `<@&${staffRoleId}> | <@${interaction.user.id}>`, embeds: [embed], components: [row] });

            const replyEmbed = new EmbedBuilder()
                .setTitle('✅ تم تقديم الشكوى')
                .setDescription(`تم فتح تذكرة لشكواك بنجاح: <#${ticketChannel.id}>`)
                .setColor('#FFD700');

            await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'حدث خطأ أثناء محاولة فتح التذكرة.', ephemeral: true });
        }
    },
};
