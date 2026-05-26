const { Events, Collection } = require('discord.js');
const Guild = require('../models/Guild');
const config = require('../config');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // 1. التعامل مع الأوامر (Slash Commands)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // التحقق من أن السيرفر قام بعمل إعداد (Setup) قبل استخدام أي أمر آخر
            if (interaction.commandName !== 'setup') {
                const guildData = await Guild.findOne({ guildId: interaction.guildId });
                if (!guildData || !guildData.isSetup) {
                    return interaction.reply({ 
                        content: '❌ يجب إعداد البوت أولاً باستخدام الأمر `/setup`.', 
                        ephemeral: true 
                    });
                }
            }

            // نظام التبريد (Cooldown)
            if (!client.cooldowns) client.cooldowns = new Collection();
            if (!client.cooldowns.has(command.data.name)) {
                client.cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = client.cooldowns.get(command.data.name);
            const defaultCooldown = config.cooldowns?.default || 3; 
            const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({ 
                        content: `⏳ يرجى الانتظار، يمكنك استخدام الأمر مجدداً <t:${expiredTimestamp}:R>.`, 
                        ephemeral: true 
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            // تنفيذ الأمر
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`خطأ أثناء تنفيذ الأمر ${interaction.commandName}:`, error);
                const errorMsg = 'حدث خطأ غير متوقع أثناء تنفيذ هذا الأمر!';
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMsg, ephemeral: true });
                } else {
                    await interaction.reply({ content: errorMsg, ephemeral: true });
                }
            }
        } 
        // 2. التعامل مع الأزرار (Buttons)
        else if (interaction.isButton()) {
            // معالجة أزرار نظام التذاكر والإعدادات
            if (interaction.customId.startsWith('ticket_')) {
                try {
                    const ticketHandler = require('../commands/tickets/ticket.js');
                    if (ticketHandler && ticketHandler.handleButton) {
                        await ticketHandler.handleButton(interaction);
                    }
                } catch (err) {
                    console.error('خطأ في معالجة زر التذكرة:', err);
                }
            }
            // معالجة زر التحقق (Verify)
            else if (interaction.customId === 'verify_button') {
                try {
                    const verifyHandler = require('../commands/server88/88verify.js');
                    if (verifyHandler && verifyHandler.handleButton) {
                        await verifyHandler.handleButton(interaction);
                    }
                } catch (err) {
                    console.error('خطأ في معالجة زر التحقق:', err);
                }
            }
        } 
        // 3. التعامل مع القوائم المنسدلة (Select Menus)
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'setup_menu') {
                try {
                    const setupHandler = require('../commands/admin/setup.js');
                    if (setupHandler && setupHandler.handleSelect) {
                        await setupHandler.handleSelect(interaction);
                    }
                } catch (err) {
                    console.error('خطأ في معالجة قائمة الإعداد:', err);
                }
            }
        }
    },
};
