const config = require('../config.json');
const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['managers', 'manager', 'm'],
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  run(client, message, args) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!args[1]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

        switch (args[1]) {
          default: return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));
        }
      } catch { resolve(); }
    })
  }
}