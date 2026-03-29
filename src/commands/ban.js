import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, canModerate, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to ban').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for ban').setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('delete_messages')
        .setDescription('Delete messages from last N days (0-7)')
        .setMinValue(0).setMaxValue(7).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_messages') ?? 0;

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }
    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.BanMembers)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to ban members.')] });
    }
    if (!canModerate(interaction, target)) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Ban', 'You cannot ban this user. They may have a higher role than you.')] });
    }
    if (!target.bannable) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Ban', 'I cannot ban this user. They may have a higher role than me.')] });
    }

    try {
      await target.send({
        embeds: [errorEmbed(`Banned from ${interaction.guild.name}`,
          `You have been **banned**.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      }).catch(() => {});

      await target.ban({
        reason: `${reason} | Banned by ${interaction.user.tag}`,
        deleteMessageSeconds: deleteDays * 86400,
      });

      return interaction.editReply({
        embeds: [successEmbed('Member Banned',
          `**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}\n**Messages Deleted:** ${deleteDays} day(s)`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Ban Failed', `Could not ban: ${err.message}`)] });
    }
  },
};
