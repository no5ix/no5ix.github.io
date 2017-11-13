---
title: MySQL入门二之一些小注意点
date: 2015-03-02 01:51:11
categories:
- DB
---

# distinct关键字
> distinct是应用于所有列的, 而不是某一个列
```
mysql> select * from test_table;
+------+------+
| one  | two  |
+------+------+
| 56   | 12   |
| 52   | 10   |
| 56   | 12   |
| 56   | 13   |
+------+------+
4 rows in set (0.00 sec)

mysql> select distinct one, two from test_table;
+------+------+
| one  | two  |
+------+------+
| 56   | 12   |
| 52   | 10   |
| 56   | 13   |
+------+------+
3 rows in set (0.00 sec)

mysql> select distinct one from test_table;
+------+
| one  |
+------+
| 56   |
| 52   |
+------+
2 rows in set (0.00 sec)
```

<!-- more -->

# and关键字
> and的组合优先级比or高

```
mysql> select * from test_table;
+------+------+
| one  | two  |
+------+------+
| 56   | 12   |
| 52   | 10   |
| 56   | 12   |
| 56   | 13   |
| NULL | NULL |
+------+------+
5 rows in set (0.00 sec)

mysql> select one, two from test_table where one = 52 or one = 56 and two > 12;
+------+------+
| one  | two  |
+------+------+
| 52   | 10   |
| 56   | 13   |
+------+------+
2 rows in set (0.00 sec)

mysql> select one, two from test_table where one = 52 or (one = 56 and two > 12);
+------+------+
| one  | two  |
+------+------+
| 52   | 10   |
| 56   | 13   |
+------+------+
2 rows in set (0.00 sec)

mysql> select one, two from test_table where (one = 52 or one = 56) and two > 12;
+------+------+
| one  | two  |
+------+------+
| 56   | 13   |
+------+------+
1 row in set (0.00 sec)
```

# NULL
> null和空字符是不一样的, 找到他和删除他的方式也比较特别
```
mysql> insert into test_table(one , two) values (null, null);
Query OK, 1 row affected (0.00 sec)

mysql> select * from test_table;
+------+------+
| one  | two  |
+------+------+
| NULL | NULL |
+------+------+
1 row in set (0.00 sec)

mysql>  delete from test_table where one = NULL;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from test_table;
+------+------+
| one  | two  |
+------+------+
| NULL | NULL |
+------+------+
1 row in set (0.00 sec)

mysql>  delete from test_table where one = ' ';
Query OK, 0 rows affected (0.00 sec)

mysql> select * from test_table;
+------+------+
| one  | two  |
+------+------+
| NULL | NULL |
+------+------+
1 row in set (0.00 sec)

mysql> delete from test_table where isnull(one);
Query OK, 1 row affected (0.00 sec)

mysql> select * from test_table;
Empty set (0.00 sec)
```

# rollback
> - 并不是什么都可以回滚的, 典型的如创建表和删除表这些都是不能回退的.
> - 事务是用来管理 insert,update,delete 语句的
```
mysql> set autocommit = 0;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from test_tab;
+-----+-----+-------+
| one | two | three |
+-----+-----+-------+
|   3 | 4   |     5 |
+-----+-----+-------+
1 row in set (0.00 sec)

mysql> set autocommit = 0;
Query OK, 0 rows affected (0.00 sec)

mysql> insert into test_tab value  (4, 4, 5);
Query OK, 1 row affected (0.00 sec)

mysql> rollback;
Query OK, 0 rows affected (0.01 sec)

mysql> select * from test_tab;
+-----+-----+-------+
| one | two | three |
+-----+-----+-------+
|   3 | 4   |     5 |
+-----+-----+-------+
1 row in set (0.00 sec)

mysql> drop table test_tab;
Query OK, 0 rows affected (0.02 sec)

mysql> rollback;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from test_tab;
ERROR 1146 (42S02): Table 'b_test_database.test_tab' doesn't exist
```