const config = require('./config.json');
const { MessageEmbed } = require('discord.js');
const { uuid } = require('uuidv4');
const util = require('util');
const fs = require('fs');

const logType = {
  MESSAGE_DELETE: 'message_delete',
  MESSAGE_UPDATE: 'message_update',
  MESSAGE_BULK_DELETE: 'message_bulk_delete'
}

const messageType = {
  NO_ACCESS: 'type_noaccess',
  USAGE: 'type_usage',
  SUCCESS: 'type_sucess',
  ERROR: 'type_error',
  CODE: 'type_code',
  NORMAL: 'type_normal',
  ATTACHMENT: 'type_attachment'
}

module.exports.resolveUser = function(message, userId, checkString = false) {
  return new Promise(async (resolve, reject) => {
    userId = userId.replace('!', '');
    if (userId.startsWith('<@')) userId = userId.slice(2, userId.length - 1);

    try {
      resolve(await message.client.users.fetch(userId));
    } catch {
      try {
        if (checkString) return resolve(await resolveUserString(message, userId));
        resolve();
      } catch { resolve(); }
    }
  })
}

module.exports.resolveChannel = function(message, channelId, channelType, checkString = false) {
  return new Promise(async (resolve, reject) => {
    if (channelId.startsWith('<#')) channelId = channelId.slice(2, channelId.length - 1);

    try {
      resolve(await message.client.channels.fetch(channelId));
    } catch {
      try {
        if (checkString) return resolve(await resolveChannelString(message, channelId, channelType));
        resolve();
      } catch { resolve(); }
    }
  })
}

module.exports.sendLogMessage = function(guild, data, type) {
  return new Promise(async (resolve, reject) => {
    if (!guild.hasOwnProperty('ready') || guild.db.log.channel == null) return resolve();
    if (!guild.db.log.enabledModules.includes(type)) return resolve();

    switch (type) {
      case logType.MESSAGE_DELETE: return resolve(await logDelete(guild, data));
      case logType.MESSAGE_UPDATE: return resolve(await logUpdate(guild, data));
      case logType.MESSAGE_BULK_DELETE: return resolve(await logBulkDelete(guild, data));
    }
  })
}

function finalLog(guild, embed, files) {
  return new Promise(async (resolve, reject) => {
    if (guild.hasOwnProperty('logHook')) {
      try {
        return resolve(await guild.logHook.send('', { embeds: [ embed ], files: files }));
      } catch { }
    }

    let guildChannel = guild.channels.cache.find(channel => channel.id == guild.db.log.channel);
    try { resolve(await guildChannel.send('', { embed: embed, files: files })); }
    catch { resolve(); }
  })
}

function logDelete(guild, message) {
  return new Promise(async (resolve, reject) => {
    let embed = new MessageEmbed();
    embed.setColor('ORANGE');

    let member = guild.member(message.author);

    embed.setFooter(util.format(translatePhrase('log_message_delete', guild.db.lang), `${message.author.tag}${member && member.displayName != message.author.username ? ` [${member.displayName}]` : ''}`, `#${message.channel.name}`));

    if (guild.me.permissions.has('VIEW_AUDIT_LOG')) {
      let auditCheck = await checkAuditStatus(message);

      if (auditCheck) {
        let executor = message.guild.member(auditCheck);

        embed.setFooter(util.format(translatePhrase('log_message_delete_audit', guild.db.lang), `${message.author.tag}${member && member.displayName != message.author.username ? ` [${member.displayName}]` : ''}`, `#${message.channel.name}`, `${executor.user.tag}${executor && executor.displayName != executor.user.username ? ` [${executor.displayName}]` : ''}`));
      }
    }

    let sendMessage = '';
    let files = [];

    let string = lengthCheck(message.cleanContent);

    if (string.type == 'text') sendMessage += util.format(translatePhrase('log_message', guild.db.lang), string.value);
    else if (string.type == 'id') {
      if (config.site.enabled) sendMessage += util.format(translatePhrase('log_message_link', guild.db.lang), `${config.site.url}/messages/${string.value}.txt`);
      else {
        sendMessage += util.format(translatePhrase('log_message_attachment', guild.db.lang), string.value);
        files.push(`./messages/${string.value}.txt`);
      }
    }

    if (message.hasOwnProperty('attachment')) {
      let attachment = message.attachment;

      if (sendMessage.length > 0) sendMessage += `\n`;
      if (message.guild.db.log.files != null && attachment.hasOwnProperty('link')) sendMessage += util.format(translatePhrase('log_attachment_url', guild.db.lang), attachment.link.url, attachment.name);
      else if (!config.discord.log.downloadAttachments) sendMessage += util.format(translatePhrase('log_attachment_configure', guild.db.lang), attachment.name, guild.db.prefix);
      else {
        sendMessage += util.format(translatePhrase('log_attachment', guild.db.lang), attachment.name);
        files.push(`./attachments/${attachment.channel.id}/${attachment.id}/${attachment.name}`);
      }
    }

    embed.setDescription(sendMessage);
    resolve(finalLog(guild, embed, files));
  })
}

