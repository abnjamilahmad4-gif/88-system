// ===== إعدادات بوت 08 الأساسية =====

module.exports = {
    // هوية البوت
    botName: '08Bot',
    botVersion: '1.0.0',
    
    // اللون الذهبي الرئيسي
    colors: {
        primary: '#FFD700',    // ذهبي
        success: '#00FF88',    // أخضر
        error: '#FF4444',      // أحمر
        warning: '#FFA500',    // برتقالي
        info: '#00BFFF',       // أزرق فاتح
    },

    // إعدادات الكولداون (بالثواني)
    cooldowns: {
        default: 3,
        admin: 5,
        moderation: 3,
        leveling: 10,
        stats: 5,
        tickets: 10,
        streak: 30,
    },

    // إعدادات نظام المستويات (XP)
    xp: {
        minPerMessage: 15,
        maxPerMessage: 25,
        cooldown: 60000,          // كولداون 60 ثانية بين الرسائل
        voicePerMinute: 5,        // XP لكل دقيقة في الصوت
        levelUpMultiplier: 100,   // XP المطلوب = المستوى × هذا الرقم
    },

    // إعدادات الستريك
    streak: {
        channelRequired: true,    // يجب الإرسال في قناة محددة
        resetHour: 0,             // ساعة التصفير (منتصف الليل)
    },

    // إعدادات Anti-Spam (الافتراضية)
    antispam: {
        defaultLevel: 3,
        maxMessages: 5,           // عدد الرسائل المسموح
        timeWindow: 5000,         // خلال (ms)
        action: 'mute',           // الإجراء الافتراضي
    },

    // إعدادات Anti-Raid (الافتراضية)
    antiraid: {
        enabled: false,
        maxJoins: 10,             // عدد الدخول المسموح
        timeWindow: 10000,        // خلال (ms)
        action: 'kick',           // الإجراء الافتراضي
    },

    // إعدادات التذاكر
    tickets: {
        maxOpen: 3,               // أقصى عدد تذاكر مفتوحة لكل عضو
        autoClose: 24,            // إغلاق تلقائي بعد (ساعة) بدون نشاط
        transcriptEnabled: true,
    },

    // الإيموجيات المستخدمة
    emojis: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        star: '⭐',
        crown: '👑',
        fire: '🔥',
        ticket: '🎫',
        lock: '🔒',
        unlock: '🔓',
        ban: '🔨',
        kick: '👢',
        mute: '🔇',
        xp: '✨',
        level: '📊',
        streak: '🔥',
        trophy: '🏆',
        medal: '🥇',
        gift: '🎁',
        bell: '🔔',
        shield: '🛡️',
        gear: '⚙️',
        chart: '📈',
        members: '👥',
        voice: '🎤',
        text: '💬',
        boost: '💎',
        verify: '✔️',
        report: '📢',
        announcement: '📣',
    },
};
