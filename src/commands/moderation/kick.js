const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isMod } = require('../../utils/permissions');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('طرد عضو من السيرفر.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('العضو المراد طرده')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('سبب الطرد')
                .setRequired(false)),
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const settings = guildData;

        if (!isMod(interaction.member, settings) && !interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: '❌ لا تملك صلاحية لاستخدام هذا الأمر.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'لا يوجد سبب محدد';

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return interaction.reply({ content: '❌ لم يتم العثور على العضو في السيرفر.', ephemeral: true });
        }

        if (!targetMember.kickable) {
            return interaction.reply({ content: '❌ لا يمكنني طرد هذا العضو، قد تكون رتبته أعلى من رتبتي أو يملك صلاحيات إدارية.', ephemeral: true });
        }

        try {
            await targetMember.kick(`بواسطة ${interaction.user.tag}: ${reason}`);
            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('تم الطرد 👢')
                .setDescription(`تم طرد **${targetUser.tag}** بنجاح.`)
                .addFields({ name: 'السبب', value: reason });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء محاولة طرد العضو.', ephemeral: true });
        }
    }
};

