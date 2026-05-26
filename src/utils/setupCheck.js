const { warningEmbed } = require('./embeds');

/**
 * أداة (Middleware) للتحقق مما إذا كان البوت قد تم إعداده في السيرفر
 * يتم استدعاؤها في بداية تشغيل الأوامر للتأكد من حالة البوت
 * 
 * @param {import('discord.js').CommandInteraction} interaction التفاعل الخاص بالأمر
 * @param {Object} settings إعدادات السيرفر من قاعدة البيانات
 * @returns {boolean} true إذا كان البوت معداً (isSetup: true)، false إذا لم يكن وتم إرسال تحذير
 */
const checkSetup = async (interaction, settings) => {
    // التحقق مما إذا كانت الإعدادات موجودة وتحتوي على خاصية isSetup = true
    if (settings && settings.isSetup === true) {
        return true;
    }

    // إذا لم يكن البوت معداً، نرسل رسالة تحذير
    const embed = warningEmbed(
        'لم يتم إعداد البوت في هذا السيرفر بعد.\n' +
        'يرجى من الإدارة استخدام أمر `/setup` لتهيئة البوت أولاً قبل استخدام باقي الأوامر.'
    );

    // الرد على المستخدم بناءً على حالة التفاعل
    if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    return false;
};

module.exports = {
    checkSetup
};
