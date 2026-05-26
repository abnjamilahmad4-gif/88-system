const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Streak = require('../../models/Streak');
const Guild = require('../../models/Guild');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('streak')
        .setDescription('نظام الستريك (Streak) اليومي.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('عرض الستريك الخاص بك أو بعضو آخر')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد عرض الستريك الخاص به')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('التحقق من الأعضاء الذين أرسلوا اليوم'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('قائمة أفضل الـ Streaks في السيرفر'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('تصفير ستريك عضو معين (للإدارة)')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد تصفير الستريك الخاص به')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const streakData = await Streak.findOne({ guildId: interaction.guild.id, userId: targetUser.id });

            const currentStreak = streakData?.currentStreak || 0;
            const maxStreak = streakData?.maxStreak || 0;
            const lastDate = streakData?.lastStreakDate ? `<t:${Math.floor(streakData.lastStreakDate.getTime() / 1000)}:R>` : 'لم يسجل بعد';

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.streak || '🔥'} ستريك ${targetUser.username}`)
                .setColor(config.colors?.primary || '#FFD700')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '🔥 الستريك الحالي', value: `**${currentStreak}** يوم`, inline: true },
                    { name: '⭐ أعلى ستريك', value: `**${maxStreak}** يوم`, inline: true },
                    { name: '📅 آخر تسجيل', value: lastDate, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'check') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const activeToday = await Streak.find({
                guildId: interaction.guild.id,
                lastStreakDate: { $gte: today }
            });

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.chart || '📈'} نشاط اليوم`)
                .setColor(config.colors?.primary || '#FFD700')
                .setDescription(
                    activeToday.length > 0
                        ? activeToday.map((s, i) => `**${i + 1}.** <@${s.userId}> — ${config.emojis?.streak || '🔥'} ${s.currentStreak} يوم`).join('\n')
                        : 'لا أحد سجل ستريك اليوم بعد!'
                )
                .setFooter({ text: `${activeToday.length} عضو نشط اليوم` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'leaderboard') {
            const topStreaks = await Streak.find({ guildId: interaction.guild.id })
                .sort({ currentStreak: -1 })
                .limit(10);

            if (!topStreaks.length) {
                return interaction.reply({ content: '❌ لا توجد بيانات ستريك بعد.', ephemeral: true });
            }

            const medals = ['🥇', '🥈', '🥉'];
            let description = '';
            for (let i = 0; i < topStreaks.length; i++) {
                const s = topStreaks[i];
                const medal = medals[i] || `**${i + 1}.**`;
                description += `${medal} <@${s.userId}> — ${config.emojis?.streak || '🔥'} **${s.currentStreak}** يوم (أعلى: ${s.maxStreak})\n`;
            }

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.trophy || '🏆'} لوحة صدارة الستريك`)
                .setColor(config.colors?.primary || '#FFD700')
                .setDescription(description)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'reset') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ لا تملك الصلاحيات الكافية.', ephemeral: true });
            }
            const targetUser = interaction.options.getUser('user');
            await Streak.findOneAndUpdate(
                { guildId: interaction.guild.id, userId: targetUser.id },
                { currentStreak: 0 },
                { upsert: true }
            );
            await interaction.reply({ content: `🔄 تم تصفير الستريك الخاص بـ ${targetUser} بنجاح.` });
        }
    },
};
