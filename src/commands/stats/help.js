const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('عرض قائمة المساعدة لجميع أوامر البوت'),

    async execute(interaction) {
        // الذهب الأساسي للبوت
        const embedColor = config.colors?.primary || '#FFD700';

        const mainEmbed = new EmbedBuilder()
            .setTitle(`🤖 قائمة مساعدة ${config.botName || '08Bot'}`)
            .setDescription(
                `مرحباً بك ${interaction.user}! يرجى اختيار القسم المناسب من القائمة المنسدلة بالأسفل لاستكشاف الأوامر وشرحها المختصر.`
            )
            .setColor(embedColor)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🛠️ الإعدادات والحماية', value: 'إعداد الرتب، قنوات اللوج، أنظمة السبام والريد.', inline: true },
                { name: '🛡️ الإشراف والرقابة', value: 'أوامر الطرد والحظر والميوت والتحذيرات.', inline: true },
                { name: '📊 المستويات والستريك', value: 'بطاقات التفاعل، لوحات الصدارة والستريك اليومي.', inline: true },
                { name: '🎫 التذاكر والبلاغات', value: 'فتح وإغلاق التذاكر وتلقي بلاغات الأعضاء.', inline: true },
                { name: '👥 معلومات وإحصائيات', value: 'عرض معلومات السيرفر، الأعضاء، البوت والصور.', inline: true },
                { name: '👑 سيرفر 08 الخاص', value: 'أوامر مخصصة فقط لهوية وفعاليات سيرفر 08.', inline: true }
            )
            .setFooter({ text: '08Bot System • اختر القسم أدناه', iconURL: interaction.client.user.displayAvatarURL() });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category_select')
            .setPlaceholder('اختر قسم الأوامر من هنا...')
            .addOptions([
                {
                    label: 'الإعدادات والحماية',
                    description: 'أوامر setup, settings, antiraid, antispam',
                    value: 'admin',
                    emoji: '🛠️'
                },
                {
                    label: 'الإشراف والرقابة',
                    description: 'أوامر ban, kick, mute, warn, timeout, clear...',
                    value: 'moderation',
                    emoji: '🛡️'
                },
                {
                    label: 'المستويات والستريك',
                    description: 'أوامر rank, leaderboard, xp, streak...',
                    value: 'leveling_streak',
                    emoji: '📊'
                },
                {
                    label: 'التذاكر والبلاغات',
                    description: 'أوامر ticket, report, close',
                    value: 'tickets_reports',
                    emoji: '🎫'
                },
                {
                    label: 'معلومات وإحصائيات',
                    description: 'أوامر serverinfo, userinfo, avatar, botinfo...',
                    value: 'stats_general',
                    emoji: '👥'
                },
                {
                    label: 'أوامر سيرفر 08',
                    description: 'أوامر 08verify, 08apply, 08rules, 08team...',
                    value: 'server08',
                    emoji: '👑'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const response = await interaction.reply({
            embeds: [mainEmbed],
            components: [row],
            ephemeral: true
        });

        // إنشاء جامع تفاعلات (Collector) خاص بالقائمة المنسدلة
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 120000 // دقيقتين قبل انتهاء صلاحية القائمة المنسدلة
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) return;

            const selectedValue = i.values[0];
            const updatedEmbed = new EmbedBuilder().setColor(embedColor);

            if (selectedValue === 'admin') {
                updatedEmbed
                    .setTitle('🛠️ قسم الإعدادات والحماية')
                    .setDescription('أوامر ضبط البوت وحماية السيرفر:')
                    .addFields(
                        { name: '`/setup`', value: 'إعداد قنوات اللوج والترحيب والتذاكر ورتب الإدارة مجتمعة.' },
                        { name: '`/settings`', value: 'عرض جميع إعدادات البوت المخزنة حالياً في سيرفرك.' },
                        { name: '`/antispam`', value: 'ضبط إعدادات مكافحة السبام التلقائي وتحديد العقوبة.' },
                        { name: '`/antiraid`', value: 'ضبط وتفعيل نظام مكافحة الهجمات الجماعية في السيرفر.' }
                    );
            } 
            else if (selectedValue === 'moderation') {
                updatedEmbed
                    .setTitle('🛡️ قسم الإشراف والرقابة')
                    .setDescription('أوامر الحفاظ على النظام ومعاقبة المخالفين:')
                    .addFields(
                        { name: '`/ban <user> [reason]`', value: 'حظر عضو نهائياً من السيرفر.' },
                        { name: '`/kick <user> [reason]`', value: 'طرد عضو خارج السيرفر.' },
                        { name: '`/mute <user> [duration] [reason]`', value: 'كتم العضو شات وصوت وإعطائه رتبة الميوت.' },
                        { name: '`/unmute <user>`', value: 'فك الميوت والإغلاق الصوتي عن العضو.' },
                        { name: '`/warn <user> <reason>`', value: 'إرسال إنذار رسمي وتسجيله في سجلات العضو.' },
                        { name: '`/timeout <user> <duration> [reason]`', value: 'كتم العضو مؤقتاً عبر نظام الديسكورد الرسمي.' },
                        { name: '`/clear <amount>`', value: 'مسح رسائل الشات الحالية (بحد أقصى 100 رسالة).' },
                        { name: '`/slowmode <seconds>`', value: 'تحديد مهلة زمنية لإرسال الرسائل في القناة.' }
                    );
            }
            else if (selectedValue === 'leveling_streak') {
                updatedEmbed
                    .setTitle('📊 قسم المستويات والستريك اليومي')
                    .setDescription('أوامر التفاعل والنشاط اليومي في السيرفر:')
                    .addFields(
                        { name: '`/rank [user]`', value: 'عرض بطاقة الرتبة الحالية للمستويات والـ XP بصورة كرت.' },
                        { name: '`/leaderboard`', value: 'عرض لوحة صدارة الأعضاء الأكثر تفاعلاً بالخبرة.' },
                        { name: '`/xp <give/remove> <user> <amount>`', value: 'تعديل نقاط الخبرة للعضو (خاص بالإدارة).' },
                        { name: '`/levelup <toggle>`', value: 'تشغيل أو إيقاف إعلانات الترقي للمستويات.' },
                        { name: '`/voicexp <toggle>`', value: 'تشغيل أو إيقاف احتساب نقاط التفاعل للرومات الصوتية.' },
                        { name: '`/streak view [user]`', value: 'عرض أيام الستريك المتواصل والنشاط اليومي.' },
                        { name: '`/streak check`', value: 'فحص فوري يدوي لحالة الستريك لتفادي التصفير.' },
                        { name: '`/streak leaderboard`', value: 'عرض صدارة السيرفر في التفاعل المتتالي بالستريك.' }
                    );
            }
            else if (selectedValue === 'tickets_reports') {
                updatedEmbed
                    .setTitle('🎫 قسم التذاكر والدعم والبلاغات')
                    .setDescription('أوامر الدعم الفني وتلقي الشكاوي:')
                    .addFields(
                        { name: '`/ticket setup`', value: 'إرسال لوحة فتح التذاكر بأزرار الدعم الفني.' },
                        { name: '`/report user <target> <reason>`', value: 'فتح قناة بلاغ سرية للإبلاغ عن عضو مخالف.' },
                        { name: '`/report message <link> <reason>`', value: 'الإبلاغ عن رسالة غير قانونية في السيرفر.' },
                        { name: '`/report bug <description>`', value: 'الإبلاغ عن خلل برمجي أو ثغرة في البوت.' },
                        { name: '`/close`', value: 'إغلاق وحفظ لوج قناة البلاغ أو التذكرة الحالية.' }
                    );
            }
            else if (selectedValue === 'stats_general') {
                updatedEmbed
                    .setTitle('👥 الإحصائيات والمعلومات العامة')
                    .setDescription('أوامر الاستعلام عن البيانات والمعلومات العامة:')
                    .addFields(
                        { name: '`/serverinfo`', value: 'عرض كافة تفاصيل السيرفر والتاريخ والمالك.' },
                        { name: '`/userinfo [user]`', value: 'عرض تفاصيل الحساب ورتب وتاريخ انضمام العضو.' },
                        { name: '`/botinfo`', value: 'استهلاك وتفاصيل البوت البرمجية وحالته.' },
                        { name: '`/avatar /banner`', value: 'عرض وتحميل الصورة والبانر الشخصي للأعضاء.' },
                        { name: '`/ping`', value: 'سرعة استجابة البوت مع خوادم الديسكورد.' },
                        { name: '`/roleinfo /channelinfo`', value: 'عرض معلومات تفصيلية عن الرتبة أو القناة.' },
                        { name: '`/membercount /serverboost`', value: 'إحصائيات الأعضاء والتواجد وبوستات السيرفر.' }
                    );
            }
            else if (selectedValue === 'server08') {
                updatedEmbed
                    .setTitle('👑 أوامر سيرفر 08 الخاصة')
                    .setDescription('مجموعة الأوامر المعدة خصيصاً لهوية سيرفر 08:')
                    .addFields(
                        { name: '`/08verify`', value: 'إرسال لوحة التوثيق لتوثيق الحسابات برتبة العضوية.' },
                        { name: '`/08apply /08appeal`', value: 'تقديم طلب التقديم للإشراف أو طلب فك الحظر.' },
                        { name: '`/08rules /08info`', value: 'عرض شروط وقوانين السيرفر وقوانينه المنسقة.' },
                        { name: '`/08team /08partners`', value: 'عرض شركاء السيرفر وأعضاء الطاقم الإداري.' },
                        { name: '`/08boosters /08halloffame`', value: 'لوحات الشرف للداعمين والأعضاء الأسطوريين.' },
                        { name: '`/08event /08challenge`', value: 'الإعلان عن تحديات ومسابقات جديدة للسيرفر.' },
                        { name: '`/08complaint /08feedback`', value: 'تقديم شكوى أو اقتراح إيجابي لتطوير السيرفر.' }
                    );
            }

            updatedEmbed.setFooter({ text: '08Bot System • استخدم القائمة المنسدلة للتنقل', iconURL: interaction.client.user.displayAvatarURL() });

            await i.update({
                embeds: [updatedEmbed],
                components: [row]
            });
        });

        collector.on('end', () => {
            // إيقاف تفاعل القائمة بعد انتهاء الوقت لحماية الموارد
            row.components[0].setDisabled(true);
            interaction.editReply({ components: [row] }).catch(() => {});
        });
    }
};
