import { getAutomod, addWarning } from '../data/warnings.js';
import { EmbedBuilder } from 'discord.js';

const spamTracker = new Map();
const SPAM_LIMIT = 5;
const SPAM_WINDOW = 5000;

const INVITE_REGEX = /discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[\w-]+/i;
const URL_REGEX = /https?:\/\/[^\s]+/gi;

export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const settings = getAutomod(message.guild.id);
    const member = message.member;
    if (!member) return;

    if (member.permissions.has('ManageMessages')) return;

    const botMember = message.guild.members.me;
    if (!botMember?.permissions.has('ManageMessages')) return;

    const violations = [];

    if (settings.antiSpam) {
      const key = `${message.guild.id}:${message.author.id}`;
      if (!spamTracker.has(key)) spamTracker.set(key, []);
      const timestamps = spamTracker.get(key);
      const now = Date.now();
      timestamps.push(now);
      const recent = timestamps.filter(t => now - t < SPAM_WINDOW);
      spamTracker.set(key, recent);
      if (recent.length >= SPAM_LIMIT) {
        violations.push('spam');
        spamTracker.set(key, []);
      }
    }

    if (settings.antiInvites && INVITE_REGEX.test(message.content)) {
      violations.push('discord invite link');
    }

    if (settings.antiLinks && URL_REGEX.test(message.content) && !INVITE_REGEX.test(message.content)) {
      violations.push('external link');
    }

    if (settings.antiMassMention) {
      const mentions = message.mentions.users.size + message.mentions.roles.size;
      if (mentions >= (settings.massMentionLimit || 5)) {
        violations.push(`mass mention (${mentions} mentions)`);
      }
    }

    if (settings.antiCaps && message.content.length > 10) {
      const upper = (message.content.match(/[A-Z]/g) || []).length;
      const total = (message.content.match(/[a-zA-Z]/g) || []).length;
      if (total > 0 && (upper / total) * 100 >= (settings.capsPercent || 70)) {
        violations.push('excessive caps');
      }
    }

    if (settings.antiProfanity && settings.bannedWords?.length > 0) {
      const lower = message.content.toLowerCase();
      for (const word of settings.bannedWords) {
        if (lower.includes(word.toLowerCase())) {
          violations.push(`banned word`);
          break;
        }
      }
    }

    if (violations.length > 0) {
      try {
        await message.delete();
        const reason = violations.join(', ');
        addWarning(message.guild.id, message.author.id, {
          reason: `[AutoMod] ${reason}`,
          moderator: client.user.tag,
        });

        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('🤖 AutoMod Action')
          .setDescription(`${message.author}, your message was removed.\n**Reason:** ${reason}`)
          .setFooter({ text: 'Keep the server rules in mind!' })
          .setTimestamp();

        const warn = await message.channel.send({ embeds: [embed] });
        setTimeout(() => warn.delete().catch(() => {}), 6000);

        if (settings.logChannel) {
          const logCh = message.guild.channels.cache.get(settings.logChannel);
          if (logCh) {
            const logEmbed = new EmbedBuilder()
              .setColor(0xf39c12)
              .setTitle('📋 AutoMod Log')
              .addFields(
                { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                { name: 'Violation', value: reason, inline: false },
                { name: 'Message Content', value: message.content.slice(0, 1000) || '(empty)', inline: false }
              )
              .setTimestamp();
            logCh.send({ embeds: [logEmbed] }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('[AutoMod] Error handling violation:', err.message);
      }
    }
  },
};
