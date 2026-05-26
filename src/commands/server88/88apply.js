const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88apply')
        .setDescription('تقديم طلب للإدارة (يفتح تذكرة)'),
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData) {
            return interaction.reply({ content: '❌ لم يتم إعداد السيرفر بعد. يرجى الطلب من الإدارة كتابة `/setup`.', ephemeral: true });
        }

        const categoryId = guildData.report_category || null;

        // تجهيز الصلاحيات
        const permissionOverwrites = [
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            }
        ];

        // إضافة صلاحيات رتب الإدارة فقط للتقديم الإداري
        if (guildData.admin_roles && guildData.admin_roles.length > 0) {
            guildData.admin_roles.forEach(id => {
                permissionOverwrites.push({
                    id: id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                });
            });
        }

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `apply-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: permissionOverwrites,
            });

            // بناء المنشنز للإدارة
            let mentions = '';
            if (guildData.admin_roles && guildData.admin_roles.length > 0) {
                mentions += guildData.admin_roles.map(id => `<@&${id}> `).join('');
            }

            const embed = new EmbedBuilder()
                .setTitle('📝 طلب تقديم للإدارة 📝')
                .setDescription(`مرحباً <@${interaction.user.id}>،\nلقد قمت بفتح تذكرة تقديم للإدارة. يرجى كتابة تفاصيل طلبك هنا.\n\nمنشن الإدارة: ${mentions || '@الإدارة'}`)
                .setColor('#FFD700')
                .setFooter({ text: 'سيرفر 88' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_action_close')
                        .setLabel('إغلاق التذكرة')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await ticketChannel.send({ content: `${mentions} | <@${interaction.user.id}>`, embeds: [embed], components: [row] });

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
