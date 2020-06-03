const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['managers', 'manager', 'ms'],
  usage: '%s%s ``<add/remove/list>``',
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    try {
      if (!args[1]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

      switch (args[1]) {
        case 'add': return add(client, message, args);
        case 'remove': return remove(client, message, args);
        case 'list': return list(client, message, args);
        default: return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);
      }
    } catch (err) { console.error(err); }
  }
}

async function add(client, message, args) {
  try {
    let usage = '%s%s add ``<user>``';
    if (!args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

    let user = await helper.resolveUser(message, args[2], true);
    if (!user) return;

    if (message.guild.db.managers.includes(user.id)) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('manager_included', message.guild.db.lang), user.tag), helper.messageType.ERROR);

    message.guild.db.managers.push(user.id);
    await sql.updateManagers(message.guild.id, message.guild.db.managers);
    helper.sendMessage(message.channel, util.format(helper.translatePhrase('manager_add', message.guild.db.lang), user.tag), helper.messageType.SUCCESS);
  } catch (err) { console.error(err); }
}

async function remove(client, message, args) {
  try {
    let usage = '%s%s remove ``<user>``';
    if (!args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

    let user = await helper.resolveUser(message, args[2], true);
    if (!user) return;

    if (!message.guild.db.managers.includes(user.id)) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('manager_notincluded', message.guild.db.lang), user.tag), helper.messageType.ERROR);

    message.guild.db.managers.splice(message.guild.db.managers.indexOf(user.id), 1);
    await sql.updateManagers(message.guild.id, message.guild.db.managers);
    helper.sendMessage(message.channel, util.format(helper.translatePhrase('manager_remove', message.guild.db.lang), user.tag), helper.messageType.SUCCESS);
  } catch (err) { console.error(err); }
}

async function list(client, message, args) {
  try {
    if (message.guild.db.managers.length == 0) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('manager_none', message.guild.db.lang)), helper.messageType.SUCCESS);
    let reply = '';

    for (let manager of message.guild.db.managers) {
      let user = await helper.resolveUser(message, manager);
      let member = message.guild.member(user);

      if (user) {
        if (reply.length > 0) reply += `\n`;
        reply += `${user.tag}${member && user.username != member.displayName ? ` [${member.displayName}] ` : ' '}(${user.id})`;
      }
    }

    helper.sendMessage(message.channel, reply, helper.messageType.CODE);
  } catch (err) { console.error(err); }
}