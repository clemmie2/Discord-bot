import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member')
    .addSubcommand(sub =>
      sub.setName('add').setDescription('Add a role to a member')
        .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to add').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('Remove a role from a member')
        .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('User Not Found', 'That user is not in this server.')] });
    }
    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.ManageRoles)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to manage roles.')] });
    }

    const botHighest = interaction.guild.members.me.roles.highest.position;
    if (role.position >= botHighest) {
      return interaction.editReply({ embeds: [errorEmbed('Cannot Assign Role', 'That role is higher than or equal to my highest role.')] });
    }
    if (role.managed) {
      return interaction.editReply({ embeds: [errorEmbed('Managed Role', 'That role is managed by an integration and cannot be manually assigned.')] });
    }

    try {
      if (sub === 'add') {
        if (target.roles.cache.has(role.id)) {
          return interaction.editReply({ embeds: [errorEmbed('Already Has Role', `${target.user.tag} already has the ${role.name} role.`)] });
        }
        await target.roles.add(role, `Role added by ${interaction.user.tag}`);
        return interaction.editReply({
          embeds: [successEmbed('Role Added', `Added **${role.name}** to ${target.user.tag}.`)]
        });
      }

      if (sub === 'remove') {
        if (!target.roles.cache.has(role.id)) {
          return interaction.editReply({ embeds: [errorEmbed('Doesn\'t Have Role', `${target.user.tag} does not have the ${role.name} role.`)] });
        }
        await target.roles.remove(role, `Role removed by ${interaction.user.tag}`);
        return interaction.editReply({
          embeds: [successEmbed('Role Removed', `Removed **${role.name}** from ${target.user.tag}.`)]
        });
      }
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Failed', `Could not modify role: ${err.message}`)] });
    }
  },
};
