function getDM() {
  const dmjs = require("dm.dll");

  const dm = dmjs.dll;
  return {
    dmjs,
    dm,
  };
}
const { dmjs, dm } = getDM();

