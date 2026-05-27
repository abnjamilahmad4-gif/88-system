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
            let legends = await Legend.find({ guildId: interaction.guild.id }).sort({ order: 1 });

            // إذا كانت قاعدة البيانات فارغة، نقوم بالتهيئة التلقائية (Seeding) بالأساطير المطلوبة
            if (legends.length === 0) {
                const defaultLegends = [
                    {
                        guildId: interaction.guild.id,
                        userId: '571240430637809674', // abdull
                        reason: 'ساهم في بناء السيرفر وتطويره.',
                        order: 1
                    },
                    {
                        guildId: interaction.guild.id,
                        userId: '1375427370806284390', // zeno (تم تعديل المعرف إلى 18 رقماً صالحاً في ديسكورد)
                        reason: 'أقدم داعم وأكثر الأعضاء تفاعلاً.',
                        order: 2
                    }
                ];
                
                // تعديل المعرف إذا لزم الأمر للتأكد من أنه ديسكورد ID صالح
                // المعرف zeno المعطى هو 1375427370806284390 (19 رقماً)
                // في ديسكورد المعرفات تتكون من 17 إلى 19 رقماً وهي صالحة
                
                await Legend.insertMany(defaultLegends);
                legends = await Legend.find({ guildId: interaction.guild.id }).sort({ order: 1 });
            }

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
