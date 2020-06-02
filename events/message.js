const helper = require('../helper.js');

module.exports = async (client, message) => {
  if (message.guild && !message.guild.ready) return;
  if (message.content.length == 0) return;

  var args;
  let prefixIndex = message.content.indexOf(message.guild.db.prefix);

  if (prefixIndex == 0) args = message.content.slice(message.guild.db.prefix.length).trim().split(/ +/g);
  else {
    args = message.content.trim().split(/ +/g);

    try {
      let checkClient = await helper.resolveUserId(client, args[0]);
      if (!checkClient || checkClient.id != client.user.id) return;
      args = args.slice(1);
    } catch (err) { return console.error(err); }
  }

  if (args[0].length == 0) return;
  args[0] = args[0].toLowerCase();
  
  let command = message.guild.db.commands.find(command => command.aliases.includes(args[0]));
  if (!command) return;

  let con = client.commands.find(con => con.command == command.command);
  if (!con) return;

  con.run(client, message, args.slice(1));
}