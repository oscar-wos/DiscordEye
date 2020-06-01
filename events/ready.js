const sql = require('../sql.js');
const helper = require('../helper.js');

module.exports = async (client) => {
  console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);

  client.guilds.cache.forEach(async (guild) => {
    try {
      let values = await sql.loadGuild(client, guild.id);
      guild.db = values;
      guild.ready = true;

      console.log(helper.translatePhrase('test', 'en'));
    } catch (err) { console.log(err); }
  })
}