const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['tags', 'tag', 't'],
  usage: '%s%s ``<(a)dd/(r)emove/(l)ist/(i)nfo>``',
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    message.channel.bulkDelete(5);
    try {
      if (!args[1]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

      switch (args[1]) {
        case 'add': case 'a': return add(client, message, args);
        case 'remove': case 'r': return remove(client, message, args);
        case 'list': case 'l': return list(client, message, args);
        case 'info': case 'i': return info(client, message, args);
        default: return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);
      }
    } catch (err) { console.error(err); }
  }
}

async function add(client, message, args) {
  try {
    let usage = '%s%s (a)dd ``<tag>`` ``<value>``';
    if (!args[2] || !args[3]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

    if (message.guild.db.tags.find(tag => tag.tag == args[2])) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('tag_taken', message.guild.db.lang), args[2]), helper.messageType.ERROR);
    let value = args.slice(3).join(' ');

    message.guild.db.tags.push({ tag: args[2], value: value });
    await sql.updateTags(message.guild.id, message.guild.db.tags);
    helper.sendMessage(message.channel, util.format(helper.translatePhrase('tag_add', message.guild.db.lang), args[2]), helper.messageType.SUCCESS);
  } catch (err) { console.error(err); }
}

async function remove(client, message, args) {
  try {
    let usage = '%s%s (r)emove ``<tag>``';
    if (!args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

    let tag = message.guild.db.tags.find(tag => tag.tag === args[2]);
    if (!tag) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('tag_notfound', message.guild.db.lang), args[2]), helper.messageType.ERROR);

    message.guild.db.tags.splice(message.guild.db.tags.indexOf(tag), 1);
    await sql.updateTags(message.guild.id, message.guild.db.tags);
    helper.sendMessage(message.channel, util.format(helper.translatePhrase('tag_remove', message.guild.db.lang), args[2]), helper.messageType.SUCCESS);
  } catch (err) { console.error(err); }
}

async function list(client, message, args) {
  try {
    if (message.guild.db.tags.length == 0) return helper.sendMessage(message.channel, helper.translatePhrase('tag_none', message.guild.db.lang), helper.messageType.ERROR);
    let reply = '';

    for (let tag of message.guild.db.tags) {
      if (reply.length > 0) reply += ' ';
      reply += ` \`\`${tag.tag}\`\``;
    }

    helper.sendMessage(message.channel, util.format(helper.translatePhrase('tag_list', message.guild.db.lang), reply), helper.messageType.SUCCESS);
  } catch (err) { console.error(err); }
}

async function info(client, message, args) {
  try {
    let usage = '%s%s (i)nfo ``<tag>``';
    if (!args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

    let tag = message.guild.db.tags.find(tag => tag.tag === args[2]);
    if (!tag) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('tag_notfound', message.guild.db.lang), args[2]), helper.messageType.ERROR);

    helper.sendMessage(message.channel, tag.value, helper.messageType.CODE);
  } catch (err) { console.error(err); }
}