const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const Guild = require('../../models/Guild');
const Report = require('../../models/Report');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('نظام البلاغات')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('الإبلاغ عن عضو')
                .addUserOption(option => option.setName('target').setDescription('العضو المراد الإبلاغ عنه').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('سبب الإبلاغ').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('الإبلاغ عن رسالة')
                .addStringOption(option => option.setName('message_link').setDescription('رابط الرسالة').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('سبب الإبلاغ').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bug')
                .setDescription('الإبلاغ عن خطأ في السيرفر أو البوت')
                .addStringOption(option => option.setName('description').setDescription('وصف الخطأ').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });

        if (!guildData) return interaction.reply({ content: '❌ لم يتم إعداد السيرفر.', ephemeral: true });

        let reportCategory = guildData.report_category;
        
        const channelName = `بلاغ-${interaction.user.username}`;
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

        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: reportCategory || null,
            permissionOverwrites: permissionOverwrites
        });

        let targetUser = null;
        let messageLink = null;
        let reason = '';
        let type = sub;

        if (sub === 'user') {
            targetUser = interaction.options.getUser('target');
            reason = interaction.options.getString('reason');
        } else if (sub === 'message') {
            messageLink = interaction.options.getString('message_link');
            reason = interaction.options.getString('reason');
        } else if (sub === 'bug') {
            reason = interaction.options.getString('description');
        }

        const newReport = new Report({
            reportId: channel.id,
            guildId: interaction.guild.id,
            channelId: channel.id,
            reporterId: interaction.user.id,
            reportedUserId: targetUser ? targetUser.id : 'N/A',
            messageId: messageLink ? messageLink : 'N/A',
            reason: reason,
            type: type
        });
        await newReport.save();

        const embed = new EmbedBuilder()
            .setTitle(`🚨 بلاغ جديد: ${type}`)
            .addFields(
                { name: 'المُبلغ', value: `${interaction.user}`, inline: true },
                { name: 'النوع', value: type === 'user' ? 'عضو' : type === 'message' ? 'رسالة' : 'خطأ', inline: true },
                { name: 'السبب/الوصف', value: reason }
            )
            .setColor('Red');

        if (targetUser) embed.addFields({ name: 'المُبلغ عنه', value: `${targetUser}`, inline: true });
        if (messageLink) embed.addFields({ name: 'رابط الرسالة', value: messageLink });

        let mentions = '';
        if (guildData.admin_roles && guildData.admin_roles.length > 0) mentions += guildData.admin_roles.map(id => `<@&${id}> `).join('');
        if (guildData.mod_roles && guildData.mod_roles.length > 0) mentions += guildData.mod_roles.map(id => `<@&${id}> `).join('');

        await channel.send({ content: `${interaction.user} ${mentions}`, embeds: [embed] });
        await interaction.reply({ content: `✅ تم إنشاء البلاغ بنجاح في ${channel}`, ephemeral: true });
    }
};
