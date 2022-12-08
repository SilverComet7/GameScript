const axios = require("axios");
const mongoose = require("mongoose");
const moment = require("moment");
const craftList = require("./json/craft.json");
const belongList = require("./json/belongTypeList.json");
const { itemNameCache, craftNameMap, priceCountCache } = require("./const");


const craftSchema = new mongoose.Schema(
  {},
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  },
);
const craft = mongoose.model(
  "craft",
  craftSchema,
  `craft-origin-${moment().format()}`,
);

async function insertMongodb(resArr) {
  await mongoose.connect("mongodb://127.0.0.1:27017/jw3");
  craft.insertMany(resArr).then(() => console.log("success"));
}

// 获取物品拍卖行交易日志
async function getItemLog(obj, itemId) {
  const itemIdLog = await axios.get(
    `https://next2.jx3box.com/api/item-price/${itemId}/logs?server=%E7%BC%98%E8%B5%B7%E7%A8%BB%E9%A6%99`,
  );
  const logs = itemIdLog.data.data.logs?.slice(-5);
  if (!logs?.length) return;
  const logs30LowestPrice = itemIdLog.data.data.logs.sort((a, b) => a.LowestPrice - b.LowestPrice)[0].LowestPrice / 10000
  const logs30HighestPrice = itemIdLog.data.data.logs.sort((a, b) => b.HighestPrice - a.HighestPrice)[0].HighestPrice / 10000
  obj["最近30日最低价"] = logs30LowestPrice
  obj["最近30日最高价"] = logs30HighestPrice

  obj["最低价"] = logs[0].LowestPrice;
  obj["最高价"] = logs[0].HighestPrice;
  logs.forEach((element) => {
    obj["平均每日样本量"] += element.SampleSize;
    obj["平均价格"] += element.AvgPrice / 10000;
    obj["最低价"] =
      element.LowestPrice < obj["最低价"] ? element.LowestPrice : obj["最低价"];
    obj["最高价"] =
      element.HighestPrice > obj["最高价"]
        ? element.HighestPrice
        : obj["最高价"];
  });

  obj["平均每日样本量"] = obj["平均每日样本量"] / 5;
  obj["平均价格"] = obj["平均价格"] / 5;
  obj["最低价"] = obj["最低价"] / 10000;
  obj["最高价"] = obj["最高价"] / 10000;
}

// 获取拍卖行最近一次上架的价格 / 当时的拍卖行的数量记录
async function getItemRecentlyPrice(itemId) {
  if (priceCountCache[itemId]) {
    const { unitPrice, n_count } = priceCountCache[itemId];
    return { unitPrice, n_count };
  }
  const itemPrice = await axios.get(
    `https://next2.jx3box.com/api/item-price/${itemId}/detail?server=%E7%BC%98%E8%B5%B7%E7%A8%BB%E9%A6%99&limit=15`,
  );
  // 获取最近上架的5条记录最低单价和最高数量
  const recentUpItemList = itemPrice.data.data.prices?.slice(0, 5)
  //  itemPrice.data.data.prices?.
  //   filter((item) => item.created * 1000 > new Date().setHours(0, 0, 0, 0))
  //   .slice(0, 5);
  const unitPrice =
    recentUpItemList?.[0]?.unit_price /
    10000; // 按单价正向排序，找上架的最低单价
  const n_count = recentUpItemList.sort((a, b) => b.n_count - a.n_count)?.[0]
    ?.n_count; // 按数量逆向排序，找拍卖行上架的最大数量

  priceCountCache[itemId] = {
    unitPrice,
    n_count,
  };
  // console.log(priceCountCache);
  return { unitPrice, n_count };
}
// getItemRecentlyPrice("5_55614")

// 获取物品名称
async function getItemName(itemId) {
  if (itemNameCache[itemId]) return itemNameCache[itemId];
  const res = await axios.get(
    `https://node.jx3box.com/other?client=origin&ids=${itemId}`,
  );
  const name = res.data.list[0].Name;
  itemNameCache[itemId] = name;
  return name;
}

