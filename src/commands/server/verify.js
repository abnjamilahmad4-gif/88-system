const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const Guild = require('../../models/Guild');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('إعداد نظام التوثيق (للإدارة فقط)')
        .addSubcommand(sub => 
            sub.setName('setup')
                .setDescription('إرسال رسالة التوثيق في الروم الحالي'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'setup') {
            await interaction.deferReply({ ephemeral: true });

            try {
                // 1. البحث عن أو إنشاء رتبة غير الموثق "08."
                let unverifiedRole = interaction.guild.roles.cache.find(r => r.name === '08.' || r.name === '08');
                if (!unverifiedRole) {
                    unverifiedRole = await interaction.guild.roles.create({
                        name: '08.',
                        color: '#555555',
                        reason: 'رتبة غير الموثقين التلقائية لسيرفر 08'
                    }).catch(() => null);
                }

                // 2. البحث عن أو إنشاء رتبة الأعضاء الموثقين
                let verifiedRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('verified') || r.name.includes('موثق'));
                if (!verifiedRole) {
                    verifiedRole = await interaction.guild.roles.create({
                        name: 'عضو موثق',
                        color: '#00FF88',
                        reason: 'رتبة الأعضاء الموثقين لسيرفر 08'
                    }).catch(() => null);
                }

                if (!unverifiedRole || !verifiedRole) {
                    return interaction.editReply({ content: '❌ فشل إنشاء أو تهيئة رتب التوثيق.' });
                }

                // 3. تحديث صلاحيات الرومات لجعلها غير مرئية لرتبة "08." (عدا روم التوثيق الحالي)
                const currentChannel = interaction.channel;
                const channels = await interaction.guild.channels.fetch();

                for (const [_, channel] of channels) {
                    if (!channel) continue;

                    // روم التوثيق الحالي: يظهر لرتبة "08." وللجميع
                    if (channel.id === currentChannel.id) {
                        await channel.permissionOverwrites.edit(unverifiedRole.id, {
                            ViewChannel: true,
                            SendMessages: false, // لا يسمح بالكتابة لكي لا يمتلئ الروم
                            ReadMessageHistory: true
                        }).catch(() => {});

                        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
                            ViewChannel: true,
                            SendMessages: false
                        }).catch(() => {});
                    } else {
                        // الرومات الأخرى: يمنع رؤيتها لرتبة "08." تماماً
                        await channel.permissionOverwrites.edit(unverifiedRole.id, {
                            ViewChannel: false
                        }).catch(() => {});

                        // التأكد من أن الأعضاء الموثقين يمكنهم رؤية الروم (إذا كانت مغلقة عن everyone)
                        await channel.permissionOverwrites.edit(verifiedRole.id, {
                            ViewChannel: true
                        }).catch(() => {});
                    }
                }

                // 4. حفظ روم التوثيق في الإعدادات
                let guildData = await Guild.findOne({ guildId: interaction.guild.id });
                if (!guildData) {
                    guildData = new Guild({ guildId: interaction.guild.id });
                }
                guildData.verify_channel = currentChannel.id;
                await guildData.save();

                const embed = new EmbedBuilder()
                    .setTitle(`${config.emojis?.verify || '✔️'} توثيق الحساب | Account Verification`)
                    .setDescription(
                        `مرحباً بك في سيرفر **08**!\n\n` +
                        `🛡️ حسابك حالياً غير موثق ولديك رتبة **08.** (لا يمكنك رؤية أي قنوات).\n` +
                        `اضغط على الزر أدناه للحصول على رتبة **عضو موثق** والوصول الفوري لباقي رومات السيرفر.`
                    )
                    .setColor(config.colors?.primary || '#FFD700')
                    .setFooter({ text: 'سيرفر 08 • نظام التوثيق الذكي' });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('verify_button')
                            .setLabel('توثيق الحساب 🛡️')
                            .setStyle(ButtonStyle.Success)
                    );

                await currentChannel.send({ embeds: [embed], components: [row] });
                await interaction.editReply({ content: `✅ تم تفعيل وإعداد نظام التوثيق بنجاح! تم إنشاء رتبة **08.** ورتبة **عضو موثق** وضبط صلاحيات الرومات تلقائياً لتصبح غير مرئية لغير الموثقين.` });
            } catch (err) {
                console.error(err);
                await interaction.editReply({ content: '❌ حدث خطأ أثناء إعداد نظام التوثيق وصلاحيات الرومات.' });
            }
        }
    },

    // معالجة زر التحقق
    async handleButton(interaction) {
        try {
            const guildData = await Guild.findOne({ guildId: interaction.guild.id });
            if (!guildData || !guildData.verify_channel) {
                return interaction.reply({ content: '❌ نظام التوثيق غير مُعد بعد.', ephemeral: true });
            }

            // البحث عن رتبة التوثيق ورتبة غير الموثق "08."
            let verifiedRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('verified') || r.name.includes('موثق'));
            let unverifiedRole = interaction.guild.roles.cache.find(r => r.name === '08.' || r.name === '08');
            
            if (!verifiedRole) {
                return interaction.reply({ content: '❌ لم يتم العثور على رتبة التوثيق. يرجى إعادة تشغيل الإعداد `/verify setup`.', ephemeral: true });
            }

            // التحقق إذا كان لديه الرتبة بالفعل
            if (interaction.member.roles.cache.has(verifiedRole.id)) {
                return interaction.reply({ content: '✅ أنت موثق بالفعل وتملك كامل الصلاحيات في السيرفر!', ephemeral: true });
            }

            // إضافة رتبة الموثق وإزالة رتبة غير الموثق "08."
            await interaction.member.roles.add(verifiedRole);
            if (unverifiedRole && interaction.member.roles.cache.has(unverifiedRole.id)) {
                await interaction.member.roles.remove(unverifiedRole).catch(() => {});
            }
            
            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.verify || '✔️'} تم التوثيق بنجاح!`)
                .setDescription(`مرحباً ${interaction.user}! تم توثيق حسابك بنجاح وحصلت على رتبة **${verifiedRole.name}**.\nلقد فتحت الآن جميع قنوات السيرفر وتخلصت من رتبة **08.**! 🎉`)
                .setColor(config.colors?.success || '#00FF88')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // تسجيل في اللوج
            if (guildData.log_channel) {
                const logChannel = interaction.guild.channels.cache.get(guildData.log_channel);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle(`${config.emojis?.verify || '✔️'} توثيق عضو جديد`)
                        .setDescription(`تم توثيق العضو **${interaction.user.tag}** بنجاح وإزالة رتبة **08.** عنه.`)
                        .setColor(config.colors?.success || '#00FF88')
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                }
            }
        } catch (error) {
            console.error('خطأ في نظام التوثيق:', error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء توثيق حسابك. يرجى التواصل مع الإدارة.', ephemeral: true }).catch(() => {});
        }
    },
};

