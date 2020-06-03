const sql = require('../sql.js');

module.exports = async (client, guild) => {
  try {
    let guildQuery = await sql.loadGuild(client, guild.id);
    guild.db = guildQuery;
    guild.ready = true;
  } catch (err) { console.error(err); }
}