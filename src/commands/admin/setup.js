const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, EmbedBuilder, ChannelType, ComponentType } = require('discord.js');
const Guild = require('../../models/Guild');
const { COLORS } = require('../../utils/embeds');

// الحقول المطلوبة للإعداد
const SETUP_FIELDS = {
    'admin_roles': { label: 'رتب الإدارة', emoji: '👑', type: 'role' },
    'mod_roles': { label: 'رتب المشرفين', emoji: '🛡️', type: 'role' },
    'helper_roles': { label: 'رتب المساعدين', emoji: '🤝', type: 'role' },
    'muted_roles': { label: 'رتب الميوت', emoji: '🔇', type: 'role' },
    'log_channel': { label: 'قناة السجلات', emoji: '📝', type: 'channel' },
    'streak_channel': { label: 'قناة الستريك', emoji: '🔥', type: 'channel' },
    'ticket_channel': { label: 'قناة التذاكر', emoji: '🎫', type: 'channel' },
    't_orders_channel': { label: 'قناة أوامر التذاكر', emoji: '📋', type: 'channel' },
    'report_category': { label: 'تصنيف البلاغات', emoji: '🚨', type: 'channel' },
    'verify_channel': { label: 'قناة التحقق', emoji: '✔️', type: 'channel' },
    'welcome_channel': { label: 'قناة الترحيب', emoji: '👋', type: 'channel' },
    'level_channel': { label: 'قناة المستويات', emoji: '📊', type: 'channel' },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('إعداد البوت الأساسي للسيرفر (إلزامي)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // التحقق من الصلاحيات
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ هذا الأمر مخصص للإداريين فقط.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        // جلب أو إنشاء بيانات السيرفر
        let guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData) {
            guildData = new Guild({ guildId: interaction.guild.id });
        }

        try {
            // 1. البحث عن أو إنشاء فئة (Category) باسم "08 channels"
            let category = interaction.guild.channels.cache.find(c => 
                c.name === '08 channels' && c.type === ChannelType.GuildCategory
            );
            if (!category) {
                category = await interaction.guild.channels.create({
                    name: '08 channels',
                    type: ChannelType.GuildCategory,
                    reason: 'الفئة التلقائية لقنوات سيرفر 08'
                });
            }

            // تحديث فئة البلاغات في الموديل
            guildData.report_category = category.id;

            // 2. مصفوفة القنوات المراد إنشاؤها تلقائياً وربطها بالـ setup
            const channelsToCreate = [
                { name: 'ticket-🎫', field: 'ticket_channel' },
                { name: 'avrages-📊', field: 'log_channel' },
                { name: 'streaks-☄️', field: 'streak_channel' },
                { name: 'ticket-replay-🔄', field: 't_orders_channel' },
                { name: 'verification-🔐', field: 'verify_channel' },
                { name: 'WELCOME-08-👋', field: 'welcome_channel' },
                { name: 'cmd-👨‍💻', field: null }, // قناة الأوامر العامة ليست بالـ setup
                { name: 'levels-🏅', field: 'level_channel' }
            ];

            for (const ch of channelsToCreate) {
                let channel = interaction.guild.channels.cache.find(c => 
                    c.name === ch.name && c.parentId === category.id && c.type === ChannelType.GuildText
                );

                if (!channel) {
                    channel = await interaction.guild.channels.create({
                        name: ch.name,
                        type: ChannelType.GuildText,
                        parent: category.id,
                        reason: `إنشاء القناة التلقائية ${ch.name}`
                    });
                }

                // ربط القناة بالحقل المناسب في إعدادات البوت تلقائياً
                if (ch.field) {
                    guildData[ch.field] = channel.id;
                }
            }

            await guildData.save();
            await sendSetupPanel(interaction, guildData, '✨ تم إعداد وإنشاء فئة "08 channels" وجميع القنوات الأساسية تلقائياً وربطها بالـ Setup بنجاح!');
        } catch (error) {
            console.error('خطأ في إعداد القنوات التلقائي:', error);
            await sendSetupPanel(interaction, guildData, '⚠️ حدث خطأ أثناء محاولة إنشاء بعض القنوات التلقائية، يمكنك ضبط القنوات المتبقية يدوياً.');
        }
    },

    // معالجة القائمة المنسدلة
    async handleSelect(interaction) {
        const value = interaction.values[0];

        if (value === 'setup_finish') {
            return await finishSetup(interaction);
        }

        if (value === 'setup_status') {
            return await showStatus(interaction);
        }

        // تحديد الحقل المطلوب
        const fieldKey = value.replace('setup_', '');
        const fieldInfo = SETUP_FIELDS[fieldKey];
        if (!fieldInfo) return;

        if (fieldInfo.type === 'role') {
            const roleMenu = new RoleSelectMenuBuilder()
                .setCustomId(`setup_role_${fieldKey}`)
                .setPlaceholder(`اختر ${fieldInfo.label}...`)
                .setMinValues(1)
                .setMaxValues(25); // السماح باختيار أكثر من رتبة (حتى 25)

            const row = new ActionRowBuilder().addComponents(roleMenu);
            await interaction.update({ 
                content: `${fieldInfo.emoji} اختر **${fieldInfo.label}** من القائمة أدناه:`, 
                components: [row], 
                embeds: [] 
            });

            // انتظار الاختيار
            try {
                const collected = await interaction.message.awaitMessageComponent({
                    componentType: ComponentType.RoleSelect,
                    time: 60000,
                    filter: (i) => i.user.id === interaction.user.id
                });

                const selectedRoles = collected.roles.mapValues(r => r.id);
                let guildData = await Guild.findOne({ guildId: interaction.guild.id });
                if (!guildData) guildData = new Guild({ guildId: interaction.guild.id });
                
                guildData[fieldKey] = Array.from(selectedRoles.values());
                await guildData.save();

                const roleMentions = guildData[fieldKey].map(id => `<@&${id}>`).join(', ');
                await sendSetupPanel(collected, guildData, `✅ تم تحديد **${fieldInfo.label}** إلى: ${roleMentions}`);
            } catch {
                await sendSetupPanel(interaction, await Guild.findOne({ guildId: interaction.guild.id }), '⏰ انتهى الوقت! حاول مجدداً.');
            }
        } else {
            const channelMenu = new ChannelSelectMenuBuilder()
                .setCustomId(`setup_channel_${fieldKey}`)
                .setPlaceholder(`اختر ${fieldInfo.label}...`)
                .setMinValues(1)
                .setMaxValues(1);

            // تصنيف البلاغات يكون Category
            if (fieldKey === 'report_category') {
                channelMenu.setChannelTypes(ChannelType.GuildCategory);
            } else {
                channelMenu.setChannelTypes(ChannelType.GuildText);
            }

            const row = new ActionRowBuilder().addComponents(channelMenu);
            await interaction.update({ 
                content: `${fieldInfo.emoji} اختر **${fieldInfo.label}** من القائمة أدناه:`, 
                components: [row], 
                embeds: [] 
            });

            try {
                const collected = await interaction.message.awaitMessageComponent({
                    componentType: ComponentType.ChannelSelect,
                    time: 60000,
                    filter: (i) => i.user.id === interaction.user.id
                });

                const selectedChannel = collected.channels.first();
                let guildData = await Guild.findOne({ guildId: interaction.guild.id });
                if (!guildData) guildData = new Guild({ guildId: interaction.guild.id });
                
                guildData[fieldKey] = selectedChannel.id;
                await guildData.save();

                await sendSetupPanel(collected, guildData, `✅ تم تحديد **${fieldInfo.label}** إلى: ${selectedChannel}`);
            } catch {
                await sendSetupPanel(interaction, await Guild.findOne({ guildId: interaction.guild.id }), '⏰ انتهى الوقت! حاول مجدداً.');
            }
        }
    },
};

