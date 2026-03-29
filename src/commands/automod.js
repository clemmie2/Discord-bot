import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { errorEmbed, successEmbed, infoEmbed } from '../utils/helpers.js';
import { setAutomod, getAutomod } from '../data/warnings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure AutoMod settings')
    .addSubcommand(sub =>
      sub.setName('status').setDescription('View current AutoMod settings'))
    .addSubcommand(sub =>
      sub.setName('antispam').setDescription('Toggle anti-spam protection')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('antilinks').setDescription('Toggle blocking of external links')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('antiinvites').setDescription('Toggle blocking of Discord invites')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('antimention').setDescription('Toggle anti-mass-mention protection')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true))
        .addIntegerOption(opt => opt.setName('limit').setDescription('Max mentions before action (default 5)').setMinValue(2).setMaxValue(20).setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('anticaps').setDescription('Toggle anti-caps protection')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true))
        .addIntegerOption(opt => opt.setName('percent').setDescription('Caps % threshold (default 70)').setMinValue(50).setMaxValue(100).setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('antiprofanity').setDescription('Toggle profanity filter')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('addword').setDescription('Add a banned word to the profanity filter')
        .addStringOption(opt => opt.setName('word').setDescription('Word to ban').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('removeword').setDescription('Remove a word from the profanity filter')
        .addStringOption(opt => opt.setName('word').setDescription('Word to remove').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('logchannel').setDescription('Set the channel for AutoMod logs')
        .addChannelOption(opt => opt.setName('channel').setDescription('Log channel').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  cooldown: 3,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const settings = getAutomod(guildId);

    if (sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('🤖 AutoMod Settings')
        .addFields(
          { name: '🛡️ Anti-Spam', value: settings.antiSpam ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '🔗 Anti-Links', value: settings.antiLinks ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '📨 Anti-Invites', value: settings.antiInvites ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '📢 Anti-Mass Mention', value: settings.antiMassMention ? `✅ Enabled (limit: ${settings.massMentionLimit})` : '❌ Disabled', inline: true },
          { name: '🔤 Anti-Caps', value: settings.antiCaps ? `✅ Enabled (${settings.capsPercent}%)` : '❌ Disabled', inline: true },
          { name: '🤬 Profanity Filter', value: settings.antiProfanity ? `✅ Enabled (${settings.bannedWords?.length || 0} words)` : '❌ Disabled', inline: true },
          { name: '📋 Log Channel', value: settings.logChannel ? `<#${settings.logChannel}>` : 'Not set', inline: true },
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'antispam') {
      const enabled = interaction.options.getBoolean('enabled');
      setAutomod(guildId, { antiSpam: enabled });
      return interaction.editReply({ embeds: [successEmbed('Anti-Spam', `Anti-spam is now **${enabled ? 'enabled' : 'disabled'}**.`)] });
    }
    if (sub === 'antilinks') {
      const enabled = interaction.options.getBoolean('enabled');
      setAutomod(guildId, { antiLinks: enabled });
      return interaction.editReply({ embeds: [successEmbed('Anti-Links', `Anti-links is now **${enabled ? 'enabled' : 'disabled'}**.`)] });
    }
    if (sub === 'antiinvites') {
      const enabled = interaction.options.getBoolean('enabled');
      setAutomod(guildId, { antiInvites: enabled });
      return interaction.editReply({ embeds: [successEmbed('Anti-Invites', `Anti-invites is now **${enabled ? 'enabled' : 'disabled'}**.`)] });
    }
    if (sub === 'antimention') {
      const enabled = interaction.options.getBoolean('enabled');
      const limit = interaction.options.getInteger('limit') ?? settings.massMentionLimit ?? 5;
      setAutomod(guildId, { antiMassMention: enabled, massMentionLimit: limit });
      return interaction.editReply({ embeds: [successEmbed('Anti-Mass-Mention', `Anti-mass-mention is now **${enabled ? 'enabled' : 'disabled'}** (limit: ${limit}).`)] });
    }
    if (sub === 'anticaps') {
      const enabled = interaction.options.getBoolean('enabled');
      const percent = interaction.options.getInteger('percent') ?? settings.capsPercent ?? 70;
      setAutomod(guildId, { antiCaps: enabled, capsPercent: percent });
      return interaction.editReply({ embeds: [successEmbed('Anti-Caps', `Anti-caps is now **${enabled ? 'enabled' : 'disabled'}** (threshold: ${percent}%).`)] });
    }
    if (sub === 'antiprofanity') {
      const enabled = interaction.options.getBoolean('enabled');
      setAutomod(guildId, { antiProfanity: enabled });
      return interaction.editReply({ embeds: [successEmbed('Profanity Filter', `Profanity filter is now **${enabled ? 'enabled' : 'disabled'}**.`)] });
    }
    if (sub === 'addword') {
      const word = interaction.options.getString('word').toLowerCase().trim();
      const words = settings.bannedWords || [];
      if (words.includes(word)) {
        return interaction.editReply({ embeds: [errorEmbed('Already Exists', `\`${word}\` is already in the banned words list.`)] });
      }
      words.push(word);
      setAutomod(guildId, { bannedWords: words });
      return interaction.editReply({ embeds: [successEmbed('Word Added', `\`${word}\` has been added to the banned words list. (${words.length} total)`)] });
    }
    if (sub === 'removeword') {
      const word = interaction.options.getString('word').toLowerCase().trim();
      const words = (settings.bannedWords || []).filter(w => w !== word);
      setAutomod(guildId, { bannedWords: words });
      return interaction.editReply({ embeds: [successEmbed('Word Removed', `\`${word}\` has been removed from the banned words list. (${words.length} remaining)`)] });
    }
    if (sub === 'logchannel') {
      const channel = interaction.options.getChannel('channel');
      setAutomod(guildId, { logChannel: channel.id });
      return interaction.editReply({ embeds: [successEmbed('Log Channel Set', `AutoMod logs will be sent to <#${channel.id}>.`)] });
    }
  },
};
