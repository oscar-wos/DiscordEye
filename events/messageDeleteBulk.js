const helper = require('../helper.js');

module.exports = async (client, messages) => {
  let message = messages.first();

  helper.sendLogMessage(message.guild, { channel: message.channel, messages: messages }, helper.logType.MESSAGE_BULK_DELETE);
}