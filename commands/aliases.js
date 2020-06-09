const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['aliases', 'a'],
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  run(client, message, args) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!args[1]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

        switch (args[1]) {
          case 'add': case 'a': return resolve(await add(client, message, args));
          case 'remove': case 'r': return resolve(await remove(client, message, args));
          default: resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));
        }
      } catch { resolve(); }
    })
  }
}

function add(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!args[2] || !args[3]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_add_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

      let command = client.commands.find(command => command.command == args[2]);
      if (!command) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_notfound', message.guild.db.lang), args[2], client.commands.map(command => `\`\`${command.command}\`\``).join(' ')), helper.messageType.ERROR));

      let alias = message.guild.db.commands.find(command => command.aliases.includes(args[3]));
      if (alias) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_taken', message.guild.db.lang), args[3], alias.command), helper.messageType.ERROR));

      let guildCommand = message.guild.db.commands.find(command => command.command == args[2]);
      guildCommand.aliases.push(args[3]);

      await sql.updateCommands(message.guild.id, message.guild.db.commands);
      resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_add', message.guild.db.lang), args[3], command.command), helper.messageType.SUCCESS));
    } catch (e) { reject(e); }
  })
}

function remove(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!args[2]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_remove_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

      let alias = message.guild.db.commands.find(command => command.aliases.includes(args[2]));
      if (!alias) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_nottaken', message.guild.db.lang), args[2]), helper.messageType.ERROR));

      let check = client.commands.find(command => command.command == args[2])
      if (check) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_unable', message.guild.db.lang), check.command), helper.messageType.ERROR));

      alias.aliases.splice(alias.aliases.indexOf(args[2]), 1);
      await sql.updateCommands(message.guild.id, message.guild.db.commands);
      resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('aliases_remove', message.guild.db.lang), args[2]), helper.messageType.SUCCESS));
    } catch (e) { reject(e); }
  })
}