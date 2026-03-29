import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const COMMANDS = [
  { category: '🔨 Moderation', commands: [
    { name: '/ban', desc: 'Ban a member from the server' },
    { name: '/unban', desc: 'Unban a user by their ID' },
    { name: '/softban', desc: 'Kick + delete messages (user can rejoin)' },
    { name: '/kick', desc: 'Kick a member from the server' },
    { name: '/mute', desc: 'Timeout (mute) a member for a duration' },
    { name: '/unmute', desc: 'Remove timeout from a member' },
    { name: '/warn', desc: 'Issue a warning to a member' },
    { name: '/warnings list/clear/remove', desc: 'Manage member warnings' },
    { name: '/banlist', desc: 'View all banned users' },
  ]},
  { category: '🗑️ Messages', commands: [
    { name: '/purge', desc: 'Bulk delete up to 100 messages' },
  ]},
  { category: '⚙️ Channel & Role Management', commands: [
    { name: '/slowmode', desc: 'Set channel slowmode delay' },
    { name: '/lockdown lock/unlock', desc: 'Lock/unlock a channel' },
    { name: '/nick', desc: "Change a member's nickname" },
    { name: '/role add/remove', desc: 'Add or remove roles from members' },
  ]},
  { category: '🤖 AutoMod', commands: [
    { name: '/automod status', desc: 'View AutoMod settings' },
    { name: '/automod antispam', desc: 'Toggle spam protection' },
    { name: '/automod antilinks', desc: 'Toggle link blocking' },
    { name: '/automod antiinvites', desc: 'Toggle invite blocking' },
    { name: '/automod antimention', desc: 'Toggle mass-mention protection' },
    { name: '/automod anticaps', desc: 'Toggle excessive caps filter' },
    { name: '/automod antiprofanity', desc: 'Toggle profanity filter' },
    { name: '/automod addword/removeword', desc: 'Manage banned words' },
    { name: '/automod logchannel', desc: 'Set AutoMod log channel' },
  ]},
  { category: '📊 Info', commands: [
    { name: '/userinfo', desc: 'View info about a user' },
    { name: '/serverinfo', desc: 'View info about this server' },
    { name: '/help', desc: 'Show this command list' },
  ]},
];

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  cooldown: 5,

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🛡️ Moderation Bot — Command List')
      .setDescription('A powerful moderation bot with slash commands.')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    for (const cat of COMMANDS) {
      embed.addFields({
        name: cat.category,
        value: cat.commands.map(c => `\`${c.name}\` — ${c.desc}`).join('\n'),
      });
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
