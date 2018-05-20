---
title: 工厂模式
date: 2015-01-07 12:18:54
tags:
- 设计模式
categories:
- Misc
---


# 分类
 

工厂模式主要是为创建对象提供过渡接口，以便将创建对象的具体过程屏蔽隔离起来，达到提高灵活性的目的。 

工厂模式可以分为三类： 

- [**简单工厂模式**](#简单工厂模式) （Simple Factory, 简单工厂模式可看为工厂方法模式的一种特例，两者归为一类。  ） 

- [**工厂方法模式**](#工厂方法模式) （Factory Method） 

- [**抽象工厂模式**](#抽象工厂模式) （Abstract Factory） 

这三种模式从上到下逐步抽象，并且更具一般性。 

GOF在《设计模式》一书中将工厂模式分为两类：工厂方法模式（Factory Method）与抽象工厂模式（Abstract Factory）。


# 区别


- [**简单工厂模式**](#简单工厂模式) ：

    一个工厂类, 这个工厂类能创建多个具体产品类的实例。
    一个抽象产品类，可以派生出多个具体产品类。   


- [**工厂方法模式**](#工厂方法模式) ：

    一个抽象工厂类，可以派生出多个具体工厂类。   
    一个抽象产品类，可以派生出多个具体产品类。   

    每个具体工厂类只能创建一个具体产品类的实例。

- [**抽象工厂模式**](#抽象工厂模式) ：

    一个抽象工厂类，可以派生出多个具体工厂类。   
    多个抽象产品类，每个抽象产品类可以派生出多个具体产品类。   

    每个具体工厂类可以创建多个具体产品类的实例。   


区别：

工厂方法模式只有一个抽象产品类，而抽象工厂模式有多个。   

工厂方法模式的具体工厂类只能创建一个具体产品类的实例，而抽象工厂模式可以创建多个。


# 简单工厂模式


``` php 产品类
<?php
/**
  车子系列
 
 */
abstract Class BWM{
    function construct($pa) {

    }
}
Class BWM320 extends BWM{
    function construct($pa) {

    }
}
Class BMW523 extends BWM{
   function construc($pb){

   }
}
```


 
``` php 工厂类
/**
  工厂创建车
 
 */
class Factory {


    static function  createBMW($type){
        switch ($type) {
          case 320:
             return new BWM320();
          case 523:
             return new BMW523();
        //….
   }
}
```



``` php 客户类
/**
  客户通过工厂获取车
 
 */
class Customer {
    private $BMW;
    function getBMW($type){
        $this¬-> BMW =  Factory::createBMW($type);
    }
}
```

# 工厂方法模式

``` php 产品类
<?php
/**
  车子系列
 
 /
abstract Class BWM{
function construct($pa) {

}
}
Class BWM320 extends BWM{
function construct($pa) {

}
}
Class BMW523 extends BWM{
   function construc($pb){

}
}
```



``` php 创建工厂类
/**
  创建工厂的接口
 
 */
interface FactoryBMW {
       function createBMW();
}


/**
  
  创建BWM320车
 **/
class FactoryBWM320 implements FactoryBMW {
   function  createBMW($type){
      return new BWM320();
   }

}


/**
 
  创建BWM523车
 **/
class FactoryBWM523 implements FactoryBMW {
   function  createBMW($type){
      return new BMW523();
   }
}
```


``` php 客户类
/**
  
  客户得到车
 */
class Customer {
   private $BMW;
   function  getBMW($type){
      switch ($type) {
        case 320:
           $BWM320 = new FactoryBWM320();
           return $BWM320->createBMW();
        case 523:
           $BWM523 = new FactoryBWM523();
           return $BWM320->createBMW();
            //….
      }

  }
}
```

# 抽象工厂模式

``` php 产品类
<?php
/**
  车子系列以及型号
 
 */
abstract class  BWM{
}

class BWM523 extends  BWM {
}
class BWM320 extends  BWM {


}

/*
  空调
 
 */
abstract class aircondition{
}
class airconditionBWM320  extends aircondition {

}
class airconditionBWM52 extends aircondition {

}
```

``` php 创建工厂类
/*
  创建工厂的接口
 
 */
interface FactoryBMW {
     function createBMW();
     function createAirC();
}


/**
 
  创建BWM320车
 /
class FactoryBWM320 implements FactoryBMW {
    function  createBMW(){
    return new BWM320();
}
function  createAirC(){ //空调
    return new airconditionBWM320();
}
}


/*
  
  创建BWM523车
 */
class FactoryBWM523 implements FactoryBMW {
    function  createBMW(){
    return new BWM523();
}
function  createAirC(){
    return new airconditionBWM523();
}
}
```


``` php 客户
/*
  
  客户得到车
 */
class Customer {
   private $BMW;
   private $airC;
   function  getBMW($type){
       $class = new ReflectionClass(‘FactoryBWM’ .$type );//建立 Person这个类的反射类
        $instance  = $class->newInstanceArgs();//相当于实例化Person 类
        $this->BMW =  $instance->createBMW();
       $this->airC =  $instance->createAirC();
   }
}
```