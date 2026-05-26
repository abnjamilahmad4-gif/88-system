const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const Guild = require('../../models/Guild');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08verify')
        .setDescription('إعداد نظام التوثيق (للإدارة فقط)')
        .addSubcommand(sub => 
            sub.setName('setup')
                .setDescription('إرسال رسالة التوثيق في الروم الحالي'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'setup') {
            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.verify || '✔️'} توثيق الحساب`)
                .setDescription('اضغط على الزر أدناه للحصول على رتبة **عضو موثق** والوصول إلى باقي رومات السيرفر.')
                .setColor(config.colors?.primary || '#FFD700')
                .setFooter({ text: 'سيرفر 08' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_button')
                        .setLabel('توثيق 🛡️')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: '✅ تم إعداد نظام التوثيق بنجاح في هذا الروم.', ephemeral: true });
        }
    },

    // معالجة زر التحقق
    async handleButton(interaction) {
        try {
            const guildData = await Guild.findOne({ guildId: interaction.guild.id });
            if (!guildData || !guildData.verify_channel) {
                return interaction.reply({ content: '❌ نظام التوثيق غير مُعد بعد.', ephemeral: true });
            }

            // البحث عن رتبة "Verified" في الإعدادات أو بالاسم
            // نستخدم helper_role كـ verified role أو نبحث عن رتبة باسم Verified
            let verifiedRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('verified') || r.name.includes('موثق'));
            
            if (!verifiedRole) {
                return interaction.reply({ content: '❌ لم يتم العثور على رتبة التوثيق. تأكد من وجود رتبة باسم "Verified" أو "موثق".', ephemeral: true });
            }

            // التحقق إذا كان لديه الرتبة بالفعل
            if (interaction.member.roles.cache.has(verifiedRole.id)) {
                return interaction.reply({ content: '✅ أنت موثق بالفعل!', ephemeral: true });
            }

            await interaction.member.roles.add(verifiedRole);
            
            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis?.verify || '✔️'} تم التوثيق!`)
                .setDescription(`مرحباً ${interaction.user}! تم توثيق حسابك بنجاح وحصلت على رتبة **${verifiedRole.name}**.`)
                .setColor(config.colors?.success || '#00FF88')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // تسجيل في اللوج
            if (guildData.log_channel) {
                const logChannel = interaction.guild.channels.cache.get(guildData.log_channel);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle(`${config.emojis?.verify || '✔️'} توثيق عضو`)
                        .setDescription(`تم توثيق **${interaction.user.tag}** بنجاح.`)
                        .setColor(config.colors?.primary || '#FFD700')
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                }
            }
        } catch (error) {
            console.error('خطأ في نظام التوثيق:', error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء التوثيق.', ephemeral: true }).catch(() => {});
        }
    },
};
