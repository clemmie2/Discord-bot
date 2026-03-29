import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const COLORS = {
  SUCCESS: 0x2ecc71,
  ERROR: 0xe74c3c,
  WARNING: 0xf39c12,
  INFO: 0x3498db,
  MOD: 0x9b59b6,
};

export function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function warnEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function modEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.MOD)
    .setTitle(`🛡️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function parseDuration(str) {
  if (!str) return null;
  const ms = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  return parseInt(match[1]) * ms[match[2].toLowerCase()];
}

export function formatDuration(ms) {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.round(ms / 3600000)}h`;
  return `${Math.round(ms / 86400000)}d`;
}

export function canModerate(interaction, target) {
  const member = interaction.member;
  const guild = interaction.guild;

  if (target.id === guild.ownerId) return false;
  if (target.id === interaction.user.id) return false;
  if (member.id === guild.ownerId) return true;

  const executorHighest = member.roles.highest.position;
  const targetHighest = target.roles.highest.position;

  return executorHighest > targetHighest;
}

export function hasBotPermission(guild, ...perms) {
  const bot = guild.members.me;
  if (!bot) return false;
  return bot.permissions.has(perms);
}
