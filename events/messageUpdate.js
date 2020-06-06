const helper = require('../helper.js');

module.exports = async (client, oldMessage, newMessage) => {
  if (oldMessage.cleanContent == newMessage.cleanContent) return;
  helper.sendLogMessage(newMessage.guild, { old: oldMessage, new: newMessage }, helper.logType.MESSAGE_UPDATE);

  if (!newMessage.hasOwnProperty('changes')) newMessage.changes = [];
  newMessage.changes.push(oldMessage);
}