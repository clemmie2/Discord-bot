import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(pathToFileURL(filePath).href);
  if ('data' in command.default && 'execute' in command.default) {
    commands.push(command.default.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[INFO] Registering ${commands.length} slash commands...`);

    let data;
    if (process.env.GUILD_ID) {
      data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`[OK] Registered ${data.length} commands to guild ${process.env.GUILD_ID} (instant).`);
    } else {
      data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(`[OK] Registered ${data.length} commands globally (may take up to 1 hour to propagate).`);
    }
  } catch (error) {
    console.error('[ERROR] Failed to deploy commands:', error);
  }
})();
