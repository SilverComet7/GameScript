const axios = require('axios')
const craftList = require("./craft.json")
const belongList = require("./belongTypeList.json")
const fs = require('fs')
const mongoose = require('mongoose');
const Cook = mongoose.model('Cook', { time: String, info: Object });

// 查看单精力可获得最高利润   查看3日销量   查看最近30天价格趋势

const craftNameMap = {
  founding: {
    name: '铸造',
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [110, 120],
    excludeStr: ["掉落", "购买"],
  },
  cooking:
  {
    name: '烹饪', // 4
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [50, 60],
    excludeStr: ["掉落", "购买"],
  },
  medicine: {
    name: '制药',
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [80],
    excludeStr: ["掉落", "购买"],
  },
  tailoring:
  {
    name: "缝纫",
    minRequireLevel: 15,
    BelongID: [80],
    excludeStr: ["掉落", "购买"],
  }

}

const priceCache = {

}
const itemNameCache = {
  '1829': '竹叶青',
  '1832': '富水',
  '2204': '石冻春',
  '2269': '肉丸',
  '3154': '杂碎',
  '3168': '肥肉',
  '3169': '肠',
  '3170': '腱子肉',
  '3171': '腰子',
  '3176': '瘦肉',
  '3177': '筋',
  '3178': '五花肉',
  '3179': '血',
  '3180': '里脊肉',
  '3181': '排骨',
  '3184': '肉馅',
  '55617': '卤料',
  '55623': '人参',
}
const craftArr = []


async function insertMongodb() {
  await mongoose.connect('mongodb://127.0.0.1:27017/jw3');
  const cookInstance = new Cook({ time: Date(), info: craftArr })
  cookInstance.save().then(() => console.log("success"))
}



// https://node.jx3box.com/manufacture/cooking/55617?client=origin
async function getItemInfo(type, itemId) {
  const res = await axios.get(`https://node.jx3box.com/manufacture/${type}/${itemId}?client=origin`)
  const resJson = res.data
  if (craftNameMap[type].excludeStr.some(e => resJson['szTip'].includes(e))) return;
  const genItemInfo = {
    查询id: itemId,
    名称: resJson['Name'],
    物品类别: belongList.find(item => item.BelongID == resJson['Belong'] && item.ProfessionID == resJson["ProfessionID"])?.BelongName,
    技艺类别: craftNameMap[resJson['__TabType']]?.name,
    所需技艺等级: resJson['RequireLevel'],
    单次所需精力: resJson["CostStamina"],
    提示: resJson["szTip"],
    拍卖行单价: undefined,
    单精力最小利润: undefined,
    单精力最大利润: undefined,
    整管精力耗时: 2600 / resJson["CostStamina"] * resJson["PrepareFrame"],
    最小出货量: resJson[`CreateItemMin1`],
    最大出货量: resJson[`CreateItemMax1`],
    配方: [],
    // 昨日均格:https://next2.jx3box.com/api/item-price/8_634/logs?server=缘起稻香 日志
  }
  let getPriceAll = 0
  let getMaxPriceAll = 0
  let buyPriceAll = 0
  const requireItemIndex = ''
  for (let index = 1; index <= 8; index++) {
    //   产物价值计算
    const CreateItemType = resJson[`CreateItemType${index}`];
    const CreateItemIndex = resJson[`CreateItemIndex${index}`];
    const CreateItemMin = resJson[`CreateItemMin${index}`];
    const CreateItemMax = resJson[`CreateItemMax${index}`];
    if (CreateItemIndex) {
      const CreatedItemId = `${CreateItemType}_${CreateItemIndex}`
      const unitPrice = await getItemRecentlyPrice(CreatedItemId)
      genItemInfo["拍卖行单价"] = unitPrice
      getPriceAll = CreateItemMin * unitPrice   // 最小出货量
      getMaxPriceAll = CreateItemMax * unitPrice   // 最小出货量
    }
    // 材料成本计算  区分哪些是商店哪些是拍卖行
    RequireItemType = resJson[`RequireItemType${index}`];
    RequireItemIndex = resJson[`RequireItemIndex${index}`];
    RequireItemCount = resJson[`RequireItemCount${index}`];
    if (RequireItemIndex) {
      const craftFromNPC = craftList.find(item => item.ItemIndex === RequireItemIndex)
      let craftUnitPrice = craftFromNPC?.Price / 10000 //  商店中买到的
      let craftItemName = craftFromNPC?.Name
      if (!craftUnitPrice) {
        const RequireItemId = `${RequireItemType}_${RequireItemIndex}`
        // 找材料的拍卖行价格  最近销量  名字
        craftUnitPrice = await getItemRecentlyPrice(RequireItemId)
        craftItemName = await getItemName(RequireItemIndex)
      }
      genItemInfo['配方'].push({ id: RequireItemIndex, name: craftItemName, craftUnitPrice, RequireItemCount, from: craftFromNPC?.Price ? "商店" : "拍卖行" })
      buyPriceAll += RequireItemCount * craftUnitPrice
    }
  }
  const oneCostPrice = (getPriceAll - buyPriceAll) / resJson['CostStamina']
  const oneMaxCostPrice = (getMaxPriceAll - buyPriceAll) / resJson['CostStamina']
  genItemInfo["单精力最小利润"] = oneCostPrice
  genItemInfo["单精力最大利润"] = oneMaxCostPrice
  console.log(genItemInfo);
  craftArr.push(genItemInfo)
}


async function getItemRecentlyPrice(itemId) {
  if (priceCache[itemId]) return priceCache[itemId]
  const itemPrice = await axios.get(`https://next2.jx3box.com/api/item-price/${itemId}/detail?server=%E7%BC%98%E8%B5%B7%E7%A8%BB%E9%A6%99&limit=15`)
  const unitPrice = itemPrice.data.data.prices?.[0]?.unit_price / 10000
  priceCache[itemId] = unitPrice
  // console.log(`from拍卖行${itemId}:${unitPrice}`);
  return unitPrice
}

async function getItemName(itemId) {
  if (itemNameCache[itemId]) return itemNameCache[itemId]
  const res = await axios.get(`https://node.jx3box.com/other?client=origin&ids=${itemId}`)
  const name = res.data.list[0].Name
  itemNameCache[itemId] = name
  return name
}


async function getItemList(type = "founding") {
  const res = await axios.get(`https://node.jx3box.com/manufactures?client=origin&type=${type}&mode=simple`)
  const filterQueryItem = res.data.filter(e => craftNameMap[type].BelongID.includes(e.Belong))
  const thisTypeItemMap = filterQueryItem.map(async element => {
    return await getItemInfo(type, element.ID)
  });
  Promise.all(thisTypeItemMap).then(async res => {
    sortAndWrite(type)
    console.log(itemNameCache);
    await insertMongodb()
  })
}



async function getAllCraft() {
  const arr = []
  for (const key in craftNameMap) {
    if (Object.hasOwnProperty.call(object, key)) {
      arr.push(await getItemList(key))
    }
  }
  Promise.all(arr).then(res => {
    sortAndWrite()
  })
}

function sortAndWrite(type) {
  craftArr.sort((a, b) => b["单精力最小利润"] - a["单精力最小利润"])
  fs.writeFileSync(`${type}.json`, JSON.stringify(craftArr), { flag: "w" })
}


// getItemInfo("cooking", 139)

getItemList("cooking")

// getAllCraft()

