const helper = require('../helper.js');

module.exports = async (client, message) => {
  helper.sendLogMessage(message.guild, message, helper.logType.MESSAGE_DELETE);
}