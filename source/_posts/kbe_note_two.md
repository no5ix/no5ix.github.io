---
title: kbe服务端笔记(二)
date: 2017-07-29 23:59:38
tags:
- KBE
categories:
- 杂
---




## **FixedMessages：**
FixedMessages存储所有固定消息（有显示制定id的消息，当然，这并不表示非固定消息就没有id，也是有的，只是不是显示制定的）。
	它的构造地方如下（lib/network/message_handler.cpp）：
```
MessageHandlers::MessageHandlers():
msgHandlers_(),
msgID_(1),
exposedMessages_()
{
	g_fm = Network::FixedMessages::getSingletonPtr();
	if(g_fm == NULL)
		g_fm = newNetwork::FixedMessages;

	Network::FixedMessages::getSingleton().loadConfig("server/messages_fixed.xml");
	messageHandlers().push_back(this);
}
```
意即MessageHandlers构造的时候，如果它还没构造，那就构造。
它的初始化（配置）是由loadConfig接口来完成的，代码见上。

... <!-- more -->

## **loginapp**

> Loginapp组件主要用来处理账户登录/注册的业务

### **消息与handler映射的建立：**
两次包含xxx_interface.h，实现声明和定义：
每个app组件的接口定义都在xxxapp_interface.cpp中开始，代码如下：
```
#include"loginapp_interface.h"
#defineDEFINE_IN_INTERFACE
#defineLOGINAPP
#include"loginapp_interface.h"

namespaceKBEngine{
namespaceLoginappInterface{
}
}
```
所有的戏法都是通过包含loginapp_interface.h前后定义了DEFINE_IN_INTERFACE和LOGINAPP来完成的。第一次的包含就是各种变量，类的声明（当然也有一些类是声明类时使用类inline函数定义完成了，比如MESSAGE_ARGS0/1/2......）。
我们看看loginapp_interface.h中的代码：

### **消息与handlers的存储**
首先是这一句：
NETWORK_INTERFACE_DECLARE_BEGIN(LoginappInterface)
此句展开的话声明和定义了Network::MessageHandlers messageHandlers（记住它们都在LoginappInterface命名空间内），展开宏之后的代码看起来像这样（是的，你的眼睛是好的，没有}闭合）：
声明：
```
namespaceLoginappInterface {
extern Network::MessageHandlers messageHandlers;
定义：
namespaceLoginappInterface {
    Network::MessageHandlers messageHandlers;
```
### **消息与handle建立映射**
然后是这一句：
`LOGINAPP_MESSAGE_DECLARE_ARGS0(importClientMessages,							NETWORK_FIXED_MESSAGE)`
此句展开的话分明声明和定义了一个importClientMessagesLoginappMessagehandler0的类，这个类继承自Network::MessageHandler，这里就是实现了handle的虚函数接口；声明和定义了importClientMessagesLoginappMessagehandler0的一个名为importClientMessages的全局变量；声明和定义了importClientMessagesArgs0的类，这个类继承自Network::MessageArgs。我们一个个地分析一下：
首先展开下面的宏：
```
LOGINAPP_MESSAGE_DECLARE_ARGS0(importClientMessages,							NETWORK_FIXED_MESSAGE)
```
之后是这样：
```
#defineLOGINAPP_MESSAGE_DECLARE_ARGS0(NAME, MSG_LENGTH)						\
LOGINAPP_MESSAGE_HANDLER_ARGS0(NAME)										\
NETWORK_MESSAGE_DECLARE_ARGS0(Loginapp, NAME,								\
				NAME##LoginappMessagehandler0, MSG_LENGTH)
展开LOGINAPP_MESSAGE_HANDLER_ARGS0(NAME)之后分别得到importClientMessagesLoginappMessagehandler0的声明和定义：
声明：
classimportClientMessagesLoginappMessagehandler0 : public Network::MessageHandler
{
public:
virtualvoidhandle(Network::Channel* pChannel, KBEngine::MemoryStream&s);
};
定义：
voidimportClientMessagesLoginappMessagehandler0::handle(Network::Channel* pChannel, KBEngine::MemoryStream&s)
{
    KBEngine::Loginapp::getSingleton().importClientMessages(pChannel);
}
```
（handle/handler，傻傻分不清楚。。。这里的handle是xxxApp中真正用来处理这个消息的接口，而这里的handler提供一个中间层的作用，集中处理一些通用的工作，可以将耦合减少一点）
上面完成了相当于是importClientMessages消息的handler的声明和定义，下面则将这个类实例化之后添加到messageHandlers：
```
#defineNETWORK_MESSAGE_DECLARE_ARGS0(DOMAIN, NAME, MSGHANDLER,		\
											MSG_LENGTH)				\
	NETWORK_MESSAGE_HANDLER(DOMAIN, NAME, MSGHANDLER, MSG_LENGTH, 0)\
	MESSAGE_ARGS0(NAME)			
										\
```
展开NETWORK_MESSAGE_HANDLER(DOMAIN, NAME, MSGHANDLER, MSG_LENGTH, 0)之后得到importClientMessages的handler类（importClientMessagesLoginappMessagehandler0）的名为importClientMessages的全局变量（不过欣慰的是他们都在各自的XXXInterface命名空间内）。
声明：
`externconstimportClientMessagesLoginappMessagehandler0&importClientMessages;`

