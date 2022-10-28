function getDM() {
  const dmjs = require("dm.dll");
  const dm = dmjs.dll;
  return {
    dmjs,
    dm,
  };
}

const { dmjs, dm } = getDM();
const base_path = dm.GetBasePath();
dm.SetPath(base_path);
dm.SetDict(0, "jt7000.txt");
console.log("🚀 ~ file: back.js ~ line 12 ~ base_path", base_path);

hwnd = dm.GetForegroundWindow();
console.log(hwnd);
