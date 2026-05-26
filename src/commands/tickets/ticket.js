const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const Guild = require('../../models/Guild');
const Ticket = require('../../models/Ticket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('نظام التذاكر')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('إرسال رسالة فتح التذاكر')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('القناة التي سيتم إرسال الرسالة فيها')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('إغلاق التذكرة الحالية')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة عضو للتذكرة')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد إضافته')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة عضو من التذكرة')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد إزالته')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rename')
                .setDescription('تغيير اسم التذكرة')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('الاسم الجديد')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('استلام التذكرة')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });

        if (!guildData) return interaction.reply({ content: '❌ يجب إعداد السيرفر أولاً.', ephemeral: true });

        if (sub === 'setup') {
            const channel = interaction.options.getChannel('channel');

            const embed = new EmbedBuilder()
                .setTitle('📩 نظام التذاكر')
                .setDescription('اضغط على أحد الأزرار أدناه لفتح تذكرة مناسبة لطلبك.')
                .setColor('Blue');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_create_complaint')
                        .setLabel('شكوى')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('⚠️'),
                    new ButtonBuilder()
                        .setCustomId('ticket_create_help')
                        .setLabel('مساعدة')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('❓'),
                    new ButtonBuilder()
                        .setCustomId('ticket_create_admin')
                        .setLabel('إداري')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🛡️')
                );

            await channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: `✅ تم إرسال رسالة التذاكر بنجاح في ${channel}`, ephemeral: true });
        }

        const ticket = await Ticket.findOne({ channelId: interaction.channel.id });

        if (!ticket) {
            return interaction.reply({ content: '❌ هذا الأمر يمكن استخدامه داخل تذكرة فقط.', ephemeral: true });
        }

        if (sub === 'close') {
            await interaction.reply({ content: '🔒 جاري إغلاق التذكرة...' });
            await Ticket.deleteOne({ channelId: interaction.channel.id });
            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 3000);
        }
        else if (sub === 'add') {
            const user = interaction.options.getUser('user');
            await interaction.channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
            await interaction.reply({ content: `✅ تم إضافة ${user} إلى التذكرة.` });
        }
        else if (sub === 'remove') {
            const user = interaction.options.getUser('user');
            await interaction.channel.permissionOverwrites.edit(user.id, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false
            });
            await interaction.reply({ content: `✅ تم إزالة ${user} من التذكرة.` });
        }
        else if (sub === 'rename') {
            const name = interaction.options.getString('name');
            await interaction.channel.setName(name);
            await interaction.reply({ content: `✅ تم تغيير اسم التذكرة إلى \`${name}\`.` });
        }
        else if (sub === 'claim') {
            if (ticket.claimerId) {
                return interaction.reply({ content: '❌ هذه التذكرة تم استلامها بالفعل.', ephemeral: true });
            }

            const hasRole = (guildData.admin_roles && guildData.admin_roles.some(id => interaction.member.roles.cache.has(id))) || 
                            (guildData.mod_roles && guildData.mod_roles.some(id => interaction.member.roles.cache.has(id)));
                            
            if (!hasRole && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ لا تملك الصلاحية لاستلام التذاكر.', ephemeral: true });
            }

            ticket.claimerId = interaction.user.id;
            ticket.status = 'claimed';
            await ticket.save();

            const embed = new EmbedBuilder()
                .setDescription(`✅ تم استلام هذه التذكرة بواسطة ${interaction.user}`)
                .setColor('Green');

            await interaction.reply({ embeds: [embed] });
        }
    },

    async handleButton(interaction) {
        const customId = interaction.customId;
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData) return interaction.reply({ content: '❌ السيرفر غير معد مسبقاً.', ephemeral: true });

        if (customId.startsWith('ticket_create_')) {
            const type = customId.split('_')[2];
            let categoryId = guildData.report_category || null; // Could use ticket_category if it exists, fallback to report_category or null

            // Check if user already has an open ticket
            const existingTicket = await Ticket.findOne({ guildId: interaction.guild.id, userId: interaction.user.id, status: 'open' });
            if (existingTicket) {
                return interaction.reply({ content: `❌ لديك تذكرة مفتوحة بالفعل <#${existingTicket.channelId}>`, ephemeral: true });
            }

            let typeName = 'تذكرة';
            if (type === 'complaint') typeName = 'شكوى';
            if (type === 'help') typeName = 'مساعدة';
            if (type === 'admin') typeName = 'إدارة';

            const channelName = `تذكرة-${interaction.user.username}`;
            const permissionOverwrites = [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                }
            ];

            if (guildData.admin_roles && guildData.admin_roles.length > 0) {
                guildData.admin_roles.forEach(id => {
                    permissionOverwrites.push({
                        id: id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    });
                });
            }
            if (guildData.mod_roles && guildData.mod_roles.length > 0) {
                guildData.mod_roles.forEach(id => {
                    permissionOverwrites.push({
                        id: id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    });
                });
            }

            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: permissionOverwrites
            });

            // Save to DB
            const newTicket = new Ticket({
                ticketId: channel.id,
                guildId: interaction.guild.id,
                channelId: channel.id,
                userId: interaction.user.id,
                type: type
            });
            await newTicket.save();

            const embed = new EmbedBuilder()
                .setTitle(`تذكرة ${typeName}`)
                .setDescription(`مرحباً ${interaction.user}، يرجى كتابة تفاصيل طلبك وسيقوم أحد أفراد الإدارة بالرد عليك قريباً.`)
                .setColor('Blue');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_action_claim')
                        .setLabel('استلام التذكرة')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('📌'),
                    new ButtonBuilder()
                        .setCustomId('ticket_action_close')
                        .setLabel('إغلاق التذكرة')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            let mentions = '';
            if (guildData.admin_roles && guildData.admin_roles.length > 0) mentions += guildData.admin_roles.map(id => `<@&${id}> `).join('');
            if (guildData.mod_roles && guildData.mod_roles.length > 0) mentions += guildData.mod_roles.map(id => `<@&${id}> `).join('');

            await channel.send({ content: `${interaction.user} ${mentions}`, embeds: [embed], components: [row] });
            await interaction.reply({ content: `✅ تم فتح تذكرتك بنجاح: ${channel}`, ephemeral: true });

            // Send log to t_orders_channel
            if (guildData.t_orders_channel) {
                const ordersChannel = interaction.guild.channels.cache.get(guildData.t_orders_channel);
                if (ordersChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📩 تذكرة جديدة')
                        .addFields(
                            { name: 'صاحب التذكرة', value: `${interaction.user}`, inline: true },
                            { name: 'نوع التذكرة', value: typeName, inline: true },
                            { name: 'القناة', value: `${channel}`, inline: true }
                        )
                        .setColor('Yellow')
                        .setTimestamp();
                    
                    await ordersChannel.send({ embeds: [logEmbed] });
                }
            }
        }
        else if (customId === 'ticket_action_claim') {
            const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
            if (!ticket) return interaction.reply({ content: '❌ لا يمكن العثور على التذكرة في قاعدة البيانات.', ephemeral: true });

            if (ticket.claimerId) {
                return interaction.reply({ content: '❌ هذه التذكرة تم استلامها بالفعل.', ephemeral: true });
            }

            const hasRole = (guildData.admin_roles && guildData.admin_roles.some(id => interaction.member.roles.cache.has(id))) || 
                            (guildData.mod_roles && guildData.mod_roles.some(id => interaction.member.roles.cache.has(id)));
                            
            if (!hasRole && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ لا تملك الصلاحية لاستلام التذاكر.', ephemeral: true });
            }

            ticket.claimerId = interaction.user.id;
            ticket.status = 'claimed';
            await ticket.save();

            const embed = new EmbedBuilder()
                .setDescription(`✅ تم استلام هذه التذكرة بواسطة ${interaction.user}`)
                .setColor('Green');

            await interaction.reply({ embeds: [embed] });
        }
        else if (customId === 'ticket_action_close') {
            await interaction.reply({ content: '🔒 جاري إغلاق التذكرة...' });
            await Ticket.deleteOne({ channelId: interaction.channel.id });
            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 3000);
        }
    }
};