定义：
```
importClientMessagesLoginappMessagehandler0* pimportClientMessages  = static_cast<importClientMessagesLoginappMessagehandler0*>(messageHandlers.add("Loginapp::importClientMessages",new importClientMessagesArgs0, NETWORK_FIXED_MESSAGE, newimportClientMessagesLoginappMessagehandler0);
constimportClientMessagesLoginappMessagehandler0&importClientMessages = *pimportClientMessages;
```
下面的MESSAGE_ARGS0(NAME)展开后对importClientMessagesArgs0进行了声明和定义（其他它声明的时候就已经完成了全部的定义），声明的时候就是个空语句：
声明兼定义：
```
classimportClientMessagesArgs0 : public Network::MessageArgs
{
public:
importClientMessagesArgs0() :Network::MessageArgs() {}
    ~importClientMessagesArgs0() {}

staticvoidstaticAddToBundle(Network::Bundle&s)
    {
    }
staticvoidstaticAddToStream(MemoryStream&s)
    {
    }
virtual int32 dataSize(void)
    {
return 0;
    }
virtualvoidaddToStream(MemoryStream&s)
    {
    }
virtualvoidcreateFromStream(MemoryStream&s)
    {
    }
};
```
唯一需要小注意一下的就是importClientMessagesArgs0的声明（兼定义）是和importClientMessagesLoginappMessagehandler0的实例的声明和定义是错开的，因为后者实例化添加到messageHandlers的时候需要new一个importClientMessagesArgs0的实例。
### **流程的伪代码**
	稍微整理一下之后，使用LOGINAPP_MESSAGE_HANDLER_ARGSn建立一个消息到handler的映射的代码很像是这样：
	声明：（第一次包含loginapp_interface.h产生的代码）
```
classimportClientMessagesLoginappMessagehandler0 : public Network::MessageHandler
{
public:
virtualvoidhandle(Network::Channel* pChannel, KBEngine::MemoryStream&s);
};

externconstimportClientMessagesLoginappMessagehandler0&importClientMessages;

classimportClientMessagesArgs0 : public Network::MessageArgs
{
public:
importClientMessagesArgs0() :Network::MessageArgs() {}
    ~importClientMessagesArgs0() {}

staticvoidstaticAddToBundle(Network::Bundle&s)
    {
    }
staticvoidstaticAddToStream(MemoryStream&s)
    {
    }
virtual int32 dataSize(void)
    {
return 0;
    }
virtualvoidaddToStream(MemoryStream&s)
    {
    }
virtualvoidcreateFromStream(MemoryStream&s)
    {
    }
};
```
	定义：（定义DEFINE_IN_INTERFACE和LOGINAPP之后第二次包含loginapp_interface.h产生的代码）
```
voidimportClientMessagesLoginappMessagehandler0::handle(Network::Channel* pChannel, KBEngine::MemoryStream&s)
{
    KBEngine::Loginapp::getSingleton().importClientMessages(pChannel);
}

importClientMessagesLoginappMessagehandler0* pimportClientMessages 
= static_cast<importClientMessagesLoginappMessagehandler0*>(messageHandlers.add("Loginapp::importClientMessages",
newimportClientMessagesArgs0,
                                                                                  NETWORK_FIXED_MESSAGE,
newimportClientMessagesLoginappMessagehandler0);
constimportClientMessagesLoginappMessagehandler0&importClientMessages = *pimportClientMessages;
```

