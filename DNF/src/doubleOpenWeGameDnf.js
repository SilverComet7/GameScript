const dm = require("dm.dll");
const weGame = dm.findWindow("TWINCONTROL", "WeGame");
const bindWeGame = dm.bindWindow(weGame, "normal", "normal", "normal", 0);

function execAndDelay(fn, time = 1000) {
  setTimeout(() => {
    fn();
  }, time);
}

function moveAndClick(x, y, clickWay = "L", time = Math.random() * 1000) {
  setTimeout(() => {
    dm.dll.MoveToEx(x, y, 20, 20);
    console.log();
    if (clickWay === "L") {
      dm.leftClick();
    } else {
      dm.rightClick();z
    }
  }, time);
}

if (bindWeGame) {
  console.log("绑定成功");
  dm.setWindowState(weGame, 1);
  moveAndClick(65, 200);
  execAndDelay(() => moveAndClick(442, 27), 3000);

  const isFirstDnf = setInterval(() => {
    const dnf = dm.findWindow("TWINCONTROL", "dnf");
    // 找到登陆界面
    if (dnf) {
      clearInterval(isFirstDnf);
    }
  }, 2000);
}

/**
 *  str是用户键盘输入
 *  key是用户输入key的对象，str === key.name
 *  key.ctrl和key.shift默认都是false
 *  只有当key.ctrl为true，才会达到组合效果
 */
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
  console.log(str);
  console.log(key);
  //按住ctrl+d退出
  if (key.ctrl === true && key.name === "d") {
    process.exit(0);
  }
});
