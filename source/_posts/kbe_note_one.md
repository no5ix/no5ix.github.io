---
title: kbe服务端笔记(一)
date: 2017-04-01 19:48:28
tags:
- KBE
categories:
- Misc
---

# **main**
看起来似乎所有的组件都有一个这样的宏(KBENGINE_MAIN)来包裹main函数
```
intKBENGINE_MAIN(intargc, char* argv[])
{
	ENGINE_COMPONENT_INFO&info = g_kbeSrvConfig.getXXX();
	returnkbeMainT<XXX>(argc, argv, YYY, info.externalPorts_min, 
		info.externalPorts_max, info.externalInterface, 0, info.internalInterface);
}
```

**. . .**<!-- more -->

这个宏展开是这样子：
```
kbeMain(intargc, char* argv[]);																						\
intmain(intargc, char* argv[])																						\
{																														\
	loadConfig();																										\
	g_componentID = genUUID64();																						\
	parseMainCommandArgs(argc, argv);																					\
	char dumpname[MAX_BUF] = {0};																						\
	kbe_snprintf(dumpname, MAX_BUF, "%"PRAppID, g_componentID);															\
	KBEngine::exception::installCrashHandler(1, dumpname);																\
	intretcode = -1;																									\
	THREAD_TRY_EXECUTION;																								\
	retcode = kbeMain(argc, argv);																						\
	THREAD_HANDLE_CRASH;																								\
	returnretcode;																										\
}																														\
```
稍微整理一下之后main函数看起来很像是这个样子：
```
intkbeMain(intargc, char* argv[]);
intmain(intargc, char* argv[])
{
    loadConfig();
    g_componentID = genUUID64();
    parseMainCommandArgs(argc, argv);
chardumpname[MAX_BUF] = {0};
    kbe_snprintf(dumpname, MAX_BUF, "%"PRAppID, g_componentID);
    KBEngine::exception::installCrashHandler(1, dumpname);
intretcode = -1;
    THREAD_TRY_EXECUTION;
retcode = kbeMain(argc, argv);
    THREAD_HANDLE_CRASH;
return (retcode);
}
intkbeMain(intargc, char* argv[])
{
		ENGINE_COMPONENT_INFO&info = g_kbeSrvConfig.getXXX();
		return kbeMainT<XXX>(argc, argv, YYY, info.externalPorts_min, info.externalPorts_max, info.externalInterface, 0, info.internalInterface);
}
```
基本可以理解为每个组件的main函数流程都是一样的，只是在特化kbeMainT时所给参数不一样。



# **ServerConfig：**
ServerConfig涉及到服务端每个组件的各种配置选项，比如数据库访问。它的构造在组件名.cpp中，比如loginapp就在loginapp.cpp，machine就在machine.cpp中，loginapp的如下（server/loginapp/loginapp.cpp）：
```
ServerConfigg_serverConfig;
KBE_SINGLETON_INIT(Loginapp);
```
它的初始化（配置）工作主要由loadConfig接口完成，如下（lib/server/kbemain.h）：
```
inlinevoidloadConfig()
{
	Resmgr::getSingleton().initialize();

	// "../../res/server/kbengine_defs.xml"
	g_kbeSrvConfig.loadConfig("server/kbengine_defs.xml");

	// "../../../assets/res/server/kbengine.xml"
	g_kbeSrvConfig.loadConfig("server/kbengine.xml");
}
```



# **Resmgr：**
Resmgr负责管理kbe的所有资源管理，比如资源路径，环境变量。Resmgr的构造地方如下（lib/network/fixed_messages.cpp）：
```
FixedMessages::FixedMessages():
_infomap(),
_loaded(false)
{
	newResmgr();
	Resmgr::getSingleton().initialize();
}
```
	我们可以理解为FixedMessages构造的时候Resmgr就构造了。
	Resmgr的初始化（配置）工作主要由initialize接口完成，代码如上。