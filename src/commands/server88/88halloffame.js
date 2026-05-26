const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// للتوضيح، يفترض استخدام قاعدة بيانات
const hallOfFame = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('88halloffame')
        .setDescription('إدارة قاعة المشاهير (للمالك فقط)')
        .addSubcommand(sub => 
            sub.setName('add')
                .setDescription('إضافة عضو لقاعة المشاهير')
                .addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('سبب الإضافة').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('remove')
                .setDescription('إزالة عضو من قاعة المشاهير')
                .addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('list')
                .setDescription('عرض قاعة المشاهير')),
    async execute(interaction) {
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: 'هذا الأمر مخصص لمالك السيرفر فقط!', ephemeral: true });
        }

        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'add') {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');
            hallOfFame.push({ id: user.id, reason });
            const embed = new EmbedBuilder()
                .setTitle('🌟 إضافة لقاعة المشاهير 🌟')
                .setDescription(`تمت إضافة <@${user.id}> لقاعة المشاهير!\n**السبب:** ${reason}`)
                .setColor('#FFD700');
            await interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'remove') {
            const user = interaction.options.getUser('user');
            const index = hallOfFame.findIndex(u => u.id === user.id);
            if (index === -1) return interaction.reply({ content: 'هذا العضو ليس في قاعة المشاهير.', ephemeral: true });
            hallOfFame.splice(index, 1);
            await interaction.reply({ content: `تم إزالة <@${user.id}> من قاعة المشاهير.`, ephemeral: true });
        } else if (subCmd === 'list') {
            if (hallOfFame.length === 0) return interaction.reply({ content: 'قاعة المشاهير فارغة حالياً.', ephemeral: true });
            const embed = new EmbedBuilder().setTitle('🌟 قاعة مشاهير 88 🌟').setColor('#FFD700');
            hallOfFame.forEach((u, i) => embed.addFields({ name: `✨ ${i+1}.`, value: `<@${u.id}>\nالسبب: ${u.reason}` }));
            await interaction.reply({ embeds: [embed] });
        }
    },
};
