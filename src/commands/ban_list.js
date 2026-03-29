import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { errorEmbed, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('View the list of all banned users in this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.BanMembers)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to view the ban list.')] });
    }

    try {
      const bans = await interaction.guild.bans.fetch();

      if (bans.size === 0) {
        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle('📋 Ban List')
          .setDescription('No users are currently banned from this server.')
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }

      const banList = bans.map(b => `**${b.user.tag}** (${b.user.id})\n> ${b.reason || 'No reason'}`).join('\n\n');
      const chunks = [];
      let current = '';

      for (const line of banList.split('\n\n')) {
        if (current.length + line.length + 2 > 4000) {
          chunks.push(current);
          current = line;
        } else {
          current += (current ? '\n\n' : '') + line;
        }
      }
      if (current) chunks.push(current);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`📋 Ban List — ${bans.size} banned user(s)`)
        .setDescription(chunks[0] || 'See below')
        .setFooter({ text: `Page 1/${chunks.length}` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Failed', `Could not fetch ban list: ${err.message}`)] });
    }
  },
};
