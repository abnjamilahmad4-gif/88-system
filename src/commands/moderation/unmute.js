const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isMod } = require('../../utils/permissions');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('إزالة الميوت والتايم أوت عن عضو.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('العضو المراد فك الميوت عنه')
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
        const reason = interaction.options.getString('reason') || 'لا يوجد سبب محدد';

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return interaction.reply({ content: '❌ لم يتم العثور على العضو في السيرفر.', ephemeral: true });
        }

        try {
            // إزالة التايم أوت
            if (targetMember.isCommunicationDisabled()) {
                await targetMember.timeout(null, `بواسطة ${interaction.user.tag}: ${reason}`);
            }

            // إزالة رتبة الميوت إن وجدت في الإعدادات
            if (guildData && guildData.muted_roles && guildData.muted_roles.length > 0) {
                for (const roleId of guildData.muted_roles) {
                    const muteRole = interaction.guild.roles.cache.get(roleId);
                    if (muteRole && targetMember.manageable) {
                        await targetMember.roles.remove(muteRole).catch(() => {});
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('تم فك الميوت 🔊')
                .setDescription(`تم إزالة الميوت عن العضو **${targetUser.tag}**.`)
                .addFields({ name: 'السبب', value: reason });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء محاولة فك الميوت عن العضو.', ephemeral: true });
        }
    }
};

