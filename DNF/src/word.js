const dm = require("dm.dll");
dm.setPath("D:/GameScript/DNF")
const zt = dm.setDict(0, "宋体9号数字.txt");
const word = dm.findStr(0, 0, 1920, 1080, "1312", "000000", 1.0);
console.log(word);
const ocrWord = dm.ocr(522, 250, 565, 270, "000000", 1.0)
console.log(ocrWord);