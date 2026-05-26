const { Canvas, loadImage } = require('skia-canvas');

/**
 * وظائف بناء الصور والبطاقات باستخدام skia-canvas
 */

// اللون الذهبي الأساسي لهوية البوت 88
const GOLD_COLOR = '#FFD700';
const BG_COLOR = '#1A1A1A'; // خلفية داكنة لتبرز اللون الذهبي
const TEXT_COLOR = '#FFFFFF';

/**
 * رسم بطاقة المستوى (Rank Card) باللون الذهبي
 * @param {Object} options خيارات البطاقة
 * @param {string} options.username اسم المستخدم
 * @param {string} options.avatarUrl رابط الصورة الشخصية
 * @param {number} options.level المستوى الحالي
 * @param {number} options.currentXp نقاط الخبرة الحالية
 * @param {number} options.requiredXp نقاط الخبرة المطلوبة للمستوى التالي
 * @param {number} options.rank الترتيب العام في السيرفر
 * @returns {Promise<Buffer>} صورة البطاقة كـ Buffer يمكن إرسالها في رسالة Discord
 */
const generateRankCard = async ({ username, avatarUrl, level, currentXp, requiredXp, rank }) => {
    // إعداد أبعاد البطاقة
    const width = 800;
    const height = 250;
    
    // إنشاء لوحة الرسم
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. رسم الخلفية
    ctx.fillStyle = BG_COLOR;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 20); // حواف دائرية
    ctx.fill();

    // إضافة حدود ذهبية للبطاقة
    ctx.strokeStyle = GOLD_COLOR;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. تحميل ورسم الصورة الشخصية
    try {
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        // رسم دائرة للإطار حول الصورة
        ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip(); // القص لتكون الصورة دائرية
        // رسم الصورة
        ctx.drawImage(avatar, 45, 45, 160, 160);
        ctx.restore();
        
        // رسم إطار ذهبي حول الصورة الشخصية
        ctx.beginPath();
        ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
        ctx.strokeStyle = GOLD_COLOR;
        ctx.lineWidth = 6;
        ctx.stroke();
    } catch (error) {
        console.error('Failed to load avatar:', error);
        // Fallback في حال فشل تحميل الصورة
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.strokeStyle = GOLD_COLOR;
        ctx.lineWidth = 6;
        ctx.stroke();
    }

    // 3. كتابة اسم المستخدم
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(username, 250, 100);

    // 4. كتابة المستوى والترتيب
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = GOLD_COLOR;
    ctx.fillText(`Level: ${level}`, 600, 70);
    ctx.fillText(`Rank: #${rank}`, 600, 110);

    // 5. رسم شريط الخبرة (XP Bar)
    const xpBarWidth = 500;
    const xpBarHeight = 30;
    const xpBarX = 250;
    const xpBarY = 160;
    const xpPercentage = Math.min(Math.max(currentXp / requiredXp, 0), 1);

    // خلفية الشريط داكنة
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.roundRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight, 15);
    ctx.fill();

    // الجزء الممتلئ من الشريط (باللون الذهبي)
    if (xpPercentage > 0) {
        ctx.fillStyle = GOLD_COLOR;
        ctx.beginPath();
        ctx.roundRect(xpBarX, xpBarY, xpBarWidth * xpPercentage, xpBarHeight, 15);
        ctx.fill();
    }

    // 6. كتابة نص الخبرة داخل/فوق الشريط
    ctx.font = '20px sans-serif';
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(`${currentXp} / ${requiredXp} XP`, 450, 150);

    // إرجاع الصورة كـ Buffer
    return await canvas.toBuffer('image/png');
};

module.exports = {
    generateRankCard
};
