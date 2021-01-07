---
title: Python处理Excel和MySQL数据
date: 2018-01-07 19:21:26
tags:
- Python
categories:
- Script
password: '0622'
---



**. . .**<!-- more -->

# mysql数据的处理和excel数据的读

比如mysql数据的处理和excel数据的读(写在最下方), 如下

```python
# encoding=utf-8

import pandas as pd
import pymysql
import math
import traceback


class DB:
    def __init__(self, host='localhost', port=3306, db='', user='root', passwd='root', charset='utf8'):
        # 建立连接
        self.conn = pymysql.connect(host=host, port=port, db=db, user=user, passwd=passwd, charset=charset)
        # 创建游标，操作设置为字典类型
        self.cur = self.conn.cursor()
        # self.cur = self.conn.cursor(cursor=pymysql.cursors.DictCursor)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # 关闭游标
        self.cur.close()
        # 关闭数据库连接
        self.conn.close()

    def get_label_id(self, label_name):
        # SQL 查询语句
        sql = "SELECT * FROM label WHERE name = '%s'" % label_name
        try:
            # 执行SQL语句
            self.cur.execute(sql)
            # 获取所有记录列表
            results = self.cur.fetchall()
            for row in results:
                _id = row[0]
                # lname = row[1]
                # age = row[2]
                # sex = row[3]
                # income = row[4]
                # 打印结果
                # print("fname=%s,lname=%s,age=%s,sex=%s,income=%s" % \
                #       (fname, lname, age, sex, income))
                return _id
        except:
            print("Error: unable to fetch data, label_name=%s" % label_name)
            return None

    def get_label_dimension_id(self, label_dimension_name):
        # SQL 查询语句
        sql = "SELECT * FROM label_dimension WHERE name = '%s'" % label_dimension_name
        try:
            # 执行SQL语句
            self.cur.execute(sql)
            # 获取所有记录列表
            results = self.cur.fetchall()
            for row in results:
                _id = row[0]
                return _id
        except:
            print("Error: unable to fetch data, label_dimension_name=%s" % label_dimension_name)
            return None

    def iter_all_material_id_by_game_id(self, game_id=1827):
        # SQL 查询语句
        sql = "SELECT * FROM material WHERE game_id = %d" % game_id
        try:
            # 执行SQL语句
            self.cur.execute(sql)
            # 获取所有记录列表
            results = self.cur.fetchall()
            for row in results:
                _id = row[0]
                yield _id
        except:
            print("Error: unable to fetch data, game_id=%s" % game_id)
            return None

    def clear_label_by_material_id(self, material_id):
        # SQL 查询语句
        sql = "DELETE FROM label_material_rel WHERE material_id = %d" % material_id
        try:
            # 执行SQL语句
            print(sql)
            self.cur.execute(sql)
            # 向数据库提交
            # self.conn.commit()
        except:
            # 发生错误时回滚
            # self.conn.rollback()
            print("Error: clear_label_by_material_id material_id=%d" % material_id)

    def get_label_name_2_id_map(self):
        # SQL 查询语句
        sql = "SELECT * FROM label"
        ret_map = {}
        try:
            # 执行SQL语句
            self.cur.execute(sql)
            # 获取所有记录列表
            results = self.cur.fetchall()
            for row in results:
                _id = row[0]
                _name = row[1]
                ret_map[_name] = _id

        except:
            # 发生错误时回滚
            # self.conn.rollback()
            print("Error: get_label_id_2_name_map")
        return ret_map

    def get_label_dimension_name_2_id_map(self, game_id=1827):
        # SQL 查询语句
        sql = "SELECT * FROM label_dimension where game_id = %d" % game_id
        ret_map = {}
        try:
            # 执行SQL语句
            self.cur.execute(sql)
            # 获取所有记录列表
            results = self.cur.fetchall()
            for row in results:
                _id = row[0]
                _name = row[1]
                ret_map[_name] = _id

        except:
            # 发生错误时回滚
            # self.conn.rollback()
            print("Error: get_label_id_2_name_map")
        return ret_map

    def update_label_material_rel(self, label_id, material_id):
        # SQL 插入语句
        sql = """INSERT INTO label_material_rel (label_id, material_id) 
                 VALUES (%d, %d)""" % (label_id, material_id)
        try:
            print(sql)
            # 执行sql语句
            self.cur.execute(sql)
            # 提交到数据库执行
            # self.conn.commit()
        except:
            # 如果发生错误则回滚
            # self.conn.rollback()
            print("Error: update_label_material_rel (label_id=%d, material_id=%d)" % (label_id, material_id))


if __name__ == '__main__':
    with DB(host='42.186.102.210', port=9110, user='fba_user', db='fba', passwd='fba.edt') as db:
    # with DB(host='42.186.102.211', port=9110, user='fba_user', db='fba', passwd='fba.edt.dvp') as db:
        df = pd.read_excel('pending_proc.xlsx'
                           # , sheet_name='汇总'
                           )
        col_list = df.columns.to_list()
        exclude_col_name_list = ['视频编码', '提交时间', '负责人']
        for e in exclude_col_name_list:
            col_list.remove(e)

        # label_dimension_id_list = []
        # for col in col_list:
        #     _label_dimension_id = db.get_label_dimension_id(col)
        #     label_dimension_id_list.append(_label_dimension_id)

        pending_import_data = []
        # _material_id_list = set()
        for i in df.index.values:  # 获取行号的索引，并对其进行遍历：
            # 根据i来获取每一行指定的数据 并利用to_dict转成字典
            # break
            _row_data = df.ix[i, col_list].to_dict()
            # _material_id_list.add(_row_data['id'])
            pending_import_data.append(_row_data)
            # if i > 10:
            #     break

        # print("最终获取到的数据test_data是：{0}".format(test_data))
        # print("最终获取到的数据_material_id_list是：{0}".format(_material_id_list))
        #
        try:
            for m_id in db.iter_all_material_id_by_game_id():
                db.clear_label_by_material_id(m_id)

            _label_name_2_id_map = db.get_label_name_2_id_map()
            for _row_data in pending_import_data:
                if math.isnan(_row_data['id']):
                    continue
                _material_id = int(_row_data['id'])
                for col_name, label_name_list_str in _row_data.items():
                    if col_name == 'id':
                        continue
                    _label_list = str(label_name_list_str).strip().split('，')
                    for _label in _label_list:
                        _label_id = _label_name_2_id_map.get(_label, None)
                        if _label_id is None:
                            continue
                        db.update_label_material_rel(_label_id, _material_id)

            # 提交数据库并执行
            db.conn.commit()
        except Exception as e:
            traceback.print_exc()
            print(e)
            db.conn.rollback()
```

