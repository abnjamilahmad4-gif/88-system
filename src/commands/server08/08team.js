const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const teams = []; // يُفضل استخدام قاعدة بيانات

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08team')
        .setDescription('إدارة فرق سيرفر 08')
        .addSubcommand(sub => 
            sub.setName('create')
                .setDescription('إنشاء فريق جديد')
                .addStringOption(opt => opt.setName('name').setDescription('اسم الفريق').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('invite')
                .setDescription('دعوة عضو للفريق')
                .addUserOption(opt => opt.setName('user').setDescription('العضو المراد دعوته').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('leave')
                .setDescription('الخروج من فريق')),
    async execute(interaction) {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'create') {
            const name = interaction.options.getString('name');
            const hasTeam = teams.find(t => t.leader === interaction.user.id || t.members.includes(interaction.user.id));
            if (hasTeam) return interaction.reply({ content: 'أنت تملك فريقاً أو عضو في فريق بالفعل!', ephemeral: true });
            
            teams.push({ name, leader: interaction.user.id, members: [interaction.user.id] });
            const embed = new EmbedBuilder().setTitle('🛡️ تم إنشاء الفريق').setDescription(`تم إنشاء فريق **${name}** بنجاح!`).setColor('#FFD700');
            await interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'invite') {
            const user = interaction.options.getUser('user');
            const team = teams.find(t => t.leader === interaction.user.id);
            if (!team) return interaction.reply({ content: 'أنت لا تملك فريقاً لدعوة الأعضاء!', ephemeral: true });
            
            team.members.push(user.id); // بسيط بدون تأكيد كبداية
            const embed = new EmbedBuilder().setTitle('✉️ دعوة فريق').setDescription(`تمت إضافة <@${user.id}> إلى فريق **${team.name}**`).setColor('#FFD700');
            await interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'leave') {
            const team = teams.find(t => t.members.includes(interaction.user.id));
            if (!team) return interaction.reply({ content: 'أنت لست في فريق لتخرج منه!', ephemeral: true });
            
            if (team.leader === interaction.user.id) {
                teams.splice(teams.indexOf(team), 1);
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle('💥 تم حذف الفريق').setDescription(`تم حذف فريق **${team.name}** لأنك القائد وخرجت منه.`).setColor('#FFD700')] });
            } else {
                team.members = team.members.filter(id => id !== interaction.user.id);
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle('🚶 تم الخروج').setDescription(`خرجت من فريق **${team.name}**`).setColor('#FFD700')], ephemeral: true });
            }
        }
    },
};
