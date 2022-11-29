const axios = require("axios");
const craftList = require("./json/craft.json");
const belongList = require("./json/belongTypeList.json");
const mongoose = require("mongoose");
const { itemNameCache, craftNameMap } = require("./const");

const craftSchema = new mongoose.Schema(
  {},
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

const craft = mongoose.model("craft", craftSchema, "craft-origin-2022-11-19");

async function insertMongodb(resArr) {
  await mongoose.connect("mongodb://127.0.0.1:27017/jw3");
  craft.insertMany(resArr).then(() => console.log("success"));
}

const priceCache = {};

// 获取物品拍卖行交易日志
async function getItemLog(obj, itemId) {
  const itemIdLog = await axios.get(
    `https://next2.jx3box.com/api/item-price/${itemId}/logs?server=%E7%BC%98%E8%B5%B7%E7%A8%BB%E9%A6%99`
  );
  console.log(itemIdLog);
  const logs = itemIdLog.data.data.logs?.slice(-5);
  if (!logs.length) return;
  obj["最低价"] = logs[0].LowestPrice;
  obj["最高价"] = logs[0].HighestPrice;
  logs.forEach((element) => {
    obj["平均成交量"] += element.SampleSize;
    obj["平均价格"] += element.AvgPrice / 10000;
    obj["最低价"] =
      element.LowestPrice < obj["最低价"] ? element.LowestPrice : obj["最低价"];
    obj["最高价"] =
      element.HighestPrice > obj["最高价"]
        ? element.HighestPrice
        : obj["最高价"];
  });
  obj["平均成交量"] = obj["平均成交量"] / 5;
  obj["平均价格"] = obj["平均价格"] / 5;
  obj["最低价"] = obj["最低价"] / 10000;
  obj["最高价"] = obj["最高价"] / 10000;
}

// 获取拍卖行最近上架的价格记录
async function getItemRecentlyPrice(itemId) {
  if (priceCache[itemId]) return priceCache[itemId];
  const itemPrice = await axios.get(
    `https://next2.jx3box.com/api/item-price/${itemId}/detail?server=%E7%BC%98%E8%B5%B7%E7%A8%BB%E9%A6%99&limit=15`
  );
  const unitPrice = itemPrice.data.data.prices?.[0]?.unit_price / 10000;
  priceCache[itemId] = unitPrice;
  // console.log(`from拍卖行${itemId}:${unitPrice}`);
  return unitPrice;
}

// 获取物品名称
async function getItemName(itemId) {
  if (itemNameCache[itemId]) return itemNameCache[itemId];
  const res = await axios.get(
    `https://node.jx3box.com/other?client=origin&ids=${itemId}`
  );
  const name = res.data.list[0].Name;
  itemNameCache[itemId] = name;
  return name;
}

async function getItemInfo(type, itemId) {
  try {
    const res = await axios.get(
      `https://node.jx3box.com/manufacture/${type}/${itemId}?client=origin`
    );
    const resJson = res.data;
    if (craftNameMap[type].excludeStr.some((e) => resJson["szTip"].includes(e)))
      return;
    const costNumber = 2600 / resJson["CostStamina"]; // 一管精力可打造该物品次数

    const genItemInfo = {
      查询id: itemId,
      名称: resJson["Name"],
      物品类别: belongList.find(
        (item) =>
          item.BelongID == resJson["Belong"] &&
          item.ProfessionID == resJson["ProfessionID"]
      )?.BelongName,
      技艺类别: craftNameMap[resJson["__TabType"]]?.name,
      所需技艺等级: resJson["RequireLevel"],
      单次所需精力: resJson["CostStamina"],
      提示: resJson["szTip"],
      拍卖行单价: undefined,
      单精力最小利润: undefined,
      单精力最大利润: undefined,
      单次制作所需成本: undefined,
      整管精力RMB: undefined,
      整管精力需要成本: undefined,
      整管精力耗时: costNumber * resJson["PrepareFrame"], // 80 PrepareFrame === 5S
      // 最小出货量: resJson[`CreateItemMin1`],
      // 最大出货量: resJson[`CreateItemMax1`],
      配方: [],
      最近5天: {
        // 5.5天刚好整管精力回满，要在期间内一轮售卖结束
        平均成交量: 0, // 判断市场需求量,  预计本身赚取其中20%
        平均价格: 0, // 判断当前价格是否高于均价  有降价可能性
        最低价: 0,
        最高价: 0,
      },
      市场5天百分之20体量可容纳N个满精账号制作该物品: 0,
      // 物品使用场景:undefined,
    };
    let getMinPriceAll = 0;
    let getMaxPriceAll = 0;
    let buyPriceAll = 0;
    for (let index = 1; index <= 8; index++) {
      //   产物价值计算
      const CreateItemType = resJson[`CreateItemType${index}`];
      const CreateItemIndex = resJson[`CreateItemIndex${index}`];
      const CreateItemMin = resJson[`CreateItemMin${index}`];
      const CreateItemMax = resJson[`CreateItemMax${index}`];
      if (CreateItemIndex) {
        const CreatedItemId = `${CreateItemType}_${CreateItemIndex}`;
        const unitPrice = await getItemRecentlyPrice(CreatedItemId);
        genItemInfo["拍卖行单价"] = unitPrice;
        getMinPriceAll = CreateItemMin * unitPrice * 0.95; // 最小价格  拍卖行5%手续费  + 保管费用
        getMaxPriceAll = CreateItemMax * unitPrice * 0.95; // 最大价格  拍卖行5%手续费  + 保管费用
        await getItemLog(genItemInfo["最近5天"], CreatedItemId);
        genItemInfo["市场5天百分之20体量可容纳N个满精账号制作该物品"] =
          genItemInfo["最近5天"]["平均成交量"] / costNumber;
      }
      // 材料成本计算  区分哪些是商店哪些是拍卖行
      const RequireItemIndex = resJson[`RequireItemIndex${index}`];
      if (!RequireItemIndex) continue;
      else {
        const RequireItemType = resJson[`RequireItemType${index}`];
        const RequireItemCount = resJson[`RequireItemCount${index}`];
        const craftFromNPC = craftList.find(
          (item) => item.ItemIndex === RequireItemIndex
        );
        let craftUnitPrice = craftFromNPC?.Price / 10000; //  商店中能买到的
        let craftItemName = craftFromNPC?.Name;
        if (!craftFromNPC?.Price) {
          // 找材料的拍卖行价格   物品名字
          const RequireItemId = `${RequireItemType}_${RequireItemIndex}`;
          craftUnitPrice = await getItemRecentlyPrice(RequireItemId);
          craftItemName = await getItemName(RequireItemIndex);
        }
        genItemInfo["配方"].push({
          id: RequireItemIndex,
          材料名称: craftItemName,
          材料单价: craftUnitPrice,
          需要数量: RequireItemCount,
          来源: craftFromNPC?.Price ? "商店" : "拍卖行",
          整管精力需要数量: costNumber * RequireItemCount,
        });
        buyPriceAll += RequireItemCount * craftUnitPrice;
      }
    }
    const oneCostMinPrice =
      (getMinPriceAll - buyPriceAll) / resJson["CostStamina"];
    const oneCostMaxPrice =
      (getMaxPriceAll - buyPriceAll) / resJson["CostStamina"];
    genItemInfo["单精力最小利润"] = oneCostMinPrice;
    genItemInfo["单精力最大利润"] = oneCostMaxPrice;
    genItemInfo["整管精力RMB"] = (oneCostMinPrice * 2600) / 190; // 1:190  最小利润计算
    genItemInfo["单次制作所需成本"] = buyPriceAll;
    genItemInfo["整管精力需要成本"] = buyPriceAll * costNumber;
    // console.log(genItemInfo);
    return genItemInfo;
  } catch (error) {
    console.log(error);
  }
}

async function getItemList(type = "founding") {
  const res = await axios.get(
    `https://node.jx3box.com/manufactures?client=origin&type=${type}&mode=simple`
  );
  const filterQueryItem = res.data.filter((e) =>
    craftNameMap[type].BelongID.includes(e.Belong)
  );
  const thisTypeItemMap = filterQueryItem.map(async (element) => {
    return await getItemInfo(type, element.ID);
  });
  Promise.all(thisTypeItemMap).then(async (res) => {
    console.log(res.filter(Boolean));
    await insertMongodb(res.filter(Boolean));
  });
  return thisTypeItemMap;
}

function getAllCraft() {
  Object.keys(craftNameMap).map(async (item) => await getItemList(item));
}

// getItemInfo("medicine", 94)

// getItemList("medicine")

getAllCraft();
