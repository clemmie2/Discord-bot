import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages from a channel')
    .addIntegerOption(opt =>
      opt.setName('amount').setDescription('Number of messages to delete (1-500)').setMinValue(1).setMaxValue(500).setRequired(true))
    .addUserOption(opt =>
      opt.setName('user').setDescription('Only delete messages from this user (optional)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.ManageMessages)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to manage messages.')] });
    }

    try {
      let messages = await interaction.channel.messages.fetch({ limit: targetUser ? 500 : amount });

      if (targetUser) {
        messages = messages.filter(m => m.author.id === targetUser.id).first(amount);
      } else {
        messages = [...messages.values()];
      }

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const deletable = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

      if (deletable.length === 0) {
        return interaction.editReply({ embeds: [errorEmbed('No Messages', 'No deletable messages found (messages older than 14 days cannot be bulk-deleted).')] });
      }

      const deleted = await interaction.channel.bulkDelete(deletable, true);

      return interaction.editReply({
        embeds: [successEmbed('Messages Purged',
          `Deleted **${deleted.size}** message(s)${targetUser ? ` from **${targetUser.tag}**` : ''}.`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Purge Failed', `Could not purge messages: ${err.message}`)] });
    }
  },
};
