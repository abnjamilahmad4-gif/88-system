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
        let giveXP = true;
        const cooldownKey = `${message.guild.id}-${authorId}`;
        const xpCooldownTime = config.xp?.cooldown || 60000;

        if (xpCooldown.has(cooldownKey)) {
            const lastXpTime = xpCooldown.get(cooldownKey);
            if (now - lastXpTime < xpCooldownTime) {
                giveXP = false;
            }
        }

        if (giveXP) {
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
        }

        // 3. نظام الستريك اليومي (Streak) — يعمل فقط في قناة الستريك المحددة عند إرسال صور
        try {
            if (settings.streak_channel && message.channel.id === settings.streak_channel) {
                // التحقق من وجود صور في الرسالة
                const imageAttachments = message.attachments.filter(attachment => 
                    attachment.contentType && attachment.contentType.startsWith('image/')
                );
                const hasImageLink = /\.(jpg|jpeg|png|gif|webp)/i.test(message.content) || 
                                     message.content.includes('tenor.com') || 
                                     message.content.includes('giphy.com');
                const photoCount = imageAttachments.size + (hasImageLink ? 1 : 0);

                if (photoCount > 0) {
                    // دالة للحصول على منتصف الليل بتوقيت مكة (Saudi Arabia/Riyadh - UTC+3)
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
                    const yesterdayRiyadh = new Date(todayRiyadh.getTime() - 24 * 60 * 60 * 1000);

                    // دالة لإرسال التقييم الأسطوري وحذفه بعد 5 ثوانٍ
                    const sendLegendaryConfirmation = async (streak, statusText) => {
                        const { EmbedBuilder } = require('discord.js');
                        const imageUrl = imageAttachments.first()?.url || (hasImageLink ? message.content.match(/https?:\/\/\S+/)?.[0] : null);

                        const embed = new EmbedBuilder()
                            .setTitle('🔥 تم تحديث الستريك بنجاح! | Streak Updated')
                            .setColor(config.colors?.primary || '#FFD700')
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                            .setDescription(
                                `⚡ **الحالة:** ${statusText}\n\n` +
                                `👤 **العضو:** ${message.author}\n` +
                                `🔥 **الستريك الحالي:** \`${streak.currentStreak}\` يوم متتالي\n` +
                                `⭐ **أعلى ستريك:** \`${streak.maxStreak}\` يوم\n` +
                                `📸 **أرسل الآن:** \`${photoCount}\` صورة (${streak.todayPhotos} إجمالي اليوم)\n` +
                                `📊 **إجمالي الصور المنشورة:** \`${streak.totalPhotos}\` صورة\n\n` +
                                `⏳ *ستحذف هذه الرسالة التلقائية خلال 5 ثوانٍ.*`
                            )
                            .setTimestamp();

                        if (imageUrl) {
                            embed.setImage(imageUrl);
                        }

                        const sentMsg = await message.channel.send({
                            content: `🔔 ${message.author} **تم تحديث الستريك الخاص بك!**`,
                            embeds: [embed]
                        }).catch(() => null);

                        if (sentMsg) {
                            setTimeout(() => {
                                sentMsg.delete().catch(() => {});
                            }, 5000);
                        }
                    };

                    let streakData = await Streak.findOne({ guildId: message.guild.id, userId: authorId });

                    if (!streakData) {
                        // أول مرة يسجل ستريك
                        streakData = new Streak({
                            guildId: message.guild.id,
                            userId: authorId,
                            currentStreak: 1,
                            maxStreak: 1,
                            lastStreakDate: new Date(),
                            totalPhotos: photoCount,
                            todayPhotos: photoCount
                        });
                        await streakData.save();

                        await sendLegendaryConfirmation(streakData, 'بدء ستريك جديد بنجاح! 🎉');
                    } else {
                        const lastDate = streakData.lastStreakDate ? new Date(streakData.lastStreakDate) : null;

                        if (lastDate) {
                            const lastDateRiyadh = getRiyadhMidnight(lastDate);

                            // إذا سجل اليوم مسبقاً، نزيد عدد الصور اليومية والإجمالية ونرسل تأكيداً مؤقتاً
                            if (lastDateRiyadh.getTime() === todayRiyadh.getTime()) {
                                streakData.totalPhotos += photoCount;
                                streakData.todayPhotos += photoCount;
                                await streakData.save();

                                await sendLegendaryConfirmation(streakData, 'تحديث صور اليوم بالستريك! 📸');
                            }
                            // إذا سجل بالأمس، يستمر الستريك ونزيد الصور ونحدث اليومية
                            else if (lastDateRiyadh.getTime() === yesterdayRiyadh.getTime()) {
                                streakData.currentStreak += 1;
                                if (streakData.currentStreak > streakData.maxStreak) {
                                    streakData.maxStreak = streakData.currentStreak;
                                }
                                streakData.lastStreakDate = new Date();
                                streakData.totalPhotos += photoCount;
                                streakData.todayPhotos = photoCount; // إعادة تعيين لليوم الجديد
                                await streakData.save();

                                await sendLegendaryConfirmation(streakData, 'مواصلة الستريك اليومي بنجاح! 🚀');
                            }
                            // إذا فات أكثر من يوم، ينقطع الستريك ويبدأ من جديد
                            else {
                                const oldStreak = streakData.currentStreak;
                                streakData.currentStreak = 1;
                                streakData.lastStreakDate = new Date();
                                streakData.totalPhotos += photoCount;
                                streakData.todayPhotos = photoCount;
                                await streakData.save();

                                const statusText = oldStreak > 1 
                                    ? `بدء ستريك جديد بعد انقطاع الستريك السابق عند ${oldStreak} يوم 😢`
                                    : 'بدء ستريك جديد بنجاح! 🌟';
                                
                                await sendLegendaryConfirmation(streakData, statusText);
                            }
                        } else {
                            // لم يكن لديه تاريخ سابق
                            streakData.currentStreak = 1;
                            streakData.maxStreak = Math.max(streakData.maxStreak, 1);
                            streakData.lastStreakDate = new Date();
                            streakData.totalPhotos += photoCount;
                            streakData.todayPhotos = photoCount;
                            await streakData.save();

                            await sendLegendaryConfirmation(streakData, 'بدء ستريك جديد بنجاح! 🎉');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('خطأ في نظام الستريك:', error);
        }
    },
};
