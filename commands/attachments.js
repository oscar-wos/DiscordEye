const config = require('../config.json');
const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['attachments', 'files'],
  usage: '%s%s ``<channel>``',
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    try {
      if (config.discord.log.downloadAttachments) return helper.sendMessage(message.channel, helper.translatePhrase('attachments_downloadenabled', message.guild.db.lang), helper.messageType.ERROR);
      
      if (!args[1]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);
    } catch (err) { console.error(err); }
  }
}