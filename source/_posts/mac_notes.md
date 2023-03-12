---
title: mac笔记
date: 2022-05-07 03:02:22
tags:
- Mac
categories:
-  Misc
---



这是一份 mac 折腾配置以及各种改造的精华笔记, 可以帮你从头到尾打造一个极为顺手的 mac. 

在Windows端配合[<i class="fa fa-fw fa-github fa-2x"></i>sux](https://github.com/no5ix/sux) 可以统一 win & mac 的使用体验.


**. . .**<!--more -->




# 改键Karabiner

改键软件 Karabiner-Elements 的配置得直接覆盖他的配置文件 `karabiner.json` (它的配置文件路径在 app 里的 misc 里有)

参考: 
- https://github.com/pqrs-org/Karabiner-Elements/issues/2711
- https://github.com/pqrs-org/Karabiner-Elements/issues/2949
- https://github.com/pqrs-org/KE-complex_modifications/issues/697#issuecomment-678677912
- https://github.com/realliyifei/mac-karabiner-chinese-punctuations-to-halfwidth-forms


# 科学上网

科学上网软件： ClashX    
下载地址: https://itlanyan.com/trojan-clients-download/

步骤:  
1. 去 just my socks 拷贝那些服务节点的配置然后去google搜“ss配置转clash配置”的网站(但是似乎很有可能会泄露相关 ss 密码之类的)，比如 https://subconverter.speedupvpn.com ， 然后在线转换为clash的配置然后点击 ClashX 的菜单栏的图标， 然后 `Config`-`Remote Config`-`Manage`-`Add`
2. 如果发现上不了网的话, 点击 ClashX 的图标, 然后 `Config`-`Open Config Folder` 查看生成的 config 文件是否和 本 github 项目的 `clashx`里的类似
3. 请不要打开 clashx 的"设置为系统代理", 否则剪映等一些软件无法联网, 
   1. 但此时 safari 也会翻不了墙 (以下教程参考 https://www.youtube.com/watch?v=pAY8pNou9Gk)
      1. 此时需要先把 `safari_proxy` 文件夹中的 `proxy.pac`(这个是由 edge 的 SwitchyOmega插件里的配置生成的) 放到 `/Library/WebServer/Documents` 里
      2. 然后在`设置`-`网络`-`高级`-`代理`的`Automatic proxy configuration` 里输入 `http://127.0.0.1/proxy.pac`, 然后点击 右下角的 `ok`, 点击完`ok`之后会退回上一层菜单, 然后再点击 `Apply`
      3. 然后在 terminal 里输入命令 `sudo apachectl start`
      4. 去 safari 的地址栏输入`http://127.0.0.1/proxy.pac` 测试一下是否能访问这个, 有内容说明成功了, 此时再看看是否能谷歌/油管
   2. 此时还有个问题就是:可能会因为其它软件给关掉，如 ClashX 设置为系统代理的时候会把这个 pac 给清除掉, 所以我们需要检查一下 `hammerspoon` 里的 `init.lua`是否有 `networksetup -setautoproxyurl ` 相关的代码, 有的话就会自动在激活 safari 的时候自动设置一下 pac 设置(相关代码其实是参考了 https://nowtime.cc/macos/1753.html , `networksetup -setautoproxyurl "Wi-Fi" "http://127.0.0.1/proxy.pac"` , 这个 "Wi-Fi" 是通过命令 `networksetup -listallnetworkservices` 拿到的)


# 触摸板增强

软件： betterTouchTool
破解版的得把下面这几句加到clashx当前所用的config文件的rules里来屏蔽下面这些地址
```yaml
- DOMAIN-KEYWORD,folivora.ai,REJECT
- DOMAIN-KEYWORD,www.folivora.ai,REJECT
- DOMAIN-KEYWORD,updates.boastr.net,REJECT
- DOMAIN-KEYWORD,updates.folivora.ai,REJECT
```
加完之后去浏览器测试一下是否能打开这几个网址， 打不开则为屏蔽成功，
然后再打开betterTouchTool。


# jetbrain-crack

用jetbrain_crack 文件夹里 的 ja-netfilter, 然后参考下方链接来破解即可, 适用于 jb2022.1 的全家桶

- https://learnku.com/articles/67432
- https://segmentfault.com/a/1190000041769901

clion使用的时候切记: 要把项目目录以及各种觉得要mark的目录右键`Mark directory as`一下, 然后再项目根目录`Reload Cmake Project`


# 搜狗输入法皮肤

自己做了仨, 黑白灰

另外的好东西高仿 mac风格: Rime 鼠须管输入法皮肤效果 https://ssnhd.com/2022/01/11/rime-skin/


# Alfred

- 配置: 把 `Alfred.alfredpreferences` 直接复制到 Alfred的配置文件夹(即 `Advance`-`Reveal in Finder` 出来的文件夹) 里覆盖即可
- 皮肤: 自己做了俩, 对应黑夜白天
- 配置中的 workflow 相关网址: 
    - https://github.com/zqzten/alfred-web-search-suggest
    - https://github.com/iamstevendao/alfred-open-with-vscode
    - https://github.com/LeEnno/alfred-terminalfinder
    - https://github.com/wensonsmith/YoudaoTranslator


# hammerspoon

装好 hammerspoon 之后, 把`~`下的`.hammerspoon`文件夹里的删除, 然后将本项目中的 hammerspoon 文件夹的内容放到 `~`下的`.hammerspoon`文件夹里


# 禁止cleanmymacx即使退出它的HealthMonitor还一直后台运行

问题：虽然CleanMyMacX软件被吹嘘的很厉害，在用起来感觉也可以帮助更好的清理电脑，但是它一直后台运行，还终止不了，一直监控Mac的信息情况，个人觉得很是鸡肋，在使用的时候打开用就行了，平常没必要一直常驻，对于内存紧张的朋友来说太吃内存了。

经过试验，可以修改权限解决，不需要删除文件，也不会出现system.log中的异常日志。

解决办法：

1. 打开终端输入以下
    - `chmod 400 "/Applications/CleanMyMac X.app/Contents/Library/LoginItems/CleanMyMac X Menu.app/Contents/Library/LoginItems/CleanMyMac X HealthMonitor.app/Contents/MacOS/CleanMyMac X HealthMonitor"`
    - `chmod 400 "/Applications/CleanMyMac X.app/Contents/Library/LoginItems/CleanMyMac X Menu.app/Contents/Library/LaunchServices/com.macpaw.CleanMyMac4.Agent"`
    - `chmod 400 "/Applications/CleanMyMac X.app/Contents/Library/LaunchServices/com.macpaw.CleanMyMac4.Agent"`
2. 然后去活动监视器终止CleanMyMacX所有进程即可。


# 启动台行列

【终端】输入或粘贴以下命令，修改后面的数字更改行列数。

- 行数 `defaults write com.apple.dock springboard-rows -int 9`
- 列数 `defaults write com.apple.dock springboard-columns -int 10`

最后输入以下命令 `killall Dock`


# 程序坞降低显示延迟

如果你习惯隐藏程序坞，鼠标放在屏幕底部，默认显示程序坞非常慢，你可以在【终端】输入或粘贴下面命令，将数值改为 0，这样，显示程序坞会变的很快。

`defaults write com.apple.dock autohide-delay -int 0`

最后输入以下命令 `killall Dock`


# 允许任何来源

安装非 App Store 里应用，可能会出现无法安装的情况，需要打开任何来源。【终端】输入或粘贴以下命令，按回车键。

`sudo spctl --master-disable`


# 密码位数

管理员默认密码至少为 4 位，【终端】输入或粘贴以下命令支持将密码改为 1 位。

`pwpolicy -clearaccountpolicies`


# 深色主题显示浅色窗口

程序坞和菜单栏深色，窗口是浅色。

【终端】输入或粘贴以下命令，按回车键, 注销并重新登录 Mac, 系统偏好设置 - 通用 - 深色。`defaults write -g NSRequiresAquaSystemAppearance -bool Yes`

恢复原样: `defaults delete -g NSRequiresAquaSystemAppearance`


# Mac 删除原生 ABC 英文输入法

删除系统英文 ABC，只保留一个输入法，这样搜狗输入法只需按 Shift 即可切换中英文。

1. (这一步可以不做, 因为 sip 关闭之后 iOS 程序在 mac 就不能运行了, 所以先不做等发现删不掉 abc再来做吧, 关闭 sip 之后删除 abc 输入法再打开sip也可以 )先关闭 `系统完整性保护SIP`, 参考 [系统完整性保护SIP](#系统完整性保护SIP)
2. 前往自己home 目录下的 `~/Library/Preferences/` 文件夹，找到 `com.apple.HIToolbox.plist` 文件, 先备份 `cp com.apple.HIToolbox.plist com.apple.HIToolbox.plist.bak`
3. 删除 `AppleEnabledInputSources` 下的
```xml
    <dict>
        <key>InputSourceKind</key>
        <string>Keyboard Layout</string>
        <key>KeyboardLayout ID</key>
        <integer>252</integer>
        <key>KeyboardLayout Name</key>
        <string>ABC</string>
    </dict>
```
4. 然后保存
5. 重启 Mac。

恢复原样: 不必担心此操作给电脑带来异常，一切正常。还原打开系统偏好设置 → 键盘 → 输入法 → 添加 ABC 即可。


# terminal相关

## autojump安装和tab不自动补全的办法

安装: `brew install autojump`
安装完之后在 `.zshrc` 最后加上一行:  
`[ -f /opt/homebrew/etc/profile.d/autojump.sh ] && . /opt/homebrew/etc/profile.d/autojump.sh`

tab不自动补全的办法: 在 `.zshrc` 最后加上一行 `autoload -U compinit && compinit`


## 安装zsh-autosuggestions

安装: `brew install zsh-autosuggestions`
安装完之后在 `.zshrc` 最后加上一行:  
`source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh`


## 命令行语法高亮

如果已经装好了 oh my zsh则按照下面的方法来安装: 

Clone this repository in oh-my-zsh's plugins directory:

`git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`

Activate the plugin in ~/.zshrc:

`plugins=( [plugins...] zsh-syntax-highlighting)` 比如原来是 `plugins=(git)` 则改为 `plugins=(git zsh-syntax-highlighting)` 

Restart zsh (such as by opening a new instance of your terminal emulator).


## powerlevel10k主题的路径颜色改色改成紫色

原因: 不改色的话, 默认是蓝色太亮看不清又伤眼

1. `vim ~/.p10k.zsh`
2. 找到 `POWERLEVEL9K_DIR_BACKGROUND` 然后改成 `typeset -g POWERLEVEL9K_DIR_BACKGROUND=128`
3. 保存
4. `source ~/.p10k.zsh`


## fzf安装与配置

1. 确认已经安装好了 `fd`
2. 用 brew 安装: `brew install fzf`, 安装完了之后他会提示你安装他的快捷键绑定的命令, 复制他的这个命令安装好他的快捷键绑定
3. `vim ~/.zshrc` 
   - 如果只是希望 fzf 每次搜索指搜当前目录下的文件和目录则在最后添加
       ```
       export FZF_DEFAULT_COMMAND='fd -HI --exclude ".git"'
       122 export FZF_CTRL_T_COMMAND='fd -HI --exclude ".git"'
       123 export FZF_ALT_C_COMMAND="fd -HI --exclude ".git" -t d . "
       ```
   - 如果希望 fzf 每次搜索指搜所有的文件和目录则在最后添加
       ```
       export FZF_DEFAULT_COMMAND='fd -HI --exclude ".git" . / '
       export FZF_CTRL_T_COMMAND='fd -HI --exclude ".git" . / '
       export FZF_ALT_C_COMMAND='fd -HI --exclude ".git" -t d . '
      ```
4. `source ~/.zshrc`
5. 用 `fd` 找到 fzf 的 `key-bindings.zsh` (上次安装的时候是在`/opt/homebrew/Cellar/fzf/0.32.1/shell/key-bindings.zsh`), 然后在 68 行左右添加 `bindkey '^F' fzf-file-widget`
6. 让他生效: `source /opt/homebrew/Cellar/fzf/0.32.1/shell/key-bindings.zsh `
7. 现在可以先输入 cd 然后 敲击 ctrl+f 找到想要进入的目录然后回车进入目录了
8. 也可以先输入 vim 然后 敲击 ctrl+f 找到想要进入的文件然后回车进入编辑了


## tab-any-path安装与配置

[tab-any-path](https://github.com/no5ix/tab-any-path)


# safari 相关

## Safari调整标签页在哪儿打开的设置

terminal 输入命令: `defaults write com.apple.Safari IncludeInternalDebugMenu 1`

重启 Safari 之后可以看到顶部菜单栏多出一个 `Debug` 菜单里有 `Tab Ordering` 的子菜单项


## safari和edge书签双向同步

1. 在 windows 的 store 里下载iCloud应用并登录自己的Apple ID
2. 新建TXT文件，填入内容如下：
```
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe]
@="C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
"Path"="C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\"
```
3. 修改txt文件名为.reg格式，双击导入注册表
4. 打开桌面版iCloud应用，勾选书签->Chrome, 
5. 在Edge浏览器内安装 Apple 出品的“iCloud书签”插件
6. 在iCloud应用中打开书签同步选项, 记得点击“应用”！如果说要合并书签那就合并
7. 如果电脑上已经装了有chrome可能会弹出来要你安装iCloud插件, 不用管, 此时因为已经点击了"应用"了, 相关设置已经保存好, 直接重启一下电脑，会自动完成同步


## safari实现类似edge的smart-toc自动生成目录大纲的插件

先装上 `Macaque` 插件(类似油猴插件, 只是这个插件更加强大可以同时支持油猴脚本和 UserScript 脚本, 可以绕过网站 CSP, 把脚本注入到开了 CSP 的网站里, 如知乎/GitHub 等), 然后去[这里](https://github.com/no5ix/auto-toc) 装上 auto-toc 油猴脚本, 然后刷新页面即可

- 参考: [Edge的smart-toc插件开源地址](https://github.com/FallenMax/smart-toc)


# 系统完整性保护SIP

**注意**: sip 关闭之后 iOS 程序在 mac 就不能运行了

**查看 SIP 状态:**  【终端】输入 `csrutil status`，按回车键。

**ARM M1 处理器关闭 SIP 步骤**:  
1. 关机
2. 按住开机键不松手直到出现下图的画面，然后点击选项
3. 点击继续
4. 点击菜单栏的实用工具，再点击终端
5. 输入csrutil disable，然后按下回车也就是 return 键
6. 输入y，然后按下回车也就是 return 键
7. 输入您的电脑密码，然后按下回车也就是 return 键
8. 等待执行结果……
9. 出现 System Integrity Protection is off. 证明 SIP 已成功关闭。
10. 输入 reboot 然后按下回车也就是 return 键重启电脑即可。
11. 如果后期想再开启 SIP，只需要将上面第 5 步的 csrutil disable 换成 csrutil enable 即可。

**开启 SIP**: 同上，然后【终端】输入下面命令 `csrutil enable`


# 各个软件单独控制音量

可以看看开源项目 `background-music` , 不过经测试目前(2022.08.10)还不支持最新系统 `Monterey 12.5`, 可以 github 搜一下它看看最新版本他支持了没


# lua 相关

## luajit在MacOS编译与安装

1. openresty-luajit 的 github官网下载他的 release,
2.  然后解压直接 `make`, 
3. 如果报错说要设置 `export MACOSX_DEPLOYMENT_TARGET=xx.yy` 的话, 那就设置一下, 比如我的 macOs 系统是 `12.5`, 那就 `export MACOSX_DEPLOYMENT_TARGET=12.5`, 
4. 然后再 `make`, 再 `make install` (make install 很重要, 不然之后的东西能编译过, 但是会提示找不到 `dyld[56827]: Library not loaded: '/usr/local/lib/libluajit-5.1.2.dylib'`)


## (不建议安装了)luajit-openresty安装后设置成默认lua

先安装: `brew install luajit-openresty`
然后:

1. `cd /opt/homebrew/opt/luajit-openresty/bin`
2. `ln -s luajit-blabla lua` (这里的 `luajit-blabla` 替换成当前文件夹的那个 luajit 执行文件的名字)
3. `echo 'export PATH="/opt/homebrew/opt/luajit-openresty/bin:$PATH"' >> ~/.zshrc`
4. `sourch ~/.zshrc`
