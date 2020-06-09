const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['prefix', 'p'],
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    return new Promise(async (resolve, reject) => {
      try {
         if (!args[1]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('prefix_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));
         
         message.guild.db.prefix = args[1];
         await sql.updatePrefix(message.guild.id, args[1]);
         resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('prefix_updated', message.guild.db.lang), args[1]), helper.messageType.SUCCESS));
      } catch { resolve(); }
    })
  }
}