const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isHelper } = require('../../utils/permissions');
const Guild = require('../../models/Guild');
const Warn = require('../../models/Warn');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('إعطاء إنذار لعضو وحفظه في قاعدة البيانات.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('العضو المراد إنذاره')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('سبب الإنذار')
                .setRequired(true)),
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const settings = guildData;

        // صلاحية المساعدة (Helper) أو أعلى تكفي للإنذار
        if (!isHelper(interaction.member, settings) && !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ لا تملك صلاحية لاستخدام هذا الأمر.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        if (targetUser.bot) {
            return interaction.reply({ content: '❌ لا يمكنك إعطاء إنذار لبوت.', ephemeral: true });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({ content: '❌ لا يمكنك إعطاء إنذار لنفسك.', ephemeral: true });
        }

        // إنشاء كود فريد للإنذار
        const warnId = Math.random().toString(36).substring(2, 9);

        try {
            const newWarn = new Warn({
                warnId: warnId,
                guildId: interaction.guild.id,
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                reason: reason
            });

            await newWarn.save();

            // إرسال رسالة للعضو في الخاص (اختياري)
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            if (targetMember) {
                const dmEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('تم إنذارك ⚠️')
                    .setDescription(`لقد تلقيت إنذاراً في سيرفر **${interaction.guild.name}**.`)
                    .addFields({ name: 'السبب', value: reason });
                await targetMember.send({ embeds: [dmEmbed] }).catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('تم الإنذار ⚠️')
                .setDescription(`تم إعطاء إنذار للعضو **${targetUser.tag}** بنجاح.`)
                .addFields(
                    { name: 'السبب', value: reason },
                    { name: 'كود الإنذار', value: `\`${warnId}\`` }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء محاولة حفظ الإنذار.', ephemeral: true });
        }
    }
};

