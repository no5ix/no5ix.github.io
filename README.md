
# A optimized Hexo & Next

**This blog is powered by this project**

I've optimized the [original NexT theme](https://github.com/iissnan/hexo-theme-next) and many [hexo](https://hexo.io) plugins through numerous code modifications, including:

- Implemented headroom.js for auto-hiding header: hides on downward scroll, reappears on upward scroll
- The optimization of the animation. Now, even an extremely long blog article with tens of thousands of words won't freeze.
- Buttons that allow the sidebar to be fully expanded and the logic for double - clicking to expand it individually have been added, along with different markings for different levels of headings, making it clearer.
- Mobile-first improvements:
    - Restructured header layout
    - Unified sidebar behavior between mobile/desktop
    - Scrollable table of contents on mobile
- Added article encryption support
- Replaced **Fancybox** with **mediumzoom** for superior image zoom experience
- Redesigned local search engine:
    - Fixed keyboard pop-up issues on mobile
    - Excludes encrypted articles from search results
    - Added elegant transition animations


# 一个优化过的NexT主题.

我修改了很多[NexT](https://github.com/iissnan/hexo-theme-next)的代码来对原版 NexT 做了优化, 如下 : 

- 添加了headroom支持, 现在有一个可以会自动隐藏的header了, 往下滚一下鼠标则隐藏, 往上则出现
- 动画的优化, 现在即使是几万字的超长博客文章也不会卡顿
- 增加了侧边栏可以完全展开的按钮以及双击单独展开的逻辑, 以及不同级别的标题的不同标记, 更加清晰
- 改了NexT的很多地方来优化移动端的表现
    - header的布局
    - 移动端和PC端的侧边栏更加统一
    - 移动端的文章目录列表现在可以滑动了
- 添加了文章加密的支持
<!-- - 升级到了fancybox3并完成适配, 3更流畅且拥有更多效果 -->
- 舍弃了 **fancybox**, 用 **mediumzoom** 拥有更好的图片zoom的效果
- 重做了本地搜索引擎
    - 现在移动端不会经常无故弹不出键盘了
    - 也不会列出加密文章的内容了
    - 更优雅的过渡动画


# Live Preview

[My Blog](https://hulinhong.com)


# Usage

1. Install Node.js version 10.13.0 and verify with `node -v`. Using this specific version is crucial—do not modify it.
2. Delete the `source` folder in this project.
3. Create a new `source` folder.
4. Run `npm install -g hexo-cli`, then `npm install --force`.
5. Extract `my_node_modules.tar.gz` into the current directory `tar -zxvf my_node_modules.tar.gz`(Ensure Hexo is installed before running this step)
6. Learn [Hexo's base usage](https://hexo.io/docs/index.html) for Writing/Generating/Deployment .
7. Learn [NexT](http://theme-next.iissnan.com/getting-started.html). Explore NexT’s documentation for theme-specific configurations.
8. Modify the configuration files: `/_config.yml` and `/themes/next/_config.yml`
9.  Run `hexo clean` to remove cached files.
10. Run `hexo generate` to generate static files.
11. Run `hexo server` to start a local Hexo server.


# 用法

1. 安装node.js的 10.13.0 的版本, 尝试`node -v`, 这个node版本很关键, 不要乱改
2. 删除我项目中的 `source` 文件夹
3. 新建一个 `source` 文件夹
4. `npm install -g hexo-cli`然后再`npm install --force`
5. 解压 `my_node_modules.tar.gz` 到当前目录(确保这一步在安装了hexo之后): `tar -zxvf my_node_modules.tar.gz`
6. 学习[Hexo的基本操作](https://hexo.io/zh-cn/docs/index.html)来写作/生成/部署
7. 学习 [NexT](http://theme-next.iissnan.com/getting-started.html)
8. 修改 ` /_config.yml ` 和 ` /themes/next/_config.yml `
9. `hexo clean`删除缓存
10. `hexo generate`生成静态文件
11. `hexo server`启动一个本地hexo服务器