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
            const totalPhotos = streakData?.totalPhotos || 0;
            const lastDate = streakData?.lastStreakDate ? `<t:${Math.floor(streakData.lastStreakDate.getTime() / 1000)}:R>` : 'لم يسجل بعد';

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.streak || '🔥'} ستريك ${targetUser.username}`)
                .setColor(config.colors?.primary || '#FFD700')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '🔥 الستريك الحالي', value: `**${currentStreak}** يوم`, inline: true },
                    { name: '⭐ أعلى ستريك', value: `**${maxStreak}** يوم`, inline: true },
                    { name: '📸 إجمالي الصور المرسلة', value: `**${totalPhotos}** صورة`, inline: true },
                    { name: '📅 آخر تسجيل', value: lastDate, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'check') {
            // الحصول على منتصف الليل بتوقيت مكة (Riyadh - UTC+3)
            const getRiyadhMidnight = (date = new Date()) => {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Riyadh',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                });
                const parts = formatter.formatToParts(date);
                const dateObj = {};
                parts.forEach(p => dateObj[p.type] = p.value);
                
                const riyadhMidnight = new Date(Date.UTC(dateObj.year, dateObj.month - 1, dateObj.day, 0, 0, 0));
                const utcTime = riyadhMidnight.getTime() - (3 * 60 * 60 * 1000);
                return new Date(utcTime);
            };

            const todayRiyadh = getRiyadhMidnight(new Date());

            const activeToday = await Streak.find({
                guildId: interaction.guild.id,
                lastStreakDate: { $gte: todayRiyadh }
            });

            const totalPhotosToday = activeToday.reduce((sum, s) => sum + (s.todayPhotos || 0), 0);

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.chart || '📈'} نشاط اليوم في الستريك`)
                .setColor(config.colors?.primary || '#FFD700')
                .setDescription(
                    activeToday.length > 0
                        ? activeToday.map((s, i) => `**${i + 1}.** <@${s.userId}> — ${config.emojis?.streak || '🔥'} ${s.currentStreak} يوم (📸 **${s.todayPhotos || 0}** صور اليوم)`).join('\n')
                        : 'لا أحد سجل ستريك اليوم بعد!'
                )
                .setFooter({ text: `👥 الأعضاء النشطين: ${activeToday.length} | 📸 صور اليوم: ${totalPhotosToday}` })
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
                description += `${medal} <@${s.userId}> — ${config.emojis?.streak || '🔥'} **${s.currentStreak}** يوم (أعلى: ${s.maxStreak} | 📸 ${s.totalPhotos || 0} صورة)\n`;
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
                { currentStreak: 0, todayPhotos: 0 },
                { upsert: true }
            );
            await interaction.reply({ content: `🔄 تم تصفير الستريك وصور اليوم الخاصة بـ ${targetUser} بنجاح.` });
        }
    },
};
