import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, hasBotPermission } from '../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock or unlock a channel to prevent members from sending messages')
    .addSubcommand(sub =>
      sub.setName('lock').setDescription('Lock the channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to lock (default: current)').setRequired(false))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for lockdown').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('unlock').setDescription('Unlock the channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to unlock (default: current)').setRequired(false))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for unlock').setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!hasBotPermission(interaction.guild, PermissionFlagsBits.ManageChannels)) {
      return interaction.editReply({ embeds: [errorEmbed('Missing Permissions', 'I do not have permission to manage channels.')] });
    }

    const everyone = interaction.guild.roles.everyone;

    try {
      if (sub === 'lock') {
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: false,
          SendMessagesInThreads: false,
        }, { reason: `Locked by ${interaction.user.tag}: ${reason}` });

        await channel.send({
          embeds: [errorEmbed('Channel Locked 🔒', `This channel has been locked by a moderator.\n**Reason:** ${reason}`)]
        }).catch(() => {});

        return interaction.editReply({
          embeds: [successEmbed('Channel Locked', `<#${channel.id}> has been **locked**.\n**Reason:** ${reason}`)]
        });
      }

      if (sub === 'unlock') {
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: null,
          SendMessagesInThreads: null,
        }, { reason: `Unlocked by ${interaction.user.tag}: ${reason}` });

        await channel.send({
          embeds: [successEmbed('Channel Unlocked 🔓', `This channel has been unlocked.\n**Reason:** ${reason}`)]
        }).catch(() => {});

        return interaction.editReply({
          embeds: [successEmbed('Channel Unlocked', `<#${channel.id}> has been **unlocked**.\n**Reason:** ${reason}`)]
        });
      }
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Failed', `Could not ${sub} channel: ${err.message}`)] });
    }
  },
};
