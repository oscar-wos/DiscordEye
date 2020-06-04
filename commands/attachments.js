const config = require('../config.json');
const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['attachments', 'files'],
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  run(client, message, args) {
    return new Promise(async (resolve, reject) => {
      try {
        if (config.discord.log.downloadAttachments) return resolve(await helper.sendMessage(message.channel, helper.translatePhrase('attachments_downloadenabled', message.guild.db.lang), helper.messageType.ERROR));

        if (!args[1]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('attachments_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

        let channel = await helper.resolveChannel(message, args[1], 'text', true);
        if (!channel) return resolve();

        message.guild.db.log.attachments = channel.id;
        await sql.updateLog(message.guild.id, message.guild.db.log);
        resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('attachments_set', message.guild.db.lang), channel.name), helper.messageType.SUCCESS));
      } catch { resolve(); }
    })
  }
}