async function getItemInfo(type, itemId) {
  try {
    const res = await axios.get(
      `https://node.jx3box.com/manufacture/${type}/${itemId}?client=origin`,
    );
    const resJson = res.data;
    if (
      craftNameMap[type].excludeStr.length &&
      craftNameMap[type].excludeStr.some((e) => resJson["szTip"].includes(e))
    )
      return;
    if (craftNameMap[type].minCost > resJson["CostStamina"]) return;
    const costNumber = 2600 / resJson["CostStamina"]; // 一管精力可打造该物品次数

    const genItemInfo = {
      单精力最小利润: undefined,
      单精力最大利润: undefined,
      拍卖行上架的数量: undefined,
      最近5天上架数据: {
        // 5.5天刚好整管精力回满，要在期间内一轮售卖结束
        平均每日样本量: 0, // 越高，上架竞争越激烈      // 通过交易样本量判断市场需求量,  预计本身赚取其中20%
        平均价格: 0, // 判断当前价格是否高于均价  有降价可能性
        最低价: 0,
        最高价: 0,
        最近30日最低价: 0,
        最近30日最高价: 0,
      },
      名称: resJson["Name"],
      技艺类别: craftNameMap[resJson["__TabType"]]?.name,
      所需技艺等级: resJson["nLevel"],
      提示: resJson["szTip"],
      拍卖行最近上架单价: undefined,
      整管精力RMB: undefined,
      整管精力需要成本: undefined,
      配方: [],
      单次制作所需成本: undefined,
      最小上架回本单价: undefined,
      物品类别: belongList.find(
        (item) =>
          item.BelongID == resJson["Belong"] &&
          item.ProfessionID == resJson["ProfessionID"],
      )?.BelongName,
      整管精力耗时: costNumber * resJson["PrepareFrame"],
      查询id: itemId,
      // 市场5天百分之20体量可容纳N个满精账号制作该物品: 0,
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
        const { unitPrice, n_count } = await getItemRecentlyPrice(
          CreatedItemId,
        );
        genItemInfo["拍卖行最近上架单价"] = unitPrice;
        genItemInfo["拍卖行上架的数量"] = n_count;
        getMinPriceAll = CreateItemMin * unitPrice * 0.95; // 最小价格  拍卖行5%手续费  + 保管费用
        getMaxPriceAll = CreateItemMax * unitPrice * 0.95; // 最大价格  拍卖行5%手续费  + 保管费用
        await getItemLog(genItemInfo["最近5天上架数据"], CreatedItemId);
        genItemInfo["市场5天百分之20体量可容纳N个满精账号制作该物品"] =
          genItemInfo["最近5天上架数据"]["平均每日样本量"] / costNumber;
      }
      // 材料成本计算  区分哪些是商店哪些是拍卖行
      const RequireItemIndex = resJson[`RequireItemIndex${index}`];
      if (!RequireItemIndex) continue;
      else {
        const RequireItemType = resJson[`RequireItemType${index}`];
        const RequireItemCount = resJson[`RequireItemCount${index}`];
        const craftFromNPC = craftList.find(
          (item) => item.ItemIndex === RequireItemIndex,
        );
        let craftUnitPrice = craftFromNPC?.Price / 10000; //  商店中能买到的
        let craftItemName = craftFromNPC?.Name;
        if (!craftFromNPC?.Price) {
          const RequireItemId = `${RequireItemType}_${RequireItemIndex}`;
          // 找材料的拍卖行价格
          const { unitPrice } = await getItemRecentlyPrice(RequireItemId);
          craftUnitPrice = unitPrice;
          // 找材料的名字
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
    genItemInfo["最小上架回本单价"] =
      buyPriceAll / 0.95 / resJson["CreateItemMin1"];
    console.log(genItemInfo);
    return genItemInfo;
  } catch (error) {
    console.log(error);
  }
}

async function getItemList(gameType, serverName, type = "founding") {
  const res = await axios.get(
    `https://node.jx3box.com/manufactures?client=origin&type=${type}&mode=simple`,
  );
  const filterQueryItem = craftNameMap[type].BelongID.length
    ? res.data.filter((e) => craftNameMap[type].BelongID.includes(e.Belong))
    : res.data; // Belong 分类过滤
  const thisTypeItemMap = filterQueryItem
    .filter((item) => {
      if (craftNameMap[type].minRequireLevel)
        return item["nLevel"] >= craftNameMap[type].minRequireLevel; // 最小制作等级过滤
      return item;
    })
    .map(async (element) => {
      return await getItemInfo(type, element.ID);
    });
  Promise.all(thisTypeItemMap).then(async (res) => {
    await insertMongodb(res.filter(Boolean));
  });
  return thisTypeItemMap;
}

function getAllCraft(gameType, serverName) {
  Object.keys(craftNameMap).map(async (item) => await getItemList(gameType, serverName, item));
}

// getItemInfo("cooking", 3)
//  getItemList();
getAllCraft();
