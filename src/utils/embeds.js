const { EmbedBuilder } = require('discord.js');

// اللون الذهبي لهوية البوت
const COLORS = {
    GOLD: '#FFD700',
    SUCCESS: '#00FF00', // لون أخضر للنجاح
    ERROR: '#FF0000',   // لون أحمر للخطأ
    WARNING: '#FFA500', // لون برتقالي للتحذير
    INFO: '#FFD700'     // لون ذهبي للمعلومات متوافق مع هوية البوت
};

/**
 * إنشاء رسالة مضمنة (Embed) أساسية باللون الذهبي
 * @returns {EmbedBuilder}
 */
const baseEmbed = () => {
    return new EmbedBuilder().setColor(COLORS.GOLD);
};

/**
 * رسالة نجاح
 * @param {string} description وصف الرسالة
 * @returns {EmbedBuilder}
 */
const successEmbed = (description) => {
    return new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle('✅ نجاح')
        .setDescription(description);
};

/**
 * رسالة خطأ
 * @param {string} description وصف الخطأ
 * @returns {EmbedBuilder}
 */
const errorEmbed = (description) => {
    return new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle('❌ خطأ')
        .setDescription(description);
};

/**
 * رسالة تحذير
 * @param {string} description وصف التحذير
 * @returns {EmbedBuilder}
 */
const warningEmbed = (description) => {
    return new EmbedBuilder()
        .setColor(COLORS.WARNING)
        .setTitle('⚠️ تحذير')
        .setDescription(description);
};

/**
 * رسالة معلومات
 * @param {string} description المعلومات
 * @returns {EmbedBuilder}
 */
const infoEmbed = (description) => {
    return new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle('ℹ️ معلومات')
        .setDescription(description);
};

module.exports = {
    baseEmbed,
    successEmbed,
    errorEmbed,
    warningEmbed,
    infoEmbed,
    COLORS
};
