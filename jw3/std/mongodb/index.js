const mongoose = require("mongoose");
const craftSchema = new mongoose.Schema(
    {},
    {
      versionKey: false,
      timestamps: true,
      strict: false,
    }
);
const craft = mongoose.model("craft", craftSchema, "craft-std-2022-12-4");

 async function insertMongodb(resArr) {
  await mongoose.connect("mongodb://127.0.0.1:27017/jw3");
  craft.insertMany(resArr).then(() => console.log("success"));
}

module.exports = {
  insertMongodb
}
