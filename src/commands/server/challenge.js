const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('تحدي فريق آخر في السيرفر')
        .addStringOption(opt => opt.setName('team').setDescription('اسم الفريق المراد تحديه').setRequired(true))
        .addStringOption(opt => opt.setName('game').setDescription('اللعبة أو نوع التحدي').setRequired(true)),
    async execute(interaction) {
        const targetTeam = interaction.options.getString('team');
        const game = interaction.options.getString('game');

        const embed = new EmbedBuilder()
            .setTitle('⚔️ تحدي جديد! ⚔️')
            .setDescription(`لقد أعلن <@${interaction.user.id}> التحدي ضد فريق **${targetTeam}**!`)
            .addFields(
                { name: '🎮 اللعبة / التحدي', value: game }
            )
            .setColor('#FFD700')
            .setFooter({ text: 'سيرفر 08 - التحديات' });

        await interaction.reply({ embeds: [embed] });
    },
};

