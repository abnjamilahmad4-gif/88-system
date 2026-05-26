const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const XP = require('../../models/XP');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('عرض مستوى وخبرة العضو')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('العضو المراد عرض مستواه')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        
        let userXP = await XP.findOne({ guildId: interaction.guild.id, userId: target.id });
        if (!userXP) {
            return interaction.reply({ 
                content: `❌ لا توجد بيانات لـ ${target}. يجب أن يرسل رسائل أولاً!`, 
                ephemeral: true 
            });
        }

        // حساب الترتيب
        const allUsers = await XP.find({ guildId: interaction.guild.id }).sort({ level: -1, xp: -1 });
        const userRank = allUsers.findIndex(u => u.userId === target.id) + 1;

        const multiplier = config.xp?.levelUpMultiplier || 100;
        const nextLevelXp = (userXP.level + 1) * multiplier;

        // شريط التقدم
        const progress = Math.floor((userXP.xp / nextLevelXp) * 20);
        const progressBar = '█'.repeat(progress) + '░'.repeat(20 - progress);
        const percentage = Math.floor((userXP.xp / nextLevelXp) * 100);

        const embed = new EmbedBuilder()
            .setAuthor({ name: target.username, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setTitle(`${config.emojis?.xp || '✨'} بطاقة المستوى`)
            .setColor(config.colors?.primary || '#FFD700')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: `${config.emojis?.trophy || '🏆'} الترتيب`, value: `#${userRank}`, inline: true },
                { name: `${config.emojis?.level || '📊'} المستوى`, value: `${userXP.level}`, inline: true },
                { name: `${config.emojis?.xp || '✨'} الخبرة`, value: `${userXP.xp} / ${nextLevelXp}`, inline: true },
                { name: `${config.emojis?.text || '💬'} الرسائل`, value: `${userXP.messages || 0}`, inline: true },
                { name: `${config.emojis?.voice || '🎤'} دقائق الصوت`, value: `${userXP.voiceMinutes || 0}`, inline: true },
                { name: '📈 التقدم', value: `\`${progressBar}\` ${percentage}%` }
            )
            .setFooter({ text: 'سيرفر 08 — نظام المستويات', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
