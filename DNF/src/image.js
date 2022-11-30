const dm = require("dm.dll");

// console.log(dm.dll.findPicE);
dm.bindWindow

const image = dm.findPic(0, 0, 1920, 1080, "test.bmp", "", 0.6);
const imageOriginXY = {
  x: 0,
  y: 0,
};
const imageOrigin = dm.dll.findPic(
  0,
  0,
  1920,
  1080,
  "test.bmp",
  "",
  0.4,
  0,
  imageOriginXY.x,
  imageOriginXY.y
);
