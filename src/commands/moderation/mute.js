const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isMod } = require('../../utils/permissions');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('إعطاء ميوت لعضو (رتبة الميوت + تايم أوت).')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('العضو المراد إعطائه الميوت')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('المدة بالدقائق')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('سبب الميوت')
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
            return interaction.reply({ content: '❌ لا يمكنك إعطاء ميوت لهذا العضو.', ephemeral: true });
        }

        try {
            // إضافة التايم أوت
            await targetMember.timeout(durationMs, `بواسطة ${interaction.user.tag}: ${reason}`);

            // إضافة رتبة الميوت إن وجدت في الإعدادات
            if (guildData && guildData.muted_roles && guildData.muted_roles.length > 0) {
                for (const roleId of guildData.muted_roles) {
                    const muteRole = interaction.guild.roles.cache.get(roleId);
                    if (muteRole && targetMember.manageable) {
                        await targetMember.roles.add(muteRole).catch(() => {});
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('تم الميوت 🔇')
                .setDescription(`تم إعطاء ميوت للعضو **${targetUser.tag}** لمدة ${durationMinutes} دقيقة.`)
                .addFields({ name: 'السبب', value: reason });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء محاولة إعطاء العضو ميوت.', ephemeral: true });
        }
    }
};

