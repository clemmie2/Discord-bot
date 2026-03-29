import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by their ID')
    .addStringOption(opt =>
      opt.setName('user_id').setDescription('The user ID to unban').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for unban').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.BanMembers)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to unban members.')] });
    }

    try {
      const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!ban) {
        return interaction.editReply({ embeds: [errorEmbed('Not Banned', `User ID \`${userId}\` is not currently banned.`)] });
      }

      await interaction.guild.bans.remove(userId, `${reason} | Unbanned by ${interaction.user.tag}`);

      return interaction.editReply({
        embeds: [successEmbed('User Unbanned',
          `**User:** ${ban.user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Unban Failed', `Could not unban user \`${userId}\`: ${err.message}`)] });
    }
  },
};
