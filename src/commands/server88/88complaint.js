const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88complaint')
        .setDescription('تقديم شكوى سريعة (يفتح تذكرة)'),
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

        // إضافة صلاحيات رتب الإدارة والمشرفين والمساعدين كطاقم دعم
        if (guildData.admin_roles && guildData.admin_roles.length > 0) {
            guildData.admin_roles.forEach(id => {
                permissionOverwrites.push({
                    id: id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                });
            });
        }
        if (guildData.mod_roles && guildData.mod_roles.length > 0) {
            guildData.mod_roles.forEach(id => {
                permissionOverwrites.push({
                    id: id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                });
            });
        }
        if (guildData.helper_roles && guildData.helper_roles.length > 0) {
            guildData.helper_roles.forEach(id => {
                permissionOverwrites.push({
                    id: id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                });
            });
        }

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `complaint-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: permissionOverwrites,
            });

            // بناء المنشنز للرتب
            let mentions = '';
            if (guildData.helper_roles && guildData.helper_roles.length > 0) {
                mentions += guildData.helper_roles.map(id => `<@&${id}> `).join('');
            } else if (guildData.mod_roles && guildData.mod_roles.length > 0) {
                mentions += guildData.mod_roles.map(id => `<@&${id}> `).join('');
            } else if (guildData.admin_roles && guildData.admin_roles.length > 0) {
                mentions += guildData.admin_roles.map(id => `<@&${id}> `).join('');
            }

            const embed = new EmbedBuilder()
                .setTitle('🚨 تذكرة شكوى 🚨')
                .setDescription(`مرحباً <@${interaction.user.id}>،\nيرجى طرح شكواك بالتفصيل هنا وسيقوم فريق الدعم بالرد عليك في أقرب وقت.\n\nمنشن الدعم: ${mentions || '@الدعم'}`)
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
