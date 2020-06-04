const sql = require('../sql.js');

module.exports = async (client, guild) => {
  try {
    let guildQuery = await sql.loadGuild(client, guild.id);
    guild.db = guildQuery;
    guild.ready = true;

    if (guildQuery.log.webhook.id != null) guild.logHook = await client.fetchWebhook(guildQuery.log.webhook.id, guildQuery.log.webhook.token);
  } catch { }
}