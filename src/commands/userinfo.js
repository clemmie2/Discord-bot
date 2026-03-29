import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getWarnings } from '../data/warnings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get detailed info about a member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to look up (defaults to yourself)').setRequired(false)),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user') ?? interaction.member;
    const user = target.user;

    const warnings = getWarnings(interaction.guild.id, user.id);
    const roles = target.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}>`)
      .join(', ') || 'None';

    const status = target.isCommunicationDisabled() ? '🔇 Muted' : '✅ Active';
    const flags = user.flags?.toArray().join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(target.displayHexColor || 0x3498db)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '🆔 User ID', value: user.id, inline: true },
        { name: '📛 Nickname', value: target.nickname || 'None', inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '📥 Joined Server', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:F>`, inline: false },
        { name: '🏆 Highest Role', value: `<@&${target.roles.highest.id}>`, inline: true },
        { name: '🔢 Total Roles', value: `${target.roles.cache.size - 1}`, inline: true },
        { name: '⚠️ Warnings', value: `${warnings.length}`, inline: true },
        { name: '🔖 Status', value: status, inline: true },
        { name: '🚩 Badges', value: flags, inline: true },
        { name: '🎭 Roles', value: roles.length > 1024 ? roles.slice(0, 1020) + '...' : roles, inline: false },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
