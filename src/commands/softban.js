import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, canModerate, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Softban (ban + immediate unban) to kick and delete messages')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to softban').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for softban').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }
    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.BanMembers)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to ban members.')] });
    }
    if (!canModerate(interaction, target)) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Softban', 'You cannot softban this user. They may have a higher role than you.')] });
    }
    if (!target.bannable) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Softban', 'I cannot ban this user. They may have a higher role than me.')] });
    }

    try {
      await target.send({
        embeds: [errorEmbed(`Softbanned from ${interaction.guild.name}`,
          `You have been **softbanned** (kicked + messages deleted).\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      }).catch(() => {});

      await target.ban({
        reason: `[SOFTBAN] ${reason} | By ${interaction.user.tag}`,
        deleteMessageSeconds: 7 * 86400,
      });
      await interaction.guild.bans.remove(target.user.id, 'Softban - auto unban');

      return interaction.editReply({
        embeds: [successEmbed('Member Softbanned',
          `**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}\n**Note:** 7 days of messages deleted, user can rejoin.`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Softban Failed', `Could not softban: ${err.message}`)] });
    }
  },
};
