 const craftNameMap = {
  founding: {
    name: "铸造",
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [120],
    excludeStr: ["节日", "掉落", "购买"],
  },
  cooking: {
    name: "烹饪", // 4
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [50, 60],
    excludeStr: ["节日", "掉落", "购买"],
  },
  medicine: {
    name: "制药",
    minCost: 15,
    minRequireLevel: 15,
    BelongID: [40, 50],
    excludeStr: ["节日", "掉落", "购买"],
  },
  tailoring: {
    name: "缝纫",
    BelongID: [80],
    excludeStr: ["节日", "掉落", "购买"],
  },
};
 const itemNameCache = {};
 const priceCache = {};

module.exports = {
  craftNameMap,
  itemNameCache,
  priceCache,
};
