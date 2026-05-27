const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// للتوضيح فقط (يجب استخدام قاعدة بيانات حقيقية للحفظ)
const events = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('إدارة فعاليات سيرفر 08')
        .addSubcommand(sub => 
            sub.setName('create')
                .setDescription('إنشاء فعالية جديدة')
                .addStringOption(opt => opt.setName('name').setDescription('اسم الفعالية').setRequired(true))
                .addStringOption(opt => opt.setName('description').setDescription('وصف الفعالية').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('list')
                .setDescription('عرض الفعاليات المتاحة'))
        .addSubcommand(sub => 
            sub.setName('join')
                .setDescription('الانضمام لفعالية')
                .addStringOption(opt => opt.setName('name').setDescription('اسم الفعالية').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('leave')
                .setDescription('الخروج من فعالية')
                .addStringOption(opt => opt.setName('name').setDescription('اسم الفعالية').setRequired(true))),
    async execute(interaction) {
        const subCmd = interaction.options.getSubcommand();
        const eventName = interaction.options.getString('name');

        if (subCmd === 'create') {
            const desc = interaction.options.getString('description');
            events.push({ name: eventName, description: desc, participants: [] });
            const embed = new EmbedBuilder()
                .setTitle('🎉 تم إنشاء فعالية جديدة 🎉')
                .addFields({ name: 'اسم الفعالية', value: eventName }, { name: 'الوصف', value: desc })
                .setColor('#FFD700');
            await interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'list') {
            if (events.length === 0) return interaction.reply({ content: 'لا توجد فعاليات حالياً.', ephemeral: true });
            const embed = new EmbedBuilder().setTitle('📋 قائمة الفعاليات').setColor('#FFD700');
            events.forEach(ev => embed.addFields({ name: ev.name, value: `${ev.description} - (المشاركين: ${ev.participants.length})` }));
            await interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'join') {
            const ev = events.find(e => e.name === eventName);
            if (!ev) return interaction.reply({ content: 'الفعالية غير موجودة!', ephemeral: true });
            if (ev.participants.includes(interaction.user.id)) return interaction.reply({ content: 'أنت مشارك بالفعل!', ephemeral: true });
            ev.participants.push(interaction.user.id);
            const embed = new EmbedBuilder().setTitle('✅ تم الانضمام للفعالية').setDescription(`لقد انضممت بنجاح إلى **${eventName}**`).setColor('#FFD700');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subCmd === 'leave') {
            const ev = events.find(e => e.name === eventName);
            if (!ev) return interaction.reply({ content: 'الفعالية غير موجودة!', ephemeral: true });
            if (!ev.participants.includes(interaction.user.id)) return interaction.reply({ content: 'أنت لست مشاركاً في هذه الفعالية!', ephemeral: true });
            ev.participants = ev.participants.filter(id => id !== interaction.user.id);
            const embed = new EmbedBuilder().setTitle('🚪 تم الخروج من الفعالية').setDescription(`لقد خرجت من فعالية **${eventName}**`).setColor('#FFD700');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

