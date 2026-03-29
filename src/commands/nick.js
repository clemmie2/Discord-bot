import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, canModerate, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription("Change or reset a member's nickname")
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to rename').setRequired(true))
    .addStringOption(opt =>
      opt.setName('nickname').setDescription('New nickname (leave empty to reset)').setRequired(false).setMaxLength(32))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const nickname = interaction.options.getString('nickname') ?? null;

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }
    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.ManageNicknames)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to manage nicknames.')] });
    }
    if (!canModerate(interaction, target)) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Rename', 'You cannot change this user\'s nickname. They may have a higher role than you.')] });
    }

    try {
      const oldNick = target.nickname || target.user.username;
      await target.setNickname(nickname, `Nick changed by ${interaction.user.tag}`);

      const msg = nickname
        ? `**${target.user.tag}**'s nickname changed from \`${oldNick}\` to \`${nickname}\`.`
        : `**${target.user.tag}**'s nickname has been reset.`;

      return interaction.editReply({ embeds: [successEmbed('Nickname Updated', msg)] });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Failed', `Could not change nickname: ${err.message}`)] });
    }
  },
};
