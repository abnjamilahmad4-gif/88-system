const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Partner = require('../../models/Partner');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partners')
        .setDescription('قائمة شركاء السيرفر')
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('عرض قائمة شركاء السيرفر')
        )
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('إضافة شريك جديد للقائمة (للإدارة)')
                .addStringOption(opt => opt.setName('name').setDescription('اسم السيرفر الشريك').setRequired(true))
                .addStringOption(opt => opt.setName('description').setDescription('وصف السيرفر الشريك').setRequired(true))
                .addStringOption(opt => opt.setName('invite').setDescription('رابط دعوة السيرفر الشريك').setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('إزالة شريك من القائمة (للإدارة)')
                .addStringOption(opt => opt.setName('name').setDescription('اسم السيرفر الشريك المراد إزالته').setRequired(true))
        )
        .setDMPermission(false),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            let partners = await Partner.find({ guildId: interaction.guild.id }).sort({ order: 1 });

            // إذا كانت قاعدة البيانات فارغة، نقوم بالتهيئة التلقائية (Seeding) بالشركاء المطلوبة
            if (partners.length === 0) {
                const defaultPartners = [
                    {
                        guildId: interaction.guild.id,
                        name: '808 collage',
                        description: 'وهو الاقوة',
                        inviteUrl: 'https://discord.gg/', // افتراضي
                        order: 1
                    },
                    {
                        guildId: interaction.guild.id,
                        name: 'شريك آخر',
                        description: 'لا يوجد لحد الان',
                        inviteUrl: '',
                        order: 2
                    }
                ];
                await Partner.insertMany(defaultPartners);
                partners = await Partner.find({ guildId: interaction.guild.id }).sort({ order: 1 });
            }

            const embed = new EmbedBuilder()
                .setTitle('🤝 شركاء السيرفر | Partners 🤝')
                .setDescription('نحن فخورون بشراكاتنا مع هذه السيرفرات المميزة:')
                .setColor(config.colors?.primary || '#FFD700')
                .setFooter({ text: 'للشراكة يرجى فتح تذكرة' })
                .setTimestamp();

            partners.forEach((partner) => {
                const inviteLink = partner.inviteUrl ? `\n🔗 **رابط الدعوة:** ${partner.inviteUrl}` : '';
                embed.addFields({
                    name: `🤝 ${partner.name}`,
                    value: `${partner.description}${inviteLink}`,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [embed] });

        } else {
            // التحقق من الصلاحيات للإضافة والحذف
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ هذا الأمر مخصص لمدراء السيرفر فقط.', ephemeral: true });
            }

            if (subcommand === 'add') {
                const name = interaction.options.getString('name');
                const description = interaction.options.getString('description');
                const invite = interaction.options.getString('invite') || '';

                // التحقق من عدم تكراره بنفس الاسم
                const existing = await Partner.findOne({ guildId: interaction.guild.id, name: name });
                if (existing) {
                    return interaction.reply({ content: `❌ هذا الشريك مضاف بالفعل بنفس الاسم.`, ephemeral: true });
                }

                const count = await Partner.countDocuments({ guildId: interaction.guild.id });
                const newPartner = new Partner({
                    guildId: interaction.guild.id,
                    name: name,
                    description: description,
                    inviteUrl: invite,
                    order: count + 1
                });
                await newPartner.save();

                await interaction.reply({ content: `✅ تم إضافة السيرفر الشريك **${name}** بنجاح!` });

            } else if (subcommand === 'remove') {
                const name = interaction.options.getString('name');

                const result = await Partner.findOneAndDelete({ guildId: interaction.guild.id, name: name });
                if (!result) {
                    return interaction.reply({ content: `❌ لا يوجد شريك بهذا الاسم في القائمة.`, ephemeral: true });
                }

                await interaction.reply({ content: `✅ تم إزالة الشريك **${name}** من القائمة بنجاح.` });
            }
        }
    }
};
