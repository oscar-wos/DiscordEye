const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['addc', 'addalias'],
  usage: '%s%s <command> <alias>',
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    try {
      if (!args[1] || !args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

      let command = client.commands.find(command => command.command == args[1]);
      if (!command) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('command_notfound', message.guild.db.lang), args[1], client.commands.map(command => `\`\`${command.command}\`\``).join(' ')), helper.messageType.ERROR);

      let alias = message.guild.db.commands.find(command => command.aliases.includes(args[2]));
      if (alias) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('command_taken', message.guild.db.lang), args[2], alias.command), helper.messageType.ERROR);

      let guildCommand = message.guild.db.commands.find(command => command.command == args[1]);
      guildCommand.aliases.push(args[2]);

      sql.updateCommands(message.guild.id, message.guild.db.commands);
      helper.sendMessage(message.channel, util.format(helper.translatePhrase('command_add', message.guild.db.lang), args[2], command.command), helper.messageType.SUCCESS);
    } catch (err) { console.error(err); }
  }
}