const helper = require('../helper.js');
const util = require('util');

module.exports = async (client, message) => {
  checkAttachments(message);

  if (message.author.bot) return;
  if (message.guild && !message.guild.ready) return;
  if (message.content.length == 0) return;

  if (message.guild) {
    let tag = message.guild.db.tags.find(tag => tag.tag == message.cleanContent);
    if (tag) helper.sendMessage(message.channel, tag.value, helper.messageType.NORMAL);
  }

  var args;

  let prefixIndex = -1;
  if (message.guild) prefixIndex = message.content.indexOf(message.guild.db.prefix);

  if (prefixIndex == 0) args = message.content.slice(message.guild.db.prefix.length).trim().split(/ +/g);
  else {
    args = message.content.trim().split(/ +/g);

    try {
      let checkClient = await helper.resolveUser(message, args[0]);
      if (!checkClient || checkClient.id != client.user.id) return;
      args = args.slice(1);
    } catch (err) { return console.error(err); }
  }

  if (!args) return;
  if (args[0].length == 0) return;
  args[0] = args[0].toLowerCase();
  
  let command = message.guild.db.commands.find(command => command.aliases.includes(args[0]));
  if (!command) return;

  let con = client.commands.find(con => con.command == command.command);
  if (!con) return;

  if (!con.channel.includes(message.channel.type)) return;
  if (con.hasOwnProperty('guildPermissions') && !message.member.permissions.has(con.guildPermissions) && !message.guild.db.managers.includes(message.author.id)) return helper.sendMessage(message.author, util.format(helper.translatePhrase('noaccess'), args[0], con.command), helper.messageType.NO_ACCESS);
  if (con.hasOwnProperty('guildBotPermissions') && !message.guild.me.permissions.has(con.guildBotPermissions)) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('noaccess_bot'), con.guildBotPermissions), helper.messageType.ERROR)

  con.run(client, message, args);
  helper.deleteMessage(message, true);
}

function checkAttachments(message) {

}