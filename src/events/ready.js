export default {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`[OK] Logged in as ${client.user.tag}`);
    console.log(`[INFO] Serving ${client.guilds.cache.size} servers`);
    client.user.setActivity('🛡️ Moderating | /help', { type: 3 });
  },
};
