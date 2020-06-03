const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['delc', 'delalias', 'removealias', 'deletealias'],
  usage: '%s%s ``<alias>``',
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    try {
      if (!args[1]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

      let alias = message.guild.db.commands.find(command => command.aliases.includes(args[1]));
      if (!alias) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('command_nottaken', message.guild.db.lang), args[1]), helper.messageType.ERROR);

      let check = client.commands.find(command => command.command == args[1])
      if (check) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('command_unable', message.guild.db.lang), check.command), helper.messageType.ERROR);

      alias.aliases.splice(alias.aliases.indexOf(args[1]), 1);
      await sql.updateCommands(message.guild.id, message.guild.db.commands);
      helper.sendMessage(message.channel, util.format(helper.translatePhrase('command_remove', message.guild.db.lang), args[1]), helper.messageType.SUCCESS);
    } catch (err) { console.error(err); }
  }
}