function logUpdate(guild, data) {
  return new Promise(async (resolve, reject) => {
    let embed = new MessageEmbed();
    embed.setColor('YELLOW');

    let member = data.new.guild.member(data.new.author);
    embed.setFooter(util.format(translatePhrase('log_message_edit', guild.db.lang), `${data.new.author.tag}${member && member.displayName != data.new.author.username ? ` [${member.displayName}]` : ''}`, `#${data.new.channel.name}`));

    let sendMessage = '';
    let files = [];

    let oldMessage = lengthCheck(data.old.cleanContent);
    let newMessage = lengthCheck(data.new.cleanContent);

    if (oldMessage.type == 'text') sendMessage += util.format(translatePhrase('log_message', guild.db.lang), oldMessage.value);
    else if (oldMessage.type == 'id') {
      if (config.site.enabled) sendMessage += util.format(translatePhrase('log_message_link', guild.db.lang), `${config.site.url}/messages/${oldMessage.value}.txt`);
      else {
        sendMessage += util.format(translatePhrase('log_message_attachment', guild.db.lang), oldMessage.value);
        files.push(`./messages/${oldMessage.value}.txt`);
      }
    }

    sendMessage += '\n';

    if (newMessage.type == 'text') sendMessage += util.format(translatePhrase('log_message_new', guild.db.lang), data.new.url, newMessage.value);
    else if (newMessage.type == 'id') {
      if (config.site.enabled) sendMessage += util.format(translatePhrase('log_message_link_new', guild.db.lang), data.new.url, `${config.site.url}/messages/${newMessage.value}.txt`);
      else {
        sendMessage += util.format(translatePhrase('log_message_attachment_new', guild.db.lang), data.new.url, newMessage.value);
        files.push(`./messages/${newMessage.value}.txt`);
      }
    }

    embed.setDescription(sendMessage);
    resolve(finalLog(guild, embed, files));
  })
}

function logBulkDelete(guild, data) {
  return new Promise(async (resolve, reject) => {
    let embed = new MessageEmbed();
    embed.setColor('ORANGE');
    embed.setFooter(util.format(translatePhrase('log_message_bulk', guild.db.lang), data.messages.length, `#${data.channel.name}`))

    let string = '';
    let files = [];

    for (let i = data.messages.length - 1; i >= 0; i--) {
      let message = data.messages[i];
      let member = guild.member(message.author);

      if (message.hasOwnProperty('changes')) {
        for (let x = 0; x < message.changes.length; x++) {
          let messageEdit = message.changes[x];
          if (messageEdit.length == 0) continue;
          if (string.length > 0) string += '\n';

          string += `${new Date(messageEdit.createdTimestamp)} ${message.author.tag}${member && member.displayName != message.author.username ? ` [${member.displayName}]` : ''} | ${messageEdit.cleanContent}`;
        }
      }

      if (string.length > 0 && message.cleanContent.length > 0) string += '\n';
      if (message.cleanContent.length > 0) string += `${new Date(message.createdTimestamp)} ${message.author.tag}${member && member.displayName != message.author.username ? ` [${member.displayName}]` : ''} -> ${message.cleanContent}`;

      if (message.hasOwnProperty('attachment')) {
        let attachment = message.attachment;
        if (string.length > 0) string += '\n';

        if (message.attachment.hasOwnProperty('link')) string += util.format(translatePhrase('log_messages_bulk_attachment', guild.db.lang), link.url);
        else if (config.discord.log.downloadAttachments) string += util.format(translatePhrase('log_messages_bulk_attachment', guild.db.lang), `/attachments/${attachment.channel.id}/${attachment.id}/${attachment.name}`);
        else string += util.format(translatePhrase('log_messages_bulk_attachment', guild.db.lang), attachment.name);
      }
    }

    if (!fs.existsSync('./messages')) fs.mkdirSync('./messages');

    let id = uuid();
    fs.writeFileSync(`./messages/${id}.txt`, string);

    let sendMessage = '';

    if (config.site.enabled) sendMessage = util.format(translatePhrase('log_messages_link', guild.db.lang), `${config.site.url}/messages/${id}.txt`);
    else {
      sendMessage = util.format(translatePhrase('log_messages_attachment', guild.db.lang), id);
      files.push(`./messages/${id}.txt`);
    }

    embed.setDescription(sendMessage);
  })
}

