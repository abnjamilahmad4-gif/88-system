const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Ø¥Ø±Ø³Ø§Ù„ ØªÙ‚ÙŠÙŠÙ… Ø£Ùˆ Ø±Ø£ÙŠ Ø¹Ù† Ø³ÙŠØ±ÙØ± 08')
        .setDMPermission(false),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('feedback_modal')
            .setTitle('ØªÙ‚ÙŠÙŠÙ… Ø³ÙŠØ±ÙØ± 08');

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedback_input')
            .setLabel('Ù…Ø§ Ù‡Ùˆ Ø±Ø£ÙŠÙƒ ÙÙŠ Ø§Ù„Ø³ÙŠØ±ÙØ±ØŸ')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('Ø§ÙƒØªØ¨ Ø±Ø£ÙŠÙƒ Ø£Ùˆ Ø§Ù‚ØªØ±Ø§Ø­Ùƒ Ù‡Ù†Ø§...');

        const row = new ActionRowBuilder().addComponents(feedbackInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};

