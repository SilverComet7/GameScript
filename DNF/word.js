const dm = require("dm.dll");
console.log(dm.dll.getBasePath());
dm.setPath(dm.dll.getBasePath());
const wzst = dm.setDict(0, "jt7000.txt");
// const testList = dm.findStr(0, 0, 1920, 1080, "长安", "000000", 1.0);
// console.log(testList, 111);
// 长安
// const test2 = dm.ocr(0, 0, 1920, 1080, "", 1.0);
// console.log(test2, 222);
// const base_path = dm.GetBasePath();
// dm.SetPath(base_path);
// dm.SetDict(0, "jt7000.txt");

const intX = 0,
  intY = 0;

dm_ret = dm.dll.FindStr(0, 0, 1920, 1080, "问", "", 1.0, intX, intY);
console.log(dm_ret);
