require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const loadCommands = require('./handlers/commandHandler');
const loadEvents = require('./handlers/eventHandler');
const connectDatabase = require('./handlers/databaseHandler');

// إنشاء نسخة العميل (Client) مع تحديد النوايا (Intents) المطلوبة
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// مجموعة لتخزين الأوامر
client.commands = new Collection();

// مجموعة لتخزين أوقات التبريد (Cooldowns)
client.cooldowns = new Collection();

// نظام معالجة الأخطاء الشامل (Anti-Crash) لمنع توقف البوت فجأة
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Anti-Crash] Unhandled Rejection:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err, origin) => {
    console.error('[Anti-Crash] Uncaught Exception:', err, 'origin:', origin);
});

// دالة التشغيل الأساسية
const init = async () => {
    try {
        console.log('[System] Starting 88Bot initialization...');
        
        // الاتصال بقاعدة البيانات
        await connectDatabase();
        
        // تشغيل معالج الأحداث (Events)
        await loadEvents(client);
        
        // تشغيل معالج الأوامر (Commands)
        await loadCommands(client);
        
        // تسجيل الدخول إلى ديسكورد
        await client.login(process.env.DISCORD_TOKEN);
        
        console.log(`[System] Successfully logged in as ${client.user?.tag || 'Bot'}`);
    } catch (error) {
        console.error('[System] Critical Error during initialization:', error);
    }
};

init();
