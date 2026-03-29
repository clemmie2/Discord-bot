import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for the current or a specified channel')
    .addIntegerOption(opt =>
      opt.setName('seconds').setDescription('Slowmode delay in seconds (0 to disable, max 21600)').setMinValue(0).setMaxValue(21600).setRequired(true))
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel to apply slowmode to (defaults to current)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.ManageChannels)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to manage channels.')] });
    }

    try {
      await channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);

      const msg = seconds === 0
        ? `Slowmode has been **disabled** in <#${channel.id}>.`
        : `Slowmode set to **${seconds} second(s)** in <#${channel.id}>.`;

      return interaction.editReply({ embeds: [successEmbed('Slowmode Updated', msg)] });
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Failed', `Could not set slowmode: ${err.message}`)] });
    }
  },
};