# excel数据的写

```python
import pandas as pd
# import numpy as np

pending_write_data = \
[[0.01197952 0.49298068 0.76897227 0.76737911]
 [0.82765185 0.70592612 0.07624629 0.41206483]
 [0.96358469 0.14713271 0.34609823 0.45701923]
 [0.87425111 0.18451819 0.55125788 0.50195541]]

frame = pd.DataFrame(
   pending_write_data,  # 待写入的每一行的行数据
   #  index=['exp1','exp2','exp3','exp4'],  # 索引名字, 注释了索引就是默认的`0, 1, 2, ..`
   columns=['jan2015','Fab2015','Mar2015','Apr2005'])  # 列名字
print(frame)
frame.to_excel("data2.xlsx",
    index=False, # False则为不需要索引了
)
# print(np.random.random((4,4)))
```


# requirements.txt的自动生成

使用pigar, `pip install pigar`

``` python requirements.txt
# Automatically generated by https://github.com/damnever/pigar.

# E:\working\doc\sdc\import_label_material.py: 4
PyMySQL == 0.10.1

# E:\working\doc\sdc\test.py: 2
numpy == 1.19.1

# E:\working\doc\sdc\import_label_material.py: 3
# E:\working\doc\sdc\test.py: 1
pandas == 0.25.1

```