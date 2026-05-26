const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88appeal')
        .setDescription('طلب استئناف / طعن في عقوبة (يفتح تذكرة)'),
    async execute(interaction) {
        // Config: قم بتغيير هذا الأي دي إلى رتبة المشرفين
        const modRoleId = 'MOD_ROLE_ID';

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `appeal-${interaction.user.username}`,
                type: ChannelType.GuildText,
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
                        id: modRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle('⚖️ طلب استئناف عقوبة ⚖️')
                .setDescription(`مرحباً <@${interaction.user.id}>،\nالرجاء شرح سبب طعنك في العقوبة بوضوح، وسيقوم المشرفون بالرد عليك قريباً.\n\nمنشن المشرفين: <@&${modRoleId}>`)
                .setColor('#FFD700')
                .setFooter({ text: 'سيرفر 88' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_appeal_ticket')
                        .setLabel('إغلاق التذكرة')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await ticketChannel.send({ content: `<@&${modRoleId}> | <@${interaction.user.id}>`, embeds: [embed], components: [row] });

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
