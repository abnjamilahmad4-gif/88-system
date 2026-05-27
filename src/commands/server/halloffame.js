const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const HallOfFame = require('../../models/HallOfFame');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('halloffame')
        .setDescription('إدارة وقاعة المشاهير للسيرفر')
        .addSubcommand(sub => 
            sub.setName('add')
                .setDescription('إضافة عضو لقاعة المشاهير (للإدارة)')
                .addUserOption(opt => opt.setName('user').setDescription('العضو المراد إضافته').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('سبب الإضافة').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('remove')
                .setDescription('إزالة عضو من قاعة المشاهير (للإدارة)')
                .addUserOption(opt => opt.setName('user').setDescription('العضو المراد إزالته').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('list')
                .setDescription('عرض قاعة المشاهير'))
        .setDMPermission(false),
        
    async execute(interaction) {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'list') {
            const list = await HallOfFame.find({ guildId: interaction.guild.id }).sort({ addedAt: 1 });
            if (list.length === 0) {
                return interaction.reply({ content: 'قاعة المشاهير فارغة حالياً.', ephemeral: true });
            }
            
            const embed = new EmbedBuilder()
                .setTitle('🌟 قاعة المشاهير | Hall of Fame 🌟')
                .setColor(config.colors?.primary || '#FFD700')
                .setTimestamp();
                
            list.forEach((u, i) => {
                embed.addFields({ name: `✨ ${i+1}.`, value: `<@${u.userId}>\nالسبب: ${u.reason}` });
            });
            
            await interaction.reply({ embeds: [embed] });
            
        } else {
            // التحقق من الصلاحيات للإضافة والحذف
            const isOwner = interaction.user.id === interaction.guild.ownerId;
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            
            if (!isOwner && !isAdmin) {
                return interaction.reply({ content: '❌ هذا الأمر مخصص للإدارة أو مالك السيرفر فقط.', ephemeral: true });
            }
            
            if (subCmd === 'add') {
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason');
                
                const existing = await HallOfFame.findOne({ guildId: interaction.guild.id, userId: user.id });
                if (existing) {
                    return interaction.reply({ content: '❌ هذا العضو موجود بالفعل في قاعة المشاهير.', ephemeral: true });
                }
                
                const newItem = new HallOfFame({
                    guildId: interaction.guild.id,
                    userId: user.id,
                    reason: reason
                });
                await newItem.save();
                
                const embed = new EmbedBuilder()
                    .setTitle('🌟 إضافة لقاعة المشاهير 🌟')
                    .setDescription(`تمت إضافة <@${user.id}> لقاعة المشاهير!\n**السبب:** ${reason}`)
                    .setColor(config.colors?.primary || '#FFD700');
                    
                await interaction.reply({ embeds: [embed] });
                
            } else if (subCmd === 'remove') {
                const user = interaction.options.getUser('user');
                
                const result = await HallOfFame.findOneAndDelete({ guildId: interaction.guild.id, userId: user.id });
                if (!result) {
                    return interaction.reply({ content: '❌ هذا العضو ليس في قاعة المشاهير.', ephemeral: true });
                }
                
                await interaction.reply({ content: `✅ تم إزالة <@${user.id}> من قاعة المشاهير بنجاح.` });
            }
        }
    },
};

