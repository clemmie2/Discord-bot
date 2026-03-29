import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, canModerate } from '../utils/helpers.js';
import { addWarning } from '../data/warnings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }
    if (!canModerate(interaction, target)) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Warn', 'You cannot warn this user. They may have a higher role than you.')] });
    }

    const count = addWarning(interaction.guild.id, target.user.id, {
      reason,
      moderator: interaction.user.tag,
      moderatorId: interaction.user.id,
    });

    await target.send({
      embeds: [errorEmbed(`Warning in ${interaction.guild.name}`,
        `You have received a **warning**.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}\n**Total Warnings:** ${count}`)]
    }).catch(() => {});

    return interaction.editReply({
      embeds: [successEmbed('Member Warned',
        `**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}\n**Total Warnings:** ${count}`)]
    });
  },
};
