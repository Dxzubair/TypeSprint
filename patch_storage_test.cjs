const fs = require('fs');
const path = 'src/utils/storage.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("addRewards(150, 50)", "addRewards(350, 50)");
code = code.replace("expect(newProfile.level).toBe(2);", "expect(newProfile.level).toBe(2);");
code = code.replace("expect(newProfile.xp).toBe(50); // 150 - 100 = 50 remainder", "expect(newProfile.xp).toBe(50); // 350 - 300 = 50 remainder");

code = code.replace("addRewards(650, 0);", "addRewards(350 + 600 + 50, 0);");
code = code.replace("expect(profile.level).toBe(4); // 100 (lvl2) + 200 (lvl3) + 300 (lvl4) = 600", "expect(profile.level).toBe(3); // 300 + 600");
code = code.replace("expect(profile.xp).toBe(50);", "expect(profile.xp).toBe(100);");

fs.writeFileSync(path, code);
console.log('patched storage test');
