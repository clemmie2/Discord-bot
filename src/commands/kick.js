import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, canModerate, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for kick').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }
    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.KickMembers)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to kick members.')] });
    }
    if (!canModerate(interaction, target)) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Kick', 'You cannot kick this user. They may have a higher role than you.')] });
    }
    if (!target.kickable) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Kick', 'I cannot kick this user. They may have a higher role than me.')] });
    }

    try {
      await target.send({
        embeds: [errorEmbed(`Kicked from ${interaction.guild.name}`,
          `You have been **kicked**.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      }).catch(() => {});

      await target.kick(`${reason} | Kicked by ${interaction.user.tag}`);

      return interaction.editReply({
        embeds: [successEmbed('Member Kicked',
          `**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Kick Failed', `Could not kick: ${err.message}`)] });
    }
  },
};
