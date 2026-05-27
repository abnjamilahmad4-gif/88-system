const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('طلب استئناف / طعن في عقوبة (يفتح تذكرة)'),
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

        // إضافة صلاحيات رتب الإدارة والمشرفين
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

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `appeal-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: permissionOverwrites,
            });

            // بناء المنشنز للرتب
            let mentions = '';
            if (guildData.mod_roles && guildData.mod_roles.length > 0) {
                mentions += guildData.mod_roles.map(id => `<@&${id}> `).join('');
            } else if (guildData.admin_roles && guildData.admin_roles.length > 0) {
                mentions += guildData.admin_roles.map(id => `<@&${id}> `).join('');
            }

            const embed = new EmbedBuilder()
                .setTitle('⚖️ طلب استئناف عقوبة ⚖️')
                .setDescription(`مرحباً <@${interaction.user.id}>،\nالرجاء شرح سبب طعنك في العقوبة بوضوح، وسيقوم المشرفون بالرد عليك قريباً.\n\nمنشن المشرفين: ${mentions || '@المشرفين'}`)
                .setColor('#FFD700')
                .setFooter({ text: 'سيرفر 08' });

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
                .setDescription(`تم فتح تذكرة استئناف بنجاح: <#${ticketChannel.id}>`)
                .setColor('#FFD700');

            await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'حدث خطأ أثناء محاولة فتح التذكرة.', ephemeral: true });
        }
    },
};

