const warnings = new Map();
const mutedUsers = new Map();
const automodSettings = new Map();

export function addWarning(guildId, userId, warning) {
  const key = `${guildId}:${userId}`;
  if (!warnings.has(key)) warnings.set(key, []);
  warnings.get(key).push({ ...warning, id: Date.now(), timestamp: new Date().toISOString() });
  return warnings.get(key).length;
}

export function getWarnings(guildId, userId) {
  const key = `${guildId}:${userId}`;
  return warnings.get(key) || [];
}

export function clearWarnings(guildId, userId) {
  const key = `${guildId}:${userId}`;
  const count = (warnings.get(key) || []).length;
  warnings.delete(key);
  return count;
}

export function removeWarning(guildId, userId, warnId) {
  const key = `${guildId}:${userId}`;
  const list = warnings.get(key) || [];
  const idx = list.findIndex(w => w.id === warnId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  warnings.set(key, list);
  return true;
}

export function setMuted(guildId, userId, data) {
  mutedUsers.set(`${guildId}:${userId}`, data);
}

export function getMuted(guildId, userId) {
  return mutedUsers.get(`${guildId}:${userId}`);
}

export function removeMuted(guildId, userId) {
  mutedUsers.delete(`${guildId}:${userId}`);
}

export function setAutomod(guildId, settings) {
  automodSettings.set(guildId, { ...(automodSettings.get(guildId) || {}), ...settings });
}

export function getAutomod(guildId) {
  return automodSettings.get(guildId) || {
    antiSpam: false,
    antiLinks: false,
    antiInvites: false,
    antiMassMention: false,
    massMentionLimit: 5,
    antiCaps: false,
    capsPercent: 70,
    antiProfanity: false,
    bannedWords: [],
    logChannel: null,
  };
}
