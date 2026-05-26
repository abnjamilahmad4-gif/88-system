const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isMod } = require('../../utils/permissions');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('مسح الرسائل في القناة (بحد أقصى 100 رسالة).')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('عدد الرسائل المراد مسحها (1-100)')
                .setRequired(true)),
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const settings = guildData;

        if (!isMod(interaction.member, settings) && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ لا تملك صلاحية لاستخدام هذا الأمر.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: '❌ يرجى إدخال عدد بين 1 و 100.', ephemeral: true });
        }

        try {
            const messages = await interaction.channel.bulkDelete(amount, true);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ تم مسح **${messages.size}** رسالة بنجاح.`);

            const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

            // حذف رسالة التأكيد بعد 5 ثواني
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء مسح الرسائل. ملاحظة: لا يمكن مسح الرسائل الأقدم من 14 يوماً.', ephemeral: true });
        }
    }
};

