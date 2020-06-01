const sql = require('../sql.js');
const helper = require('../helper.js');

module.exports = async (client) => {
  console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);

  client.guilds.cache.forEach(async (guild) => {
    try {
      let guildQuery = await sql.loadGuild(client, guild.id);
      guild.db = guildQuery;
      guild.ready = true;

      guild.members.cache.forEach(async (guildMember) => {
        let memberQuery = await sql.loadGuildMember(guild.id, guildMember.user.id);
        guildMember.db = memberQuery;
      })
    } catch (err) { console.log(err); }
  })
}