const dm = require("dm.dll");
console.log(dm.dll.ver());
console.log(dm.getScreenSize());
console.log(dm.getColor(594, 205));

dm.findPic()("长安");

const testList = dm.findStr(0, 0, 1920, 1080, "长安", "ce9178", 1);
console.log(testList);
