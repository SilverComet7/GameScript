const dm = require("dm.dll");
const wzst = dm.setDict(0, "jt7000.txt");
dm.setDict(1, "yw.txt");
console.log(wzst);
// 长安;

const testList = dm.findStr(0, 0, 1920, 1080, "长安", "", 1);
console.log(testList);

const test2 = dm.ocr(0, 0, 1920, 1080, "", 1.0);
console.log(test2);