// إرسال لوحة الإعداد
async function sendSetupPanel(interaction, guildData, statusMessage = null) {
    const embed = new EmbedBuilder()
        .setTitle('⚙️ لوحة إعداد بوت 08')
        .setColor(COLORS.GOLD)
        .setDescription(
            '**مرحباً بك في نظام الإعداد!**\n' +
            'يجب إكمال جميع الإعدادات الـ 12 لتفعيل البوت.\n' +
            'اختر الإعداد من القائمة أدناه.\n\n' +
            (statusMessage ? `> ${statusMessage}\n\n` : '') +
            getStatusText(guildData)
        )
        .setFooter({ text: `${getCompletedCount(guildData)}/12 مكتمل` })
        .setTimestamp();

    const options = Object.entries(SETUP_FIELDS).map(([key, info]) => {
        const isSet = guildData && guildData[key];
        return {
            label: `${isSet ? '✅' : '❌'} ${info.label}`,
            value: `setup_${key}`,
            emoji: info.emoji,
        };
    });

    options.push(
        { label: '📊 عرض الحالة', value: 'setup_status', emoji: '📊' },
        { label: '✅ تفعيل وحفظ الإعدادات', value: 'setup_finish', emoji: '🚀' }
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('setup_menu')
        .setPlaceholder('اختر الإعداد لضبطه...')
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components: [row], content: null });
    } else if (interaction.isMessageComponent()) {
        await interaction.update({ embeds: [embed], components: [row], content: null });
    } else {
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
}

