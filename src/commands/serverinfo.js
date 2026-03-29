import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const VERIFICATION_LEVELS = ['None', 'Low', 'Medium', 'High', 'Very High'];
const NSFW_LEVELS = ['Default', 'Explicit', 'Safe', 'Age-Restricted'];

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get detailed info about this server'),

  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply();

    const guild = interaction.guild;
    await guild.fetch();

    const owner = await guild.fetchOwner();
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;
    const categoryChannels = channels.filter(c => c.type === 4).size;

    const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline' && m.presence?.status).size;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🏰 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: owner.user.tag, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '👥 Members', value: `Total: ${guild.memberCount}\nOnline: ${onlineMembers}`, inline: true },
        { name: '📺 Channels', value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categoryChannels}`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🔒 Verification', value: VERIFICATION_LEVELS[guild.verificationLevel] || 'Unknown', inline: true },
        { name: '🔞 NSFW Level', value: NSFW_LEVELS[guild.nsfwLevel] || 'Unknown', inline: true },
        { name: '✨ Boosts', value: `${guild.premiumSubscriptionCount || 0} (Tier ${guild.premiumTier})`, inline: true },
        { name: '🌍 Region', value: guild.preferredLocale, inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) || null)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
