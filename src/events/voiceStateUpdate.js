const { Events } = require('discord.js');
const XP = require('../models/XP');
const config = require('../config');

// تخزين أوقات دخول الأعضاء للقنوات الصوتية
const voiceSession = new Map();

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const member = newState.member;
        
        // تجاهل البوتات
        if (member.user.bot) return;

        const guildId = newState.guild.id;
        const userId = member.id;
        const sessionKey = `${guildId}-${userId}`;

        // 1. الانضمام لقناة صوتية
        if (!oldState.channelId && newState.channelId) {
            voiceSession.set(sessionKey, Date.now());
        } 
        // 2. الخروج من قناة صوتية
        else if (oldState.channelId && !newState.channelId) {
            const joinTime = voiceSession.get(sessionKey);
            if (joinTime) {
                const leaveTime = Date.now();
                const durationInMinutes = Math.floor((leaveTime - joinTime) / 60000);
                voiceSession.delete(sessionKey);

                // إعطاء XP فقط إذا تجاوز الدقيقة
                if (durationInMinutes > 0) {
                    const xpPerMinute = config.xp?.voicePerMinute || 5;
                    const xpEarned = durationInMinutes * xpPerMinute;

                    try {
                        let userXP = await XP.findOne({ guildId, userId });
                        if (!userXP) {
                            userXP = new XP({
                                guildId,
                                userId,
                                xp: 0,
                                level: 0,
                                messages: 0,
                                voiceMinutes: 0,
                            });
                        }

                        userXP.xp += xpEarned;
                        userXP.voiceMinutes += durationInMinutes;

                        const multiplier = config.xp?.levelUpMultiplier || 100;
                        const nextLevelXp = (userXP.level + 1) * multiplier;

                        if (userXP.xp >= nextLevelXp) {
                            userXP.level += 1;
                            userXP.xp -= nextLevelXp;
                        }

                        await userXP.save();
                    } catch (error) {
                        console.error('خطأ أثناء حفظ XP القناة الصوتية:', error);
                    }
                }
            }
        }
        // 3. التنقل بين القنوات الصوتية (لا نعمل شيء)
    },
};
