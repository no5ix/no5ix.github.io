---
title: 不受灯光颜色影响
date: 2018-07-20 22:22:34
tags:
- UE4
- Zen
categories:
- UE4
password: 233
---

`-- encrypted`
**. . .**<!-- more -->


# 让物体不受光照的颜色影响


 让物体不受光照颜色影响，总的来说，我的实现方式就是找到光照颜色的地方，然后对颜色去饱和度。去饱和度的代码大概如下：

``` c++
// 计算亮度，这个各个颜色分量可以自己感觉调整，我用的是虚幻默认的数值,alpha 可以调整去多少饱和度，用 0 ~ 1 表示，1表示完全去除
float lum = Color.r * 0.3f + Color.g * 0.59f + Color.b * 0.11f;
Color  = lerp(Color, float4(lum, lum, lum, 0), alpha);
```


# 自定义一个shader model

网上已经有比较完整的流程了，可以参考：

[自定义shadingmodel](http://blog.felixkate.net/2016/05/22/adding-a-custom-shading-model-1/)

[虚幻4渲染编程(材质编辑器篇)【第二卷：自定义光照模型】](https://zhuanlan.zhihu.com/p/36840778)

最好结合着看，第一个的有点老，第二个的流程顺序有的不对。


# 首先修改普通光源

如果已经按照上面的方法自定义shader model 的话，就可以在 DeferredLightingCommon.ush 这个文件，在shader model 的文章中的他们自定义的那个float3 AttenuationColor 变量，把他的式子删了，然后把他改成

``` c++
// 把灯光的颜色去饱和度
float Lum = LightColor.r * 0.3f + LightColor.g * 0.59f + LightColor.b * 0.11f;
AttenuationColor = lerp(LightColor, float4(Lum, Lum, Lum, 0), 1.0f) * (NoL * SurfaceAttenuation) ;
```


简单的说就是去饱和度。
然后在ShadingModels.ush 文件里面的SurfaceShading 函数中，自定义的函数放在

``` c++
float3 SurfaceShading( FGBufferData GBuffer, float3 LobeRoughness,
	float3 LobeEnergy, float3 L, float3 V, half3 N, uint2 Random )
{
	switch( GBuffer.ShadingModelID )
	{
		case SHADINGMODELID_UNLIT:
		case SHADINGMODELID_DEFAULT_LIT:
		case SHADINGMODELID_SUBSURFACE:
		case SHADINGMODELID_PREINTEGRATED_SKIN:
		case SHADINGMODELID_SUBSURFACE_PROFILE:
		case SHADINGMODELID_TWOSIDED_FOLIAGE:
		// 就是把自己添加的模块加进来,上面自定义模块教程里面的自己写的函数就可以不要了
		case SHADINGMODELID_MyTestModel:
			return StandardShading( GBuffer.DiffuseColor, GBuffer.SpecularColor,
				LobeRoughness, LobeEnergy, L, V, N );
		case SHADINGMODELID_CLEAR_COAT:
			return ClearCoatShading( GBuffer, LobeRoughness, LobeEnergy, L, V, N );
		case SHADINGMODELID_CLOTH:
			return ClothShading( GBuffer, LobeRoughness, LobeEnergy, L, V, N );
		case SHADINGMODELID_EYE:
			return EyeShading( GBuffer, LobeRoughness, LobeEnergy, L, V, N );
		default:
			return 0;
	}
}
```
这样的话，除了天光以外的光源颜色就不会对用了这个shader model 的材质造成影响。

# 处理天光

天光分两步，一个是动态一个是非动态。动态天光可以在 SkyLighting.usf 文件的

``` c++
Lighting += DiffuseIrradiance * GBuffer.DiffuseColor * (GBuffer.GBufferAO * ScreenSpaceData.AmbientOcclusion);
```

## 为动态天光去饱和度

这行代码下面为动态天光去饱和度

``` c++
Lighting += DiffuseIrradiance * GBuffer.DiffuseColor * (GBuffer.GBufferAO * ScreenSpaceData.AmbientOcclusion);

if (ShadingModelId == SHADINGMODELID_MyTestModel)
{
	float Lum = Lighting.r * 0.3f + Lighting.g * 0.59f + Lighting.b * 0.11f;
	Lighting = lerp(Lighting, float4(Lum, Lum, Lum, 0), 1.0f) ;
}
```


## 为非动态天光去饱和度

非动态天光就在 BasePassPixelShader.usf 文件的 GetPrecomputedIndirectLightingAndSkyLight(MaterialParameters, Interpolants, BasePassInterpolants, DiffuseDir, VolumetricLightmapBrickTextureUVs, DiffuseIndirectLighting, SubsurfaceIndirectLighting, IndirectIrradiance);这行代码下面添加判断让颜色去饱和度

``` c++
if (GBuffer.ShadingModelID == SHADINGMODELID_MyTestModel)
{
	half DiffLum = DiffuseIndirectLighting.r * 0.3f + DiffuseIndirectLighting.g * 0.59f + DiffuseIndirectLighting.b * 0.11f;
	DiffuseIndirectLighting = lerp(DiffuseIndirectLighting, half4(DiffLum, DiffLum, DiffLum, 0), 0.8f);
}
LightAccumulator_Add(LightAccumulator, Color, 0, 1.0f, false);
```


这样就可以让这个材质不会受到光照颜色的影响，但是会有明暗对比。 

这样做之后，只要在材质里面使用这个自定义 shader model 的物体，就不会受到灯光颜色的影响，但是会有明暗对比。再次说明一次，lerp函数的第3个参数就是一个alpha 值，可以通过调整这个值来改变受光颜色的比例。我设置成 1， 所以不会受到灯光颜色的影响


# 出现的问题

目前遇到的问题有，在受到的天光，纵使天光的颜色是白色的，也会和原来的颜色不会完全一样。总的来说，就是相对来说比原来偏白了一点。补上漫反射颜色后就和原来一样，但是这样就会受到漫反射颜色，导致了物体会受光的颜色，所以暂时没找到解决方法。

