const logEvent = {
  MESSAGE_DELETE: 'message_delete',
  MESSAGE_UPDATE: 'message_update'
}

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