const messageType = {
  MESSAGE_USAGE: 'type_usage'
}

const log = {
  MESSAGE_DELETE: 'message_delete',
  MESSAGE_UPDATE: 'message_update'
}

const fs = require('fs');

module.exports.resolveUserId = function(client, userId) {
  return new Promise(async (resolve, reject) => {
    userId = userId.replace('!', '');

    if (userId.startsWith('<@')) userId = userId.slice(2, userId.length - 1);
    if (isNaN(Number(userId))) return resolve();

    try {
      let user = await client.users.fetch(userId);
      resolve(user);
    } catch (err) { reject(err); }
  })
}

module.exports.translatePhrase = function(phrase, language) {
  const en = require('./translations/en.json');
  var translation = en[phrase];
  
  if (fs.existsSync(`./translations/${language}.json`)) {
    const lang = require(`./translations/${language}.json`);
    if (lang.hasOwnProperty(phrase)) translation = lang[phrase];
  }

  return translation;
}

module.exports.sendMessage = function(channel, message, type) {
  switch (type) {
    case messageType.MESSAGE_USAGE: return messageUsage(channel, message);
  }
}

function messageUsage(channel, message) {

}


/*
module.exports.sendMessage = function(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let sendMessage = await channel.send(message);
      resolve(sendMessage);
    } catch (err) { reject(err); }
  })
}
*/