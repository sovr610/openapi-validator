const fs = require('fs');
const set = require('lodash/set');
const yaml = require('js-yaml');

const ext = require('./fileExtensionValidator');

// this function applies fixes to the input file
module.exports = function applyFixes(fixesObj, swagger, filename) {
  //console.log('\nFixes\n');
  //console.log(JSON.stringify(fixes, null, 2));

  for (const [key, fixes] of Object.entries(fixesObj)) {
    fixes.forEach(fix => {
      set(swagger, fix.path, fix.value);
    });
  }

  //console.log(JSON.stringify(swagger, null, 2));

  const fileExtension = ext.getFileExtension(filename);
  if (fileExtension === 'json') {
    fs.writeFileSync(filename, JSON.stringify(swagger, null, 2));
  } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
    fs.writeFileSync(filename, yaml.safeDump(swagger), 'utf8');
  }
};
