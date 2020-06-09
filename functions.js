const { uuid } = require('uuidv4');
const fs = require('fs');

module.exports.logLengthCheck = function(string) {
  if (string.length == 0) return { type: 'none' }
  else if (string.length < 500 && string.split('\n').length < 5) return { type: 'text' }
  else {
    let id = writeMessageFile(string);
    return { type: 'id', value: id }
  }
}

function writeMessageFile(string) {
  if (!fs.existsSync('./messages')) fs.mkdirSync('./messages');

  let id = uuid();
  fs.writeFileSync(`./messages/${id}.txt`, string);
  return id;
}

module.exports.writeMessageFile = writeMessageFile;