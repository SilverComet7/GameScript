const { default: StateMachine } = require('../node_modules/wow-state-machine/dist/state-machine')
const dm = require("dm.dll");
console.log(dm);
// dm.setPath("D:/GameScript/DNF/assert")
// dm.setDict(0, "宋体9号数字.txt")
// const img = dm.findPic(1388, 177, 1920, 1080, "11drsn.bmp", "151515", 0.6, 0)
const wGame = dm.findWindow("TWINCONTROL", "WeGame")
const bindR = dm.bindWindow(wGame, 'normal', "normal", 'normal', 2)


// setInterval(() => {
//   dm.moveTo(450, 25)
//   dm.leftClick()
// }, 3000);

// 这是一个用于测试的始终返回 state1 的状态机
const otherStateMachine = new StateMachine(() => "state1").on("state1", () =>
  console.log("otherStateMachine", "state1")
);

const stateMachine = new StateMachine(() => {
  // 模拟十分之一概率的错误
  num = Math.ceil(Math.random() * 10)
  if (num === 1) throw Error("发生错误了");
  // 模拟十分之二的概率返回 state1
  else if (num < 4) return "state1";
  // 模拟十分之二的概率返回 刷图
  else if (num < 6) return "刷图";
  // 模拟十分之二的概率返回 state3
  else if (num < 8) return "state3";
  // 模拟十分之一的概率返回 state4
  else if (num === 8) return "state4";
  // 模拟剩下十分之二的概率返回 unknown
  else return "unknown"; // 未知问题,返回地图重新进
})
  // 任意状态发生的时候都会触发 onTick
  .onTick((state, lastState, isFirstTick) =>
    console.log(state, lastState, isFirstTick)
  )
  // 当 state1 发生的时候，启动一个每 100 毫秒输出一次 'state1' 的定时任务（如果发生了其他事情，该定时任务会停止
  .on("state1", () => console.log("state1"), 0, 100)
  // 当 刷图 发生的时候，启动一个每 200 毫秒（tick 默认 200）输出一次 '刷图' 的定时任务。如果 刷图 持续了超过 10 秒钟，则触发超时
  .on("刷图", () => console.log("刷图"), 10 * 1000)
  // 当 state3 发生的时候启动 otherStateMachine 状态机（如果没发生，该状态机会被自动停止
  .on("state3", otherStateMachine, 0, 500)
  // 当 state4 发生的时候，"阻塞"整个状态机（tick 被设置成了 -Infinity），直到 state4 的任务执行完毕后，状态机才会继续工作
  .on(
    "state4",
    () => {
      console.log("state4 开始了");
      return new Promise((resolve) => {
        setTimeout(() => resolve(console.log("state4 结束了")), 3 * 1000);
      });
    },
    0,
    -Infinity
  )
  // 如果超过了 2 秒钟啥事情都没有发生（unknown 状态），则触发超时
  .on("unknown", () => console.log("没有事情发生..."), 2 * 1000)
  // 捕获状态机执行期间的所有超时，当超时发生时状态机会终止
  .onTimeout((state) => console.log(state, "超时了"))
  // 捕获状态机执行期间的所有异常，当异常发生时状态机会终止
  .onError((e) => console.log(e));

// 启动状态机，让其每 500 毫秒检测一次状态（tick 默认 200）
// stateMachine.start(500);
// stateMachine.stop() // 终止状态机
