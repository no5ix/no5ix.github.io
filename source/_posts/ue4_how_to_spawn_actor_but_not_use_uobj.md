---
title: UE4中如何不继承UObject就能spawn一个actor
date: 2018-04-22 21:56:12
tags:
- UE4
categories:
- UE4
---

# 介绍

其实不用继承 UObject 也可以生成一个 actor, 

关键的点就是拿到 UWorld , 
所以只要从一个拥有 UWorld 的虚幻相关实例中传递它的 UWorld 给一个原生 C++ 类也可以.

# 示例代码

下面的代码取自我的GitHub项目 [<i class="fa fa-fw fa-github fa-2x"></i>**RealTimeServer**](https://github.com/no5ix/RealTimeServer) 

**. . .**<!-- more -->

``` c++ RealTimeSrvEntityFactory.h
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include <memory>
#include "RealTimeSrvEntity.h"
#include "RealTimeSrvPawn.h"

/**
 * 
 */

typedef RealTimeSrvEntityPtr( *GameObjectCreationFunc )( );

class RealTimeSrvEntityFactory
{
public:

	static void StaticInit(UWorld * inWorld);

	UWorld* GetWorld() const;

	RealTimeSrvEntityPtr CreateGameObject( uint32_t inFourCCName );


	void SetDefaultPawnClass( TSubclassOf<class ARealTimeSrvPawn> inDefaultCharacterClasses ) { DefaultCharacterClasses = inDefaultCharacterClasses; }


public:
	static std::unique_ptr<RealTimeSrvEntityFactory>	sInstance;

private:
	RealTimeSrvEntityFactory();
	RealTimeSrvEntityPtr CreateActionPawn();


private:
	TSubclassOf<class ARealTimeSrvPawn> DefaultCharacterClasses;

	UWorld* mWorld;
};

```


``` c++ RealTimeSrvEntityFactory.cpp
// Fill out your copyright notice in the Description page of Project Settings.


#include "RealTimeSrvEntityFactory.h"
#include "RealTimeSrvWorld.h"

std::unique_ptr<RealTimeSrvEntityFactory> RealTimeSrvEntityFactory::sInstance;

RealTimeSrvEntityFactory::RealTimeSrvEntityFactory()
{
}


void RealTimeSrvEntityFactory::StaticInit(UWorld * inWorld)
{
	sInstance.reset( new RealTimeSrvEntityFactory() );
	check( sInstance );
	if (sInstance)
	{
		sInstance->mWorld = inWorld;
	}
}

UWorld* RealTimeSrvEntityFactory::GetWorld() const
{
	return mWorld;
}



RealTimeSrvEntityPtr RealTimeSrvEntityFactory::CreateGameObject( uint32_t inFourCCName )
{

	switch ( inFourCCName )
	{
	case 'CHRT':
		return CreateActionPawn();
	default:
		break;
	}

	return RealTimeSrvEntityPtr();
}

RealTimeSrvEntityPtr RealTimeSrvEntityFactory::CreateActionPawn()
{
	check( GetWorld() );

	UWorld* const world = GetWorld();

	if ( world )
	{
		
		FActorSpawnParameters SpawnParams;
		SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		ARealTimeSrvPawn* const newActionPawn = world->SpawnActor<ARealTimeSrvPawn>( DefaultCharacterClasses, FTransform::Identity, SpawnParams );


		if ( newActionPawn )
		{
			RealTimeSrvWorld::sInstance->AddGameObject( newActionPawn );
		}
		return RealTimeSrvEntityPtr( newActionPawn );

	}
	return RealTimeSrvEntityPtr();
}
```