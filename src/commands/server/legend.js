const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Legend = require('../../models/Legend');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('legend')
        .setDescription('قائمة أساطير السيرفر')
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('عرض قائمة أساطير السيرفر')
        )
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('إضافة عضو لقائمة الأساطير (للإدارة)')
                .addUserOption(opt => opt.setName('user').setDescription('العضو المراد إضافته').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('سبب الإضافة').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('إزالة عضو من قائمة الأساطير (للإدارة)')
                .addUserOption(opt => opt.setName('user').setDescription('العضو المراد إزالته').setRequired(true))
        )
        .setDMPermission(false),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            // تحديث أو إنشاء الأساطير الافتراضية تلقائياً لضمان دقة البيانات والبيو المطلوب
            const defaultLegends = [
                {
                    userId: '571240430637809674', // abdull / anas
                    reason: 'انا المطور الاساسي بالسيرفر.',
                    order: 1
                },
                {
                    userId: '1375427370806284390', // zeno
                    reason: 'مطور البوت والأنظمة البرمجية بالسيرفر.',
                    order: 2
                }
            ];

            for (const def of defaultLegends) {
                await Legend.findOneAndUpdate(
                    { guildId: interaction.guild.id, userId: def.userId },
                    { 
                        guildId: interaction.guild.id,
                        userId: def.userId,
                        reason: def.reason,
                        order: def.order
                    },
                    { upsert: true, new: true }
                );
            }

            const legends = await Legend.find({ guildId: interaction.guild.id }).sort({ order: 1 });

            const embed = new EmbedBuilder()
                .setTitle('🌟 أساطير السيرفر | Legends 🌟')
                .setDescription('الأعضاء الأسطوريين الذين تركوا بصمة لا تُنسى في السيرفر:')
                .setColor(config.colors?.primary || '#FFD700')
                .setTimestamp();

            for (let i = 0; i < legends.length; i++) {
                const leg = legends[i];
                const userObj = await interaction.client.users.fetch(leg.userId).catch(() => null);
                
                const userName = userObj ? userObj.username : `مستخدم غير معروف (${leg.userId})`;
                const avatarUrl = userObj ? userObj.displayAvatarURL({ dynamic: true, size: 128 }) : null;
                const avatarLink = avatarUrl ? ` • [صورة الحساب](${avatarUrl})` : '';

                embed.addFields({
                    name: `👑 الأسطورة ${i + 1}: ${userName}`,
                    value: `• **العضو:** <@${leg.userId}>\n• **السبب:** ${leg.reason}${avatarLink}`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

        } else {
            // التحقق من الصلاحيات للإضافة والحذف
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ هذا الأمر مخصص لمدراء السيرفر فقط.', ephemeral: true });
            }

            if (subcommand === 'add') {
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason');

                // التحقق من عدم تكراره
                const existing = await Legend.findOne({ guildId: interaction.guild.id, userId: user.id });
                if (existing) {
                    return interaction.reply({ content: `❌ هذا العضو مضاف بالفعل في قائمة الأساطير.`, ephemeral: true });
                }

                const count = await Legend.countDocuments({ guildId: interaction.guild.id });
                const newLegend = new Legend({
                    guildId: interaction.guild.id,
                    userId: user.id,
                    reason: reason,
                    order: count + 1
                });
                await newLegend.save();

                await interaction.reply({ content: `✅ تم إضافة <@${user.id}> إلى قائمة أساطير السيرفر بنجاح!` });

            } else if (subcommand === 'remove') {
                const user = interaction.options.getUser('user');

                const result = await Legend.findOneAndDelete({ guildId: interaction.guild.id, userId: user.id });
                if (!result) {
                    return interaction.reply({ content: `❌ هذا العضو ليس في قائمة الأساطير.`, ephemeral: true });
                }

                await interaction.reply({ content: `✅ تم إزالة <@${user.id}> من قائمة الأساطير بنجاح.` });
            }
        }
    }
};