// حالة الإعدادات
function getStatusText(guildData) {
    if (!guildData) return '❌ لا توجد إعدادات بعد.';
    
    let text = '';
    for (const [key, info] of Object.entries(SETUP_FIELDS)) {
        const isSet = guildData[key] && (Array.isArray(guildData[key]) ? guildData[key].length > 0 : true);
        let valueText = '*غير محدد*';
        if (isSet) {
            if (Array.isArray(guildData[key])) {
                valueText = guildData[key].map(id => `<@&${id}>`).join(', ');
            } else {
                valueText = `<#${guildData[key]}>`;
            }
        }
        text += `${isSet ? '✅' : '❌'} **${info.label}**: ${valueText}\n`;
    }
    return text;
}

// عدد الحقول المكتملة
function getCompletedCount(guildData) {
    if (!guildData) return 0;
    return Object.keys(SETUP_FIELDS).filter(key => {
        const val = guildData[key];
        return val && (Array.isArray(val) ? val.length > 0 : true);
    }).length;
}

// إنهاء الإعداد
async function finishSetup(interaction) {
    const guildData = await Guild.findOne({ guildId: interaction.guild.id });
    const completed = getCompletedCount(guildData);
    
    if (completed < 12) {
        const embed = new EmbedBuilder()
            .setTitle('❌ لا يمكن تفعيل البوت')
            .setDescription(`يجب إكمال جميع الإعدادات الـ 12 أولاً.\nالمكتمل: **${completed}/12**\n\n${getStatusText(guildData)}`)
            .setColor('#FF4444');

        return interaction.update({ embeds: [embed], components: [] });
    }

    guildData.isSetup = true;
    await guildData.save();

    const embed = new EmbedBuilder()
        .setTitle('🎉 تم تفعيل البوت بنجاح!')
        .setDescription('تم إكمال جميع الإعدادات وتفعيل البوت.\nيمكن لجميع الأعضاء الآن استخدام أوامر البوت.\n\nيمكنك تعديل الإعدادات لاحقاً باستخدام `/settings`.')
        .setColor(COLORS.GOLD)
        .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
}

// عرض حالة الإعدادات
async function showStatus(interaction) {
    const guildData = await Guild.findOne({ guildId: interaction.guild.id });
    await sendSetupPanel(interaction, guildData);
}
