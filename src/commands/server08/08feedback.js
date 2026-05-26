const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('08feedback')
        .setDescription('إرسال تقييم أو رأي عن سيرفر 08'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('feedback_modal')
            .setTitle('تقييم سيرفر 08');

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedback_input')
            .setLabel('ما هو رأيك في السيرفر؟')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('اكتب رأيك أو اقتراحك هنا...');

        const row = new ActionRowBuilder().addComponents(feedbackInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};
