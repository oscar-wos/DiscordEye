const helper = require('../helper.js');

module.exports = async (client, message) => {
  if (message.botDelete) return;
  helper.sendLogMessage(message.guild, message, helper.logType.MESSAGE_DELETE);
}