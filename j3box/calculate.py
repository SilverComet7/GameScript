import csv
import os
import random
import time
from concurrent.futures import ThreadPoolExecutor
import requests




# 基础设置
isThreadPool = False  # 是否开启多线程池
ThreadPoolNum = 5  # 线程池数量
exportDict = {  # 需导出字段

}


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
      priceIds = []
      for i in 8:
        # 产物价值计算
        CreateItemType = resJson["CreateItemType{id}".format(id=i)]
        CreateItemIndex =   resJson["CreateItemIndex{id}".format(id=i)]
        CreateItemMin  =  resJson["CreateItemMin{id}".format(id=i)]
        CreateItemMax =  resJson["CreateItemMax{id}".format(id=i)]
        #  材料成本计算
        RequireItemType =   resJson["RequireItemType{id}".format(id=i)]
        RequireItemIndex =  resJson["RequireItemIndex{id}".format(id=i)]
        RequireItemCount =  resJson["RequireItemCount{id}".format(id=i)]
        priceIds.append(CreateItemType + '_' + CreateItemIndex)
        priceIds.append(RequireItemType + '_' + RequireItemIndex)

      priceInfo = 'https://node.jx3box.com/craft/price?ids={priceIds}client=origin'.format(priceIds=)


def thread_pool(sub_f, list1):
    executor = ThreadPoolExecutor(5)
    all_results = executor.map(sub_f, list1)
    return all_results


if __name__ == '__main__':
    start = time.time()
    getItemInfo(4)
    # if isThreadPool:
    #     results = thread_pool(getWXBookTypeList)
    # else:
    #     for i in BookIds:
    #         getWXBookTypeList(i)
    end = time.time()
