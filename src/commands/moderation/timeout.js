const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isMod } = require('../../utils/permissions');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('إعطاء تايم أوت لعضو.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('العضو المراد إعطائه التايم أوت')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('المدة بالدقائق')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('السبب')
                .setRequired(false)),
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const settings = guildData;

        if (!isMod(interaction.member, settings) && !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ لا تملك صلاحية لاستخدام هذا الأمر.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const durationMinutes = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'لا يوجد سبب محدد';
        const durationMs = durationMinutes * 60 * 1000;

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return interaction.reply({ content: '❌ لم يتم العثور على العضو في السيرفر.', ephemeral: true });
        }

        if (targetMember.id === interaction.guild.ownerId || targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ لا يمكنك إعطاء تايم أوت لهذا العضو.', ephemeral: true });
        }

        try {
            await targetMember.timeout(durationMs, `بواسطة ${interaction.user.tag}: ${reason}`);

            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('تم التايم أوت ⏱️')
                .setDescription(`تم إعطاء تايم أوت للعضو **${targetUser.tag}** لمدة ${durationMinutes} دقيقة.`)
                .addFields({ name: 'السبب', value: reason });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء محاولة تنفيذ التايم أوت.', ephemeral: true });
        }
    }
};

