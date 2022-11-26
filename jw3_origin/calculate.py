import csv
import json
import os
import random
import time
from concurrent.futures import ThreadPoolExecutor
import requests

# 查看单精力可获得最高利润   查看3日销量   查看最近30天价格趋势


# 6249 青铜钥匙磨
# 3316  铜锭 
# 3313火磨
# 精力 4点
# 6246 青铜钥匙




# 基础设置
isThreadPool = False  # 是否开启多线程池
ThreadPoolNum = 5  # 线程池数量

queryItemPriceCache = {

}

res = requests.get(
            'https://node.jx3box.com/craft/price?client=origin')
resJson = res.json()
print(resJson)

def getLifeSkillItems():
    # skillTypeList = ['founding']
    # path = 'https://node.jx3box.com/manufacture/{skillType}/{itemId}?client=origin'.format(skillType=)
    return bookList


def writeCSV(bookInfo, path):
    with open(path, 'w', encoding='UTF8', newline='') as f:
        fieldnames = ["Name","CostStamina","RequireLevel"]
        writer = csv.DictWriter(f, fieldnames=fieldnames, restval='intro', extrasaction='ignore')

        # 写入头
        writer.writeheader()

        for book in bookInfo:
            # 写入数据
            writer.writerow(book['bookInfo'])

def getItemInfo(itemId):
      ItemInfoPath = r'https://node.jx3box.com/manufacture/founding/{itemId}?client=origin'.format(itemId=itemId)
      res = requests.get(
            ItemInfoPath)
      resJson = res.json()
      for i in range(8):
        # 产物价值计算
        CreateItemType = resJson["CreateItemType{id}".format(id=i)]
        CreateItemIndex =   resJson["CreateItemIndex{id}".format(id=i)]
        CreateItemMin  =  resJson["CreateItemMin{id}".format(id=i)]
        CreateItemMax =  resJson["CreateItemMax{id}".format(id=i)]
        #  材料成本计算  区分哪些是商店哪些是拍卖行
        RequireItemType =   resJson["RequireItemType{id}".format(id=i)]
        RequireItemIndex =  resJson["RequireItemIndex{id}".format(id=i)]
        RequireItemCount =  resJson["RequireItemCount{id}".format(id=i)]
        # filter(x:)
        # if RequireItemIndex ==  s
      
        # https://next2.jx3box.com/api/item-price/5_6249/detail?server=%E7%BC%98%E8%B5%B7%E7%A8%BB%E9%A6%99&limit=15   //最近价格明细



def thread_pool(sub_f, list1):
    executor = ThreadPoolExecutor(5)
    all_results = executor.map(sub_f, list1)
    return all_results


if __name__ == '__main__':
    start = time.time()
    # getItemInfo(4)
    # if isThreadPool:
    #     results = thread_pool(getWXBookTypeList)
    # else:
    #     for i in BookIds:
    #         getWXBookTypeList(i)
    end = time.time()
