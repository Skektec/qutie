const fs = require('fs');
const notify = require('./notify');

module.exports = {
  readFile: (path) => {
    try {
      return fs.readFileSync(path, 'utf8');
    } catch (err) {
      notify.error(`Error reading file: ${path}`, err, '6x00000');
      return null;
    }
  },

  writeFile: (path, data) => {
    try {
      fs.writeFileSync(path, data, 'utf8');
      return true;
    } catch (err) {
      notify.error(`Error writing file: ${path}`, err, '6x00000');
      return false;
    }
  },
};
