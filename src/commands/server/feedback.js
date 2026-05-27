const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('إرسال تقييم أو اقتراح لتطوير السيرفر')
        .setDMPermission(false),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('feedback_modal')
            .setTitle('تقييم السيرفر');

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedback_input')
            .setLabel('ما هو رأيك أو اقتراحك للسيرفر؟')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('اكتب رأيك أو اقتراحك هنا بالتفصيل...');

        const row = new ActionRowBuilder().addComponents(feedbackInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};
