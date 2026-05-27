const { Events } = require('discord.js');
const Guild = require('../models/Guild');
const XP = require('../models/XP');
const Streak = require('../models/Streak');
const config = require('../config');

// ماب لتخزين عدد رسائل الأعضاء لمكافحة السبام المؤقت
const spamMap = new Map();
// ماب لكولداون الـ XP
const xpCooldown = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // تجاهل رسائل البوتات والرسائل خارج السيرفرات
        if (message.author.bot || !message.guild) return;

        // استدعاء إعدادات السيرفر
        const settings = await Guild.findOne({ guildId: message.guild.id });
        if (!settings || !settings.isSetup) return;

        // 1. نظام Anti-Spam
        const authorId = message.author.id;
        const now = Date.now();
        
        if (!spamMap.has(authorId)) {
            spamMap.set(authorId, { count: 1, timer: now });
        } else {
            const userData = spamMap.get(authorId);
            const diff = now - userData.timer;

            // التحقق خلال نافذة الوقت المحددة
            const timeWindow = config.antispam?.timeWindow || 5000;
            const maxMessages = config.antispam?.maxMessages || 5;

            if (diff < timeWindow) {
                userData.count++;
                if (userData.count >= maxMessages) {
                    await message.delete().catch(() => {});
                    const warning = await message.channel.send(`⚠️ ${message.author}، يرجى التوقف عن إرسال الرسائل المتكررة (Anti-Spam)!`);
                    setTimeout(() => warning.delete().catch(() => {}), 5000);

                    // إعطاء ميوت إذا كانت رتبة الميوت محددة
                    if (settings.muted_roles && settings.muted_roles.length > 0) {
                        for (const roleId of settings.muted_roles) {
                            const mutedRole = message.guild.roles.cache.get(roleId);
                            if (mutedRole && message.member.manageable) {
                                await message.member.roles.add(mutedRole).catch(() => {});
                            }
                        }
                        setTimeout(async () => {
                            for (const roleId of settings.muted_roles) {
                                const mutedRole = message.guild.roles.cache.get(roleId);
                                if (mutedRole) {
                                    await message.member.roles.remove(mutedRole).catch(() => {});
                                }
                            }
                        }, 60000); // ميوت لمدة دقيقة
                    }
                }
            } else {
                userData.count = 1;
                userData.timer = now;
            }
            spamMap.set(authorId, userData);
        }

        // 2. نظام الـ XP (النقاط والمستويات)
        const cooldownKey = `${message.guild.id}-${authorId}`;
        const xpCooldownTime = config.xp?.cooldown || 60000;

        if (xpCooldown.has(cooldownKey)) {
            const lastXpTime = xpCooldown.get(cooldownKey);
            if (now - lastXpTime < xpCooldownTime) return;
        }

        xpCooldown.set(cooldownKey, now);

        // إعطاء نقاط عشوائية
        const minXp = config.xp?.minPerMessage || 15;
        const maxXp = config.xp?.maxPerMessage || 25;
        const xpToAdd = Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;
        
        try {
            let userXP = await XP.findOne({ guildId: message.guild.id, userId: authorId });
            if (!userXP) {
                userXP = new XP({
                    guildId: message.guild.id,
                    userId: authorId,
                    xp: 0,
                    level: 0,
                    messages: 0,
                    voiceMinutes: 0,
                });
            }

            userXP.xp += xpToAdd;
            userXP.messages += 1;
            userXP.lastMessage = new Date();

            const multiplier = config.xp?.levelUpMultiplier || 100;
            const nextLevelXp = (userXP.level + 1) * multiplier;

            if (userXP.xp >= nextLevelXp) {
                userXP.level += 1;
                userXP.xp -= nextLevelXp;

                const levelUpMsg = `🎉 مبروك ${message.author}، لقد وصلت إلى المستوى **${userXP.level}**! ${config.emojis?.xp || '✨'}`;
                message.channel.send(levelUpMsg).catch(() => {});
            }
            await userXP.save();
        } catch (error) {
            console.error('خطأ في نظام الـ XP:', error);
        }

        // 3. نظام الستريك اليومي (Streak) — يعمل فقط في قناة الستريك المحددة
        try {
            if (settings.streak_channel && message.channel.id === settings.streak_channel) {
                // التحقق من أن الرسالة تحتوي على محتوى أو صورة/مرفق
                const hasContent = message.content.length > 0;
                const hasAttachment = message.attachments.size > 0;

                if (hasContent || hasAttachment) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    let streakData = await Streak.findOne({ guildId: message.guild.id, userId: authorId });

                    if (!streakData) {
                        // أول مرة يسجل ستريك
                        streakData = new Streak({
                            guildId: message.guild.id,
                            userId: authorId,
                            currentStreak: 1,
                            maxStreak: 1,
                            lastStreakDate: new Date()
                        });
                        await streakData.save();

                        // رسالة ترحيب بالستريك الأول
                        message.channel.send(`🔥 ${message.author} بدأ ستريك جديد! يوم 1 — استمر!`).catch(() => {});
                    } else {
                        const lastDate = streakData.lastStreakDate ? new Date(streakData.lastStreakDate) : null;

                        if (lastDate) {
                            lastDate.setHours(0, 0, 0, 0);

                            // إذا سجل اليوم مسبقاً، لا نحسبه مرتين
                            if (lastDate.getTime() === today.getTime()) {
                                // لا نعمل شيء، العضو سجل اليوم بالفعل
                            }
                            // إذا سجل بالأمس، يستمر الستريك
                            else if (lastDate.getTime() === yesterday.getTime()) {
                                streakData.currentStreak += 1;
                                if (streakData.currentStreak > streakData.maxStreak) {
                                    streakData.maxStreak = streakData.currentStreak;
                                }
                                streakData.lastStreakDate = new Date();
                                await streakData.save();

                                // إشعار بالاستمرار
                                const streakEmoji = streakData.currentStreak >= 7 ? '🏆' : '🔥';
                                message.channel.send(`${streakEmoji} ${message.author} واصل الستريك! **${streakData.currentStreak}** يوم متتالي!`).catch(() => {});
                            }
                            // إذا فات أكثر من يوم، ينقطع الستريك ويبدأ من جديد
                            else {
                                const oldStreak = streakData.currentStreak;
                                streakData.currentStreak = 1;
                                streakData.lastStreakDate = new Date();
                                await streakData.save();

                                if (oldStreak > 1) {
                                    message.channel.send(`😢 ${message.author} انقطع الستريك عند **${oldStreak}** يوم! بداية جديدة — يوم 1`).catch(() => {});
                                } else {
                                    message.channel.send(`🔥 ${message.author} بدأ ستريك جديد! يوم 1`).catch(() => {});
                                }
                            }
                        } else {
                            // لم يكن لديه تاريخ سابق
                            streakData.currentStreak = 1;
                            streakData.maxStreak = Math.max(streakData.maxStreak, 1);
                            streakData.lastStreakDate = new Date();
                            await streakData.save();
                            message.channel.send(`🔥 ${message.author} بدأ ستريك جديد! يوم 1`).catch(() => {});
                        }
                    }
                }
            }
        } catch (error) {
            console.error('خطأ في نظام الستريك:', error);
        }
    },
};
