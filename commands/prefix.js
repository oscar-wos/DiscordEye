const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['prefix', 'p'],
  usage: '%s%s ``<prefix>``',
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    if (!args[1]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

    try {
      message.guild.db.prefix = args[1];
      await sql.updatePrefix(message.guild.id, args[1]);
      helper.sendMessage(message.channel, util.format(helper.translatePhrase('prefix_updated', message.guild.db.lang), args[1]), helper.messageType.SUCCESS);
    } catch (err) { console.error(err); }
  }
}