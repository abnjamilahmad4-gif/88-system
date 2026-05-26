const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isMod } = require('../../utils/permissions');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('تفعيل أو إيقاف الوضع البطيء للقناة.')
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('المدة بالثواني (0 لإيقاف الوضع البطيء)')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('القناة المراد تغيير الوضع البطيء لها (اختياري)')
                .setRequired(false)),
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const settings = guildData;

        if (!isMod(interaction.member, settings) && !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: '❌ لا تملك صلاحية لاستخدام هذا الأمر.', ephemeral: true });
        }

        const duration = interaction.options.getInteger('duration');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (duration < 0 || duration > 21600) {
            return interaction.reply({ content: '❌ يجب أن تكون المدة بين 0 و 21600 ثانية (6 ساعات).', ephemeral: true });
        }

        if (!channel.isTextBased()) {
            return interaction.reply({ content: '❌ لا يمكن تفعيل الوضع البطيء إلا في القنوات النصية.', ephemeral: true });
        }

        try {
            await channel.setRateLimitPerUser(duration, `بواسطة ${interaction.user.tag}`);

            const status = duration === 0 ? 'إيقاف' : `تفعيل (${duration} ثواني)`;
            
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('الوضع البطيء 🐢')
                .setDescription(`تم ${status} الوضع البطيء في القناة ${channel}.`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء تغيير الوضع البطيء للقناة.', ephemeral: true });
        }
    }
};

