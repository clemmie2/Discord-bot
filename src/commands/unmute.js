import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, canModerate, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout (unmute) a member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to unmute').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for unmute').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }
    if (!target.isCommunicationDisabled()) {
      return interaction.editReply({ embeds: [errorEmbed('Not Muted', 'This user is not currently muted.')] });
    }
    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.ModerateMembers)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to remove timeouts.')] });
    }
    if (!canModerate(interaction, target)) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Unmute', 'You cannot unmute this user.')] });
    }

    try {
      await target.timeout(null, `${reason} | Unmuted by ${interaction.user.tag}`);

      await target.send({
        embeds: [successEmbed(`Unmuted in ${interaction.guild.name}`,
          `You have been **unmuted**.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      }).catch(() => {});

      return interaction.editReply({
        embeds: [successEmbed('Member Unmuted',
          `**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Unmute Failed', `Could not unmute: ${err.message}`)] });
    }
  },
};
