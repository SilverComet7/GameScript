const axios = require('axios')
const craftList = require("./craft.json")
const belongList = require("./belongTypeList.json")
const fs = require('fs')
const mongoose = require('mongoose');


const craftSchema = new mongoose.Schema(
  {

  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

const craft = mongoose.model('craft', craftSchema, 'craft');

// 查看单精力可获得最高利润   查看最近30天价格趋势  最近上架速度

const craftNameMap = {
  founding: {
    name: '铸造',
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [110, 120],
    excludeStr: ["节日", "掉落", "购买"],
  },
  cooking:
  {
    name: '烹饪', // 4
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [50, 60],
    excludeStr: ["节日", "掉落", "购买"],
  },
  medicine: {
    name: '制药',
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [40, 50],
    excludeStr: ["节日", "掉落", "购买"],
  },
  tailoring:
  {
    name: "缝纫",
    minRequireLevel: 15,
    BelongID: [80],
    excludeStr: ["节日", "掉落", "购买"],
  }
}

const priceCache = {

}
const itemNameCache = {
  '973': '谷帘泉',
  '974': '趵突泉',
  '975': '古井泉',
  '976': '天山雪水',
  '979': '五莲泉',
  '985': '虎皮',
  '986': '狼皮',
  '987': '猪皮',
  '988': '熊皮',
  '1828': '隐月线',
  '1829': '竹叶青',
  '1832': '富水',
  '2204': '石冻春',
  '2269': '肉丸',
  '2468': '百花布',
  '2625': '精铁锭',
  '2651': '龙台磨石',
  '2652': '玄铁锭',
  '2667': '玉钢锭',
  '3010': '露水',
  '3012': '芍药',
  '3016': '相思子',
  '3018': '车前草',
  '3020': '天名精',
  '3024': '五味子',
  '3025': '金银花',
  '3029': '枸杞',
  '3031': '远志',
  '3032': '仙茅',
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
  '3252': '粗布',
  '3254': '细布',
  '3257': '棉布',
  '3259': '方纹绫',
  '3263': '丝绸',
  '3264': '鱼口绫',
  '3270': '彩锦',
  '3271': '白编绫',
  '3278': '绫罗',
  '3279': '水波绫',
  '3288': '珍珠缀放',
  '3295': '轻容纱',
  '3296': '方棋绫',
  '3299': '霓霞线',
  '3302': '千年冰芯',
  '3306': '巨兽毛皮',
  '3308': '天蛛丝',
  '3316': '铜锭',
  '3319': '锡锭',
  '3320': '青铜锭',
  '3323': '紫背铅',
  '3326': '丹砂',
  '3328': '锌锭',
  '3334': '生铁锭',
  '3335': '熟铁锭',
  '3337': '钢锭',
  '3339': '银砂',
  '3340': '银锭',
  '3341': '密银锭',
  '3343': '红铜',
  '3344': '锡砂',
  '3345': '草节铅',
  '3346': '炉甘石',
  '3347': '砂铁',
  '3348': '银礁',
  '3539': '金甲片',
  '3542': '貂皮',
  '3543': '雨花石',
  '5039': '百编皮革',
  '9033': '真龙谱',
  '9445': '赤铁矿石',
  '9447': '月锡矿石',
  '9692': '麦冬',
  '9699': '虫草',
  '55606': '赤铁锭',
  '55607': '精钢锭',
  '55608': '粗锡锭',
  '55609': '月锡锭',
  '55610': '五色石',
  '55614': '药汤',
  '55617': '卤料',
  '55620': '玛瑙',
  '55621': '银鳞',
  '55623': '人参',
  '55624': '猫眼石',
  '55627': '沉香木',
  '55933': '寒凝砂',
  null: '默认'
}
const craftArr = []


async function insertMongodb(resA) {
  await mongoose.connect('mongodb://127.0.0.1:27017/jw3');
  craft.insertMany(resA).then(() => console.log("success"))
}


async function getItemInfo(type, itemId) {
  const res = await axios.get(`https://node.jx3box.com/manufacture/${type}/${itemId}?client=origin`)
  const resJson = res.data
  if (craftNameMap[type].excludeStr.some(e => resJson['szTip'].includes(e))) return;
  const costNumber = 2600 / resJson["CostStamina"] // 一管体力打造该物品需要的次数

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
    整管精力RMB: undefined,
    整管精力需要成本: undefined,
    整管精力耗时: costNumber * resJson["PrepareFrame"],
    最小出货量: resJson[`CreateItemMin1`],
    最大出货量: resJson[`CreateItemMax1`],
    配方: [],
    // 物品使用场景:'0',
    // 昨日均格:https://next2.jx3box.com/api/item-price/8_634/logs?server=缘起稻香   最近30天均价
  }
  let getMinPriceAll = 0
  let getMaxPriceAll = 0
  let buyPriceAll = 0
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
      getMinPriceAll = CreateItemMin * unitPrice   // 最小出货量
      getMaxPriceAll = CreateItemMax * unitPrice   // 最大出货量
    }
    // 材料成本计算  区分哪些是商店哪些是拍卖行
    const RequireItemIndex = resJson[`RequireItemIndex${index}`];
    if (!RequireItemIndex) continue;
    else {
      const RequireItemType = resJson[`RequireItemType${index}`];
      const RequireItemCount = resJson[`RequireItemCount${index}`];
      const craftFromNPC = craftList.find(item => item.ItemIndex === RequireItemIndex)
      let craftUnitPrice = craftFromNPC?.Price / 10000 //  商店中能买到的
      let craftItemName = craftFromNPC?.Name
      if (!craftFromNPC?.Price) {
        // 找材料的拍卖行价格   物品名字
        const RequireItemId = `${RequireItemType}_${RequireItemIndex}`
        craftUnitPrice = await getItemRecentlyPrice(RequireItemId)
        craftItemName = await getItemName(RequireItemIndex)
      }
      genItemInfo['配方'].push({ id: RequireItemIndex, 材料名称: craftItemName, 材料单价: craftUnitPrice, 需要数量: RequireItemCount, 来源: craftFromNPC?.Price ? "商店" : "拍卖行", 整管精力需要数量: costNumber * RequireItemCount })
      buyPriceAll += RequireItemCount * craftUnitPrice
    }
  }

  const oneCostMinPrice = (getMinPriceAll - buyPriceAll) / resJson['CostStamina']
  const oneCostMaxPrice = (getMaxPriceAll - buyPriceAll) / resJson['CostStamina']
  genItemInfo["单精力最小利润"] = oneCostMinPrice
  genItemInfo["整管精力RMB"] = oneCostMinPrice * 2600 / 180  // 1:180
  genItemInfo["单精力最大利润"] = oneCostMaxPrice
  genItemInfo["整管精力需要成本"] = buyPriceAll * costNumber
  // console.log(genItemInfo);
  // craftArr.push(genItemInfo)
  return genItemInfo
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
    console.log(res);
    await insertMongodb(res)
  })
  return thisTypeItemMap
}



async function getAllCraft() {
  const arrMap = Object.keys(craftNameMap).map(async item => await getItemList(item))
  console.log(arrMap);
  // Promise.all(arrMap).then(async res => {
  //   console.log(res);
  //   await insertMongodb()
  // })
}

function sortAndWrite(type) {
  craftArr.sort((a, b) => b["单精力最小利润"] - a["单精力最小利润"])
  fs.writeFileSync(`${type}.json`, JSON.stringify(craftArr), { flag: "w" })
}


// getItemInfo("medicine", 94)

// getItemList("tailoring")

getAllCraft()
