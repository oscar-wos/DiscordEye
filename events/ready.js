const sql = require('../sql.js');

module.exports = async (client) => {
  console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);

  for (let guild of client.guilds.cache.values()) {
    try {
      let guildQuery = await sql.loadGuild(client, guild.id);
      guild.db = guildQuery;
      guild.ready = true;
    } catch (err) { console.error(err); }
  }
}