function resolveUserString(message, string) {
  return new Promise(async (resolve, reject) => {
    string = string.toLowerCase();

    let findUsers = message.client.users.cache.filter(user => {
      if (!message.guild && user.tag.toLowerCase().includes(string)) return user;
      else {
        let member = message.guild.member(user);
        if (member && (user.tag.toLowerCase().includes(string) || message.guild.member(user).displayName.toLowerCase().includes(string))) return user;
      }
      return;  
    }).array();

    if (findUsers.length == 0) { await sendMessage(message.channel, util.format(translatePhrase('target_notfound', message.guild ? message.guild.db.lang : config.discord.language), string), messageType.ERROR); return resolve(); }
    if (findUsers.length == 1) return resolve(findUsers[0]);

    let reply = '';

    for (let i = 0; i < findUsers.length; i++) {
      let user = findUsers[i];

      if (reply.length > 0) reply += `\n`;
      reply += `[${i}] ${user.tag} (${user.id})`;
    }

    let selection = await sendMessage(message.channel, reply, messageType.CODE);
    
    await message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 10000, errors: ['time'] })
    .then(collection => {
      let collectedMessage = collection.first();

      deleteMessage(collectedMessage, true);
      if (isNaN(collectedMessage.content)) { sendMessage(message.channel, util.format(translatePhrase('target_invalid', message.guild ? message.guild.db.lang : config.discord.language), collectedMessage.content, findUsers.length - 1), messageType.ERROR); resolve(); }
      else {
        let pick = parseInt(collectedMessage.content);
        if (pick < 0 || pick > findUsers.length - 1 || pick == 'NaN') { sendMessage(message.channel, util.format(translatePhrase('target_invalid', message.guild ? message.guild.db.lang : config.discord.language), collectedMessage.content, findUsers.length - 1), messageType.ERROR); resolve(); }

        resolve(findUsers[pick]);
      }
    })
    .catch(collection => {
      if (collection.size == 0) sendMessage(message.channel, translatePhrase('target_toolong', message.guild ? message.guild.db.lang : config.discord.language), messageType.ERROR); resolve();
    })

    deleteMessage(selection, true);
  })
}

function resolveChannelString(message, string, channelType) {
  return new Promise(async (resolve, reject) => {
    string = string.toLowerCase();

    let findChannels = message.guild.channels.cache.filter(channel => channel.name.toLowerCase().includes(string) && channel.type == channelType).array();
    if (findChannels.length == 0) { await sendMessage(message.channel, util.format(translatePhrase('target_notfound', message.guild ? message.guild.db.lang : config.discord.language), string), messageType.ERROR); return resolve(); }
    if (findChannels.length == 1) return resolve(findChannels[0]);

    let reply = '';

    for (let i = 0; i < findChannels.length; i++) {
      let guildChannel = findChannels[i];

      if (reply.length > 0) reply += `\n`;
      reply += `[${i}] ${guildChannel.name} [${guildChannel.type}] (${guildChannel.id})`;
    }

    let selection = await sendMessage(message.channel, reply, messageType.CODE);

    await message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 10000, errors: ['time'] })
    .then(async collection => {
      let collectedMessage = collection.first();

      deleteMessage(collectedMessage, true);
      if (isNaN(collectedMessage.content)) { sendMessage(message.channel, util.format(translatePhrase('target_invalid', message.guild ? message.guild.db.lang : config.discord.language), collectedMessage.content, findChannels.length - 1), messageType.ERROR); resolve(); }
      else {
        let pick = parseInt(collectedMessage.content);
        if (pick < 0 || pick > findChannels.length - 1 || pick == 'NaN') { sendMessage(message.channel, util.format(translatePhrase('target_invalid', message.guild ? message.guild.db.lang : config.discord.language), collectedMessage.content, findChannels.length - 1), messageType.ERROR); resolve(); }

        resolve(findChannels[pick]);
      }
    })
    .catch(collection => {
      if (collection.size == 0) sendMessage(message.channel, translatePhrase('target_toolong', message.guild ? message.guild.db.lang : config.discord.language), messageType.ERROR); resolve();
    })

    deleteMessage(selection, true);
  })
}