### **消息id：固定消息与非固定消息**
要接着v0.0.3的分析继续写，回过头来要看之前写的东西说实话自己都有点难以理解。。。不过出于幸运或者努力，总算是看懂了;-(，读源代码（感觉特别是C++）本来就不是件容易的事，所以读源代码一定要做好长期战斗的准备。
上面我们分析到了，其实一个消息，就是由这样一个宏来和它的handle建立链接的：
LOGINAPP_MESSAGE_DECLARE_ARGS0(importClientMessages,	NETWORK_FIXED_MESSAGE)
通过上面的分析，我们得知，实际上建立消息和handle映射，起到核心作用的接口是messageHandlers.add(xxx, xxxx)，所以我们跟进去看看（lib/network/message_handler.cpp）：
```
MessageHandler* MessageHandlers::add(std::stringihName, MessageArgs* args, 
	int32msgLen, MessageHandler* msgHandler)
{
	if(msgID_ == 1)
	{
		//printf("\n------------------------------------------------------------------\n");
		//printf("KBEMessage_handlers begin:\n");
	}
	
	//bool isfixedMsg = false;

	FixedMessages::MSGInfo* msgInfo = FixedMessages::getSingleton().isFixed(ihName.c_str());
	if(msgInfo == NULL)
	{
		while(true)
		{
			if(FixedMessages::getSingleton().isFixed(msgID_))
			{
				msgID_++;
				//isfixedMsg = true;
			}
			else
			{
				break;
			}
		};

		msgHandler->msgID = msgID_++;
	}
	else
	{
		msgHandler->msgID = msgInfo->msgid;
	}
	
	msgHandler->name = ihName;					
	msgHandler->pArgs = args;
	msgHandler->msgLen = msgLen;	
	msgHandler->exposed = false;
	msgHandler->pMessageHandlers = this;
	msgHandler->onInstall();

	msgHandlers_[msgHandler->msgID] = msgHandler;
	
	if(msgLen == NETWORK_VARIABLE_MESSAGE)
	{
		//printf("\tMessageHandlers::add(%d): name=%s, msgID=%d, size=Variable.\n", 
		//	(int32)msgHandlers_.size(), ihName.c_str(), msgHandler->msgID);
	}
	else
	{
		if(msgLen == 0)
		{
			msgHandler->msgLen = args->dataSize();

			if(msgHandler->type() == NETWORK_MESSAGE_TYPE_ENTITY)
			{
				msgHandler->msgLen += sizeof(ENTITY_ID);
			}
		}
		
		//printf("\tMessageHandlers::add(%d): name=%s, msgID=%d, size=Fixed(%d).\n", 
		//		(int32)msgHandlers_.size(), ihName.c_str(), msgHandler->msgID, msgHandler->msgLen);
	}

	//if(isfixedMsg)
	//	printf("\t\t!!!message is fixed.!!!\n");

	returnmsgHandler;
}
```
大意可以理解为，首先看看消息名称是不是一个固定消息，我们跟进去看看（lib/network/fixed_messages.cpp）：
```
FixedMessages::MSGInfo* FixedMessages::isFixed(constchar* msgName)
{
	MSGINFO_MAP::iteratoriter = _infomap.find(msgName);
	if(iter != _infomap.end())
	{
		MSGInfo* infos = &iter->second;
		returninfos;
	}
	
	returnNULL;
}

//-------------------------------------------------------------------------------------
boolFixedMessages::isFixed(MessageIDmsgid)
{
	MSGINFO_MAP::iteratoriter = _infomap.begin();
	while (iter != _infomap.end())
	{
		FixedMessages::MSGInfo&infos = iter->second;
		if(infos.msgid == msgid)
			returntrue;

		++iter;
	}

	returnfalse;
}
```
#### **固定消息**
通过通读FixedMessages（fixed_message.h/.cpp）可以看到这个_infomap是在loadConfig中建立的，这个_infomap就是所谓的固定消息（fixed message）与其id的映射表。loadConfig就是检视server/messages_fixed.xml，将其中的消息名称与其id关联建立这个映射表。我们继续接着看MessageHandlers::add接口。

#### **非固定消息**
对于isFixed为假的消息（非固定消息），则为其生成一个id（随着调用add的次序依次递增），这个id是在MessageHandlers类中唯一的，而每个组件的MessageHandlers又是处于自己的命名空间内，所以当出现某个组件的非固定消息时，则会为其生成单一组件内唯一的id（但这个id并不是所有组件内唯一的）。于是可能出现这种情况，Loginapp::xxxx与Dbmgr::yyyy都是非固定消息，但他们却有着同样的消息id，此时若有其他组件发送其中任一消息给其他组件，接受消息的组件将无法识别到底是Loginapp::xxxx或者是Dbmgr::yyyy。当然，只要我们将非固定消息发送给所属的组件，则不会有问题（上例中任何组件将Loginapp::xxxx发送给loginapp都是不会出乱子的）。


## **dbmgr**

> dbmgr组件主要负责数据库相关的事务，比如：账户登录/注册事务；账户充值
