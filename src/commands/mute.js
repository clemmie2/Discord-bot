import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, canModerate, hasBotPermission, parseDuration, formatDuration } from '../utils/helpers.js';

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to mute').setRequired(true))
    .addStringOption(opt =>
      opt.setName('duration').setDescription('Duration (e.g. 10m, 1h, 1d) — max 28d').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for mute').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }

    const duration = parseDuration(durationStr);
    if (!duration) {
      return interaction.editReply({ embeds: [errorEmbed('Invalid Duration', 'Please use a valid duration like `10m`, `1h`, `2d`.')] });
    }
    if (duration > MAX_TIMEOUT) {
      return interaction.editReply({ embeds: [errorEmbed('Too Long', 'Maximum timeout duration is **28 days**.')] });
    }

    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.ModerateMembers)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to timeout members.')] });
    }
    if (!canModerate(interaction, target)) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Mute', 'You cannot mute this user. They may have a higher role than you.')] });
    }
    if (!target.moderatable) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Mute', 'I cannot timeout this user. They may have a higher role than me.')] });
    }

    try {
      await target.send({
        embeds: [errorEmbed(`Muted in ${interaction.guild.name}`,
          `You have been **muted** for **${formatDuration(duration)}**.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      }).catch(() => {});

      await target.timeout(duration, `${reason} | Muted by ${interaction.user.tag}`);

      return interaction.editReply({
        embeds: [successEmbed('Member Muted',
          `**User:** ${target.user.tag}\n**Duration:** ${formatDuration(duration)}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Mute Failed', `Could not mute: ${err.message}`)] });
    }
  },
};
