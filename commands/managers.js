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
          case 'add': case 'a': return resolve(await add(client, message, args));
          case 'remove': case 'r': return resolve(await remove(client, message, args));
          case 'list': case 'l': return resolve(await list(client, message, args));
          default: return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));
        }
      } catch { resolve(); }
    })
  }
}

function add(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!args[2]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_add_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

      let user = await helper.resolveUser(message, args[2], true);
      if (!user) return;

      if (message.guild.db.managers.includes(user.id)) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_included', message.guild.db.lang), user.tag), helper.messageType.ERROR));

      message.guild.db.managers.push(user.id);
      await sql.updateManagers(message.guild.id, message.guild.db.managers);
      resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_add', message.guild.db.lang), user.tag), helper.messageType.SUCCESS));
    } catch (e) { reject(e); }
  })
}

function remove(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!args[2]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_remove_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

      let user = await helper.resolveUser(message, args[2], true);
      if (!user) return;

      if (!message.guild.db.managers.includes(user.id)) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_not', message.guild.db.lang), user.tag), helper.messageType.ERROR));

      message.guild.db.managers.splice(message.guild.db.managers.indexOf(user.id), 1);
      await sql.updateManagers(message.guild.id, message.guild.db.managers);
      resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_remove', message.guild.db.lang), user.tag), helper.messageType.SUCCESS));
    } catch (e) { reject(e); }
  })
}

function list(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (message.guild.db.managers.length == 0) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('managers_none', message.guild.db.lang)), helper.messageType.SUCCESS));
      let reply = '';

      for (let manager of message.guild.db.managers) {
        let user = await helper.resolveUser(message, manager);
        let member = message.guild.member(user);

        if (!user) continue;
        if (reply.length > 0) reply += '\n';
        reply += `${user.tag}${member && user.username != member.displayName ? ` [${member.displayName}]` : ''} (${user.id})`;
      }

      resolve(await helper.sendMessage(message.channel, reply, helper.messageType.CODE));
    } catch (e) { reject(e); }
  })
}