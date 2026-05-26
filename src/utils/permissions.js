// دوال التحقق من الصلاحيات بناءً على رتب الإعدادات في قاعدة البيانات
// سيتم استخدام مودل الإعدادات (Settings) لجلب الرتب

/**
 * التحقق مما إذا كان العضو يمتلك رتبة الإدارة (Admin)
 * @param {import('discord.js').GuildMember} member العضو المراد التحقق منه
 * @param {Object} settings إعدادات السيرفر من قاعدة البيانات
 * @returns {boolean}
 */
const isAdmin = (member, settings) => {
    if (!settings || !settings.admin_roles || settings.admin_roles.length === 0) return member.permissions.has('Administrator');
    return settings.admin_roles.some(roleId => member.roles.cache.has(roleId)) || member.permissions.has('Administrator');
};

/**
 * التحقق مما إذا كان العضو يمتلك رتبة الإشراف (Mod) أو أعلى
 * @param {import('discord.js').GuildMember} member العضو المراد التحقق منه
 * @param {Object} settings إعدادات السيرفر من قاعدة البيانات
 * @returns {boolean}
 */
const isMod = (member, settings) => {
    if (isAdmin(member, settings)) return true;
    if (!settings || !settings.mod_roles || settings.mod_roles.length === 0) return false;
    return settings.mod_roles.some(roleId => member.roles.cache.has(roleId));
};

/**
 * التحقق مما إذا كان العضو يمتلك رتبة المساعدة (Helper) أو أعلى
 * @param {import('discord.js').GuildMember} member العضو المراد التحقق منه
 * @param {Object} settings إعدادات السيرفر من قاعدة البيانات
 * @returns {boolean}
 */
const isHelper = (member, settings) => {
    if (isMod(member, settings)) return true;
    if (!settings || !settings.helper_roles || settings.helper_roles.length === 0) return false;
    return settings.helper_roles.some(roleId => member.roles.cache.has(roleId));
};

module.exports = {
    isAdmin,
    isMod,
    isHelper
};
