const fs = require('fs');
const path = require('path');

function addToMissing(missingEntitiesDir, entityName) {
  if (!fs.existsSync(missingEntitiesDir)) {
    fs.mkdirSync(missingEntitiesDir);
  }

  const missingFilePath = path.join(
    missingEntitiesDir,
    `missing_${entityName}.json`,
  );

  if (!fs.existsSync(missingFilePath)) {
    fs.writeFileSync(missingFilePath, JSON.stringify({ entityName }, null, 2));
  }
}

function mapEntityToClass(appPath, weaponId) {
  const weaponClassesPath = path.join(appPath, 'assets', 'weapon_classes.json');
  const missingEntitiesDir = path.join(appPath, 'assets', 'missing_weapons');

  if (!fs.existsSync(weaponClassesPath)) {
    throw new Error(`File not found: ${weaponClassesPath}`);
  }

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
  }
  addToMissing(missingEntitiesDir, weaponId);
  return null;
}

module.exports = { mapEntityToClass };