function translatePhrase(phrase, language) {
  const en = require('./translations/en.json');
  var translation = en[phrase];
  
  if (fs.existsSync(`./translations/${language}.json`)) {
    const lang = require(`./translations/${language}.json`);
    if (lang.hasOwnProperty(phrase)) translation = lang[phrase];
  }

  return translation;
}

function sendMessage(channel, message, type) {
  return new Promise(async (resolve, reject) => {
    switch (type) {
      case messageType.NO_ACCESS: return resolve(await messageNoAccess(channel, message));
      case messageType.USAGE: return resolve(await messageUsage(channel, message));
      case messageType.SUCCESS: return resolve(await messageSuccess(channel, message));
      case messageType.ERROR: return resolve(await messageError(channel, message));
      case messageType.CODE: return resolve(await messageCode(channel, message));
      case messageType.NORMAL: return resolve(await messageNormal(channel, message));
      case messageType.ATTACHMENT: return resolve(await messageAttachment(channel, message));
    }
  })
}

function messageNoAccess(user, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('RED');

      resolve(await user.send(embed));
    } catch { resolve(); }
  })
}

function messageUsage(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('YELLOW');

      if (!channel.guild || (channel.guild && channel.permissionsFor(channel.guild.me).has('EMBED_LINKS'))) return resolve(await channel.send(embed));
      resolve(await channel.send(message));
    } catch { resolve(); }
  })
}

function messageSuccess(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('GREEN');

      if (!channel.guild || (channel.guild && channel.permissionsFor(channel.guild.me).has('EMBED_LINKS'))) return resolve(await channel.send(embed));
      resolve(await channel.send(message));
    } catch { resolve(); }
  })
}

function messageError(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('RED');

      if (!channel.guild || (channel.guild && channel.permissionsFor(channel.guild.me).has('EMBED_LINKS'))) return resolve(await channel.send(embed));
      resolve(await channel.send(message));
    } catch { resolve(); }
  })
}

function messageCode(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await channel.send(message, { code: true }));
    } catch { resolve(); }
  })
}

function messageNormal(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await channel.send(message));
    } catch { resolve(); }
  })
}

function messageAttachment(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await channel.send(message.content, { files: [message.attachment] }));
    } catch { resolve(); }
  })
}

function lengthCheck(string) {
  if (string.length == 0) return { type: 'none' }
  else if (string.length < 500 && string.split('\n').length < 5) return { type: 'text', value: string }
  else {
    if (!fs.existsSync('./messages')) fs.mkdirSync('./messages');

    let id = uuid();
    fs.writeFileSync(`./messages/${id}.txt`, string);
    return { type: 'id', value: id }
  }
}

async function deleteMessage(message, botDelete = false) {
  try {
    await message.delete();
    if (botDelete) message.botDelete = true;
  } catch { }
}

async function checkAuditStatus(message) {
  return new Promise(async (resolve, reject) => {
    try {
      let log = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE', limit: 1});
      let entry = log.entries.first();

      let lastEntry = null;
      if (message.guild.hasOwnProperty('lastEntry')) lastEntry = message.guild.lastEntry;
      message.guild.lastEntry = entry;

      if (entry.target.id == message.author.id) {
        if (lastEntry) {
          if (lastEntry.id == entry.id && lastEntry.extra.count == entry.extra.count) return resolve();
          return resolve(entry.executor);
        }

        return resolve(entry.executor);
      }
    } catch { resolve(); }
  })
}

module.exports.logType = logType;
module.exports.messageType = messageType;
module.exports.sendMessage = sendMessage;
module.exports.translatePhrase = translatePhrase;
module.exports.deleteMessage = deleteMessage;