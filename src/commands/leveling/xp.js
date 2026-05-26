const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const XP = require('../../models/XP');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('إدارة نقاط الخبرة للأعضاء (للإدارة فقط)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة XP لعضو')
                .addUserOption(option => option.setName('user').setDescription('العضو').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('كمية النقاط').setRequired(true).setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('خصم XP من عضو')
                .addUserOption(option => option.setName('user').setDescription('العضو').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('كمية النقاط').setRequired(true).setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('تصفير XP لعضو')
                .addUserOption(option => option.setName('user').setDescription('العضو').setRequired(true))),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const subcommand = interaction.options.getSubcommand();

        let userXP = await XP.findOne({ guildId: interaction.guild.id, userId: target.id });
        if (!userXP) {
            userXP = new XP({ guildId: interaction.guild.id, userId: target.id, xp: 0, level: 0, messages: 0, voiceMinutes: 0 });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors?.primary || '#FFD700')
            .setTimestamp()
            .setFooter({ text: 'سيرفر 08 — نظام الإدارة' });

        if (subcommand === 'add') {
            const amount = interaction.options.getInteger('amount');
            userXP.xp += amount;

            // التحقق من ترقية المستوى
            const multiplier = config.xp?.levelUpMultiplier || 100;
            let nextLevelXp = (userXP.level + 1) * multiplier;
            while (userXP.xp >= nextLevelXp) {
                userXP.xp -= nextLevelXp;
                userXP.level += 1;
                nextLevelXp = (userXP.level + 1) * multiplier;
            }

            await userXP.save();
            embed.setDescription(`✅ تم إضافة **${amount} XP** للعضو ${target}\nالمستوى الحالي: **${userXP.level}** | XP: **${userXP.xp}**`);
        } else if (subcommand === 'remove') {
            const amount = interaction.options.getInteger('amount');
            userXP.xp = Math.max(0, userXP.xp - amount);
            await userXP.save();
            embed.setDescription(`✅ تم خصم **${amount} XP** من العضو ${target}\nالمستوى الحالي: **${userXP.level}** | XP: **${userXP.xp}**`);
        } else if (subcommand === 'reset') {
            userXP.xp = 0;
            userXP.level = 0;
            userXP.messages = 0;
            userXP.voiceMinutes = 0;
            await userXP.save();
            embed.setDescription(`🔄 تم تصفير جميع بيانات العضو ${target} بنجاح.`);
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
