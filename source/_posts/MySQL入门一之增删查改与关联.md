---
title: MySQL入门一之增删查改与关联
date: 2015-02-27 22:51:11
tags:
- MySQL
categories:
- DB
---

# 增删改查

- INSERT INTO table_name (列1, 列2,...) VALUES (值1, 值2,....)

- DELETE FROM 表名称 WHERE 列名称 = 值

- UPDATE 表名称 SET 列名称 = 新值 WHERE 列名称 = 某值

- SELECT 列名称 FROM 表名称



# 关联

SQL join 用于根据两个或多个表中的列之间的关系，从这些表中查询数据。

## Join和Key概绍

有时为了得到完整的结果，我们需要从两个或更多的表中获取结果。我们就需要执行 join。
数据库中的表可通过键将彼此联系起来。主键（Primary Key）是一个列，在这个列中的每一行的值都是唯一的。在表中，每个主键的值都是唯一的。这样做的目的是在不重复每个表中的所有数据的情况下，把表间的数据交叉捆绑在一起。
请看 "Persons" 表：

|Id_P|	LastName|	FirstName|	Address	|City
| -----| -----| ----| -----|
|1|	Adams|	John|	Oxford Street|	London
|2|	Bush|	George|	Fifth Avenue|	New York
|3|	Carter|	Thomas|	Changan Street|	Beijing

请注意，"Id_P" 列是 Persons 表中的的主键。这意味着没有两行能够拥有相同的 Id_P。即使两个人的姓名完全相同，Id_P 也可以区分他们。
接下来请看 "Orders" 表：

|Id_O|	OrderNo |	Id_P
| -----| -----|-------|
|1|	77895|	3
|2|	44678|	3
|3|	22456|	1
|4|	24562|	1
|5|	34764|	65

请注意，"Id_O" 列是 Orders 表中的的主键，同时，"Orders" 表中的 "Id_P" 列用于引用 "Persons" 表中的人，而无需使用他们的确切姓名。
请留意，"Id_P" 列把上面的两个表联系了起来。

下面列出了您可以使用的 JOIN 类型，以及它们之间的差异。

- JOIN(INNER JOIN): 如果左右表中都有至少一个匹配，则返回行
- LEFT JOIN: 即使右表中没有匹配，也从左表返回所有的行
- RIGHT JOIN: 即使左表中没有匹配，也从右表返回所有的行
- FULL JOIN: 只要其中一个表中存在匹配，就返回行

**注** : JOIN使用on的, 而不是where.

## 使用Join(INNER JOIN)

除了上面的方法，我们也可以使用关键词 JOIN 来从两个表中获取数据。
如果我们希望列出所有人的定购，可以使用下面的 SELECT 语句：
```
SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo
FROM Persons
INNER JOIN Orders
ON Persons.Id_P = Orders.Id_P
ORDER BY Persons.LastName
```
结果集：

|LastName|	FirstName|	OrderNo
| -----| -----|-----|
|Adams|	John|	22456
|Adams|	John|	24562
|Carter|	Thomas|	77895
|Carter|	Thomas|	44678

## 使用Left Join

现在，我们希望列出所有的人，以及他们的定购 - 如果有的话。
您可以使用下面的 SELECT 语句：
```
SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo
FROM Persons
LEFT JOIN Orders
ON Persons.Id_P=Orders.Id_P
ORDER BY Persons.LastName
```
结果集：

|LastName|	FirstName|	OrderNo
|-----|---------|-------|
|Adams|	John|	22456
|Adams|	John|	24562
|Carter|	Thomas|	77895
|Carter|	Thomas|	44678
|Bush|	George|	- - - -  |

LEFT JOIN 关键字会从左表 (Persons) 那里返回所有的行，即使在右表 (Orders) 中没有匹配的行。


## 使用Right Join

现在，我们希望列出所有的定单，以及定购它们的人 - 如果有的话。
您可以使用下面的 SELECT 语句：
```
SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo
FROM Persons
RIGHT JOIN Orders
ON Persons.Id_P=Orders.Id_P
ORDER BY Persons.LastName
```
结果集：

|LastName|	FirstName|	OrderNo
|------|--------|-----|
|Adams|	John|	22456
|Adams|	John|	24562
|Carter|	Thomas|	77895
|Carter|	Thomas|	44678
|      |         | 	 	34764

RIGHT JOIN 关键字会从右表 (Orders) 那里返回所有的行，即使在左表 (Persons) 中没有匹配的行。

## 使用Full Join

现在，我们希望列出所有的人，以及他们的定单，以及所有的定单，以及定购它们的人。
您可以使用下面的 SELECT 语句：
```
SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo
FROM Persons
FULL JOIN Orders
ON Persons.Id_P=Orders.Id_P
ORDER BY Persons.LastName
```
结果集：

|LastName|	FirstName|	OrderNo
|-----|------|-----|
|Adams|	John|	22456
|Adams|	John|	24562
|Carter|	Thomas|	77895
|Carter|	Thomas|	44678
|Bush|	George|	 |
| 	 |	|34764|

FULL JOIN 关键字会从左表 (Persons) 和右表 (Orders) 那里返回所有的行。如果 "Persons" 中的行在表 "Orders" 中没有匹配，或者如果 "Orders" 中的行在表 "Persons" 中没有匹配，这些行同样会列出。