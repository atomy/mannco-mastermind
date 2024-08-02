const fs = require('fs');
const path = require('path');

const weaponClassesPath = path.join(__dirname, '../../doc', 'weapon_classes.json');
const missingEntitiesDir = path.join(__dirname, '../../doc/missing_weapons');

function addToMissing(entityName) {
  if (!fs.existsSync(missingEntitiesDir)) {
    fs.mkdirSync(missingEntitiesDir);
  }

  const missingFilePath = path.join(missingEntitiesDir, `missing_${entityName}.json`);

  if (!fs.existsSync(missingFilePath)) {
    fs.writeFileSync(missingFilePath, JSON.stringify({ entityName }, null, 2));
  }
}

function mapEntityToClass(weaponId) {
  const weaponClasses = JSON.parse(fs.readFileSync(weaponClassesPath, 'utf-8'));
  const classNames = [];

  for (const classEntry of weaponClasses.classes) {
    for (const weapon of classEntry.weapons) {
      if (weapon.weaponId === weaponId) {
        classNames.push(classEntry.className);
      }
    }
  }

  if (classNames.length > 0) {
    return classNames;
  } else {
    addToMissing(weaponId);
    return null;
  }
}

module.exports = { mapEntityToClass };
