const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const XP = require('../../models/XP');
const Streak = require('../../models/Streak');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('عرض البروفايل المتكامل والبطاقة الشخصية للعضو')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('العضو المراد عرض البروفايل الخاص به')
                .setRequired(false)
        )
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        
        // جلب تفاصيل المستخدم للحصول على البانر
        await target.fetch().catch(() => {});
        const bannerUrl = target.bannerURL({ dynamic: true, size: 1024 });

        // جلب بيانات العضو في السيرفر
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ لا يمكن العثور على هذا العضو في السيرفر.', ephemeral: true });
        }

        // جلب بيانات المستويات والترتيب
        const xpData = await XP.findOne({ guildId: interaction.guild.id, userId: target.id }) || {
            level: 0,
            xp: 0,
            messages: 0,
            voiceMinutes: 0
        };

        const allUsers = await XP.find({ guildId: interaction.guild.id }).sort({ level: -1, xp: -1 });
        const userRank = allUsers.length > 0 ? allUsers.findIndex(u => u.userId === target.id) + 1 : 0;
        const rankText = userRank > 0 ? `#${userRank}` : 'غير مصنف';

        const multiplier = config.xp?.levelUpMultiplier || 100;
        const nextLevelXp = (xpData.level + 1) * multiplier;

        // جلب بيانات الستريك
        const streakData = await Streak.findOne({ guildId: interaction.guild.id, userId: target.id }) || {
            currentStreak: 0,
            maxStreak: 0,
            totalPhotos: 0
        };

        // شريط تقدم المستويات
        const progress = nextLevelXp > 0 ? Math.min(20, Math.floor((xpData.xp / nextLevelXp) * 20)) : 0;
        const progressBar = '█'.repeat(progress) + '░'.repeat(20 - progress);
        const percentage = nextLevelXp > 0 ? Math.floor((xpData.xp / nextLevelXp) * 100) : 0;

        const embed = new EmbedBuilder()
            .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setTitle(`👤 الملف الشخصي المتكامل | Profile`)
            .setColor(config.colors?.primary || '#FFD700')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🔥 الستريك الحالي', value: `**${streakData.currentStreak}** يوم`, inline: true },
                { name: '⭐ أعلى ستريك', value: `**${streakData.maxStreak}** يوم`, inline: true },
                { name: '📸 الصور المنشورة', value: `**${streakData.totalPhotos}** صورة`, inline: true },
                { name: '🏆 الترتيب', value: `**${rankText}**`, inline: true },
                { name: '📊 المستوى (Level)', value: `**${xpData.level}**`, inline: true },
                { name: '✨ نقاط الخبرة (XP)', value: `**${xpData.xp}** / ${nextLevelXp}`, inline: true },
                { name: '💬 عدد الرسائل', value: `**${xpData.messages}** رسالة`, inline: true },
                { name: '🎤 دقائق الصوت', value: `**${xpData.voiceMinutes}** دقيقة`, inline: true },
                { name: '📅 انضم للسيرفر', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '📅 إنشاء الحساب', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📈 شريط تقدم المستوى', value: `\`${progressBar}\` **${percentage}%**`, inline: false }
            )
            .setFooter({ text: `سيرفر 08 | طلب بواسطة: ${interaction.user.username}`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        if (bannerUrl) {
            embed.setImage(bannerUrl);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
