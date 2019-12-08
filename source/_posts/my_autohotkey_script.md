---
title: my ahk
date: 2019-08-19 00:23:26
tags:
- AutoHotKey
categories:
- Misc
---


**. . .**<!-- more -->


``` ahk
;;==================================================================;;
;;=========================CapsLock's Stuff=========================;;
;;==================================================================;;
;; 请忽略注释, 代码重新写了, 注释是旧的
SetCapsLockState, AlwaysOff
CapsLock::Send, {ESC}                  ; Vimer's love	Capslock = {ESC}

;=====================================================================o
;                       CapsLock Switcher:                           ;|
;---------------------------------o-----------------------------------o
;                    CapsLock + ` | {CapsLock}                       ;|
;---------------------------------o-----------------------------------o
CapsLock & RShift::                                                       ;|
GetKeyState, CapsLockState, CapsLock, T                              ;|
if CapsLockState = D                                                 ;|
    SetCapsLockState, AlwaysOff                                      ;|
else                                                                 ;|
    SetCapsLockState, AlwaysOn                                       ;|
KeyWait, ``                                                          ;|
return                                                               ;|
;---------------------------------------------------------------------o
 

~Esc::
If ((A_PriorHotkey = A_ThisHotkey) and  (A_TimeSincePriorHotkey < 300))
{              
    WinGet,S,MinMax,A
    if S=0
        WinMaximize,A
    else if S=1
        WinRestore,A
    else if S=-1
        WinRestore,A
}
return


;;=============================Navigator============================||
;===========================;U = PageDown
;===========================;H = Left
CapsLock & h::
if getkeystate("shift") = 0
Send, {Left}
else
Send, +{Left}
return
;===========================;J = Down
CapsLock & j::
if getkeystate("shift") = 0
Send, {Down}
else
Send, +{Down}
return
;===========================;K = UP
CapsLock & k::
if getkeystate("shift") = 0
Send, {Up}
else
Send, +{Up}
return
;===========================;L = Right
CapsLock & l::
if getkeystate("shift") = 0
Send, {Right}
else
Send, +{Right}
return

; CapsLock & m::
; if getkeystate("shift") = 0
; Send, {Home}
; else
; Send, +{Home}
; return

CapsLock & ,::
if getkeystate("shift") = 0
Send, {Home}
else
Send, +{Home}
return

;===========================;I = Home
CapsLock & .::
if getkeystate("shift") = 0
Send, {End}
else
Send, +{End}
return

CapsLock & u::
if getkeystate("shift") = 0
Send, ^z
else
Send, ^y
return

; CapsLock & r::
; ; if getkeystate("shift") = 0
; ; Send, ^y
; ; ; else
; Send, {Ins}
; return

; CapsLock & y::
; if getkeystate("shift") = 0
; Send, ^c
; ; else
; ; Send, 
; return

CapsLock & p::
if getkeystate("shift") = 0
Send, +7
else
Send, +3
return

; CapsLock & b::
; if getkeystate("shift") = 0
; Send, ^{Left}
; else
; Send, +^{Left}
; return

; CapsLock & w::
; if getkeystate("shift") = 0
; Send, ^{Right}
; else
; Send, +^{Right}
; return

CapsLock & i::
if getkeystate("shift") = 0
Send, ^{Left}
else
Send, +^{Left}
return

CapsLock & o::
if getkeystate("shift") = 0
Send, ^{Right}
else
Send, +^{Right}
return

CapsLock & `;::
if getkeystate("shift") = 0
Send, _
else
Send, -
return

CapsLock & '::
if getkeystate("shift") = 0
Send, =
else
Send, +=
return

CapsLock & /::
if getkeystate("shift") = 0
Send, \
else
Send, +\
return

CapsLock & 9:: 
if getkeystate("shift") = 0
Send, [
else
Send, {{}
return

CapsLock & 0:: 
if getkeystate("shift") = 0
Send, ]
else
Send, {}}
return

CapsLock & n:: 
if getkeystate("shift") = 0
Send, ^{BS}
else
Send, +{Home}{Del}
return

CapsLock & m:: 
if getkeystate("shift") = 0
Send, ^{Del}
else
Send, +{End}{Del}
return

CapsLock & d:: 
if getkeystate("shift") = 0
Send, {Del}
else
Send, ^{Del}
return

; ;=============================Deletor==============================||
; CapsLock & p:: Send, {Del}              ; , = Del char after
; CapsLock & .:: Send, ^{Del}             ; . = Del word after
; CapsLock & /:: Send, +{End}{Del}        ; / = Del all  after

; CapsLock & m:: Send, {BS}               ; m = Del char before; 
; CapsLock & n:: Send, ^{BS}              ; n = Del word before; 			
; CapsLock & b:: Send, +{Home}{Del}       ; b = Del all  before; 

; ;;============================Special Char==========================||
; CapsLock & ':: Send, =                  ; ' = =
; CapsLock & `;:: Send, {Enter}           ; ; = Enter
; CapsLock & {:: Send, +9                 ; { = ( 
; CapsLock & }:: Send, +0;				; } = )
; CapsLock & `:: Send, +``                ; Shift
; CapsLock & 4:: Send, +4
; CapsLock & 5:: Send, +5
; CapsLock & 6:: Send, +6
; CapsLock & 7:: Send, +7
; CapsLock & 8:: Send, +8
; CapsLock & 9:: Send, +9
; CapsLock & 0:: Send, +0
; CapsLock & -:: Send, +-
; CapsLock & =:: Send, +=
; CapsLock & \:: Send, +=
; ;;============================Editor================================||
; CapsLock & z:: Send, ^z                 ; Z = Cancel
; CapsLock & x:: Send, ^x                 ; X = Cut
; CapsLock & c:: Send, ^c                 ; C = Copy
; CapsLock & v:: Send, ^v                 ; V = Paste
; CapsLock & a:: Send, ^a					; A = Select All
; CapsLock & y:: Send, ^y                	; Y = Redo
; ;;===========================Controller=============================||
; CapsLock & s:: Send, ^{Tab}             ; Switch Tag    S = {Ctr + Tab}
; CapsLock & w:: Send, ^w                 ; Close Tag     W = {Ctr + W}
; CapsLock & q:: Send, !{F4}              ; Close Window  Q = {Alt + F4}
; CapsLock::Send, {ESC}                   ; Vimer's love	Capslock = {ESC}
; ;;=========================Application==============================||
; CapsLock & d:: Send, !d                 ; Dictionary 	D = {Alt + D}
; CapsLock & f:: Send, !f              	; Everything 	F = {Alt + F}
; CapsLock & g:: Send, !g              	; Reversed		G = {Alt + G}
; CapsLock & e:: Run http://cn.bing.com/	; Run Explore 	E = {Explore}
; CapsLock & r:: Run Powershell           ; Run Powersh	R = {Powershell}
; CapsLock & t:: Run C:\Program Files (x86)\Notepad++\notepad++.exe
					; Run Notepad++	T = {Text Editor}

;;==================================================================;;
;;=========================CapsLock's Stuff=========================;;
;;==================================================================;;
```

# 设置开机以管理员权限启动

1. 对“A.exe”创建快捷方式, 然后将这个快捷方式改名为“A” (不用改名为A.lnk, 因为windows的快捷方式默认扩展名就是lnk)
2. 右键这个快捷方式-> 高级，勾选用管理员身份运行； 
3. 新建“A.bat”文件，将这个快捷方式的路径信息写入并保存，如：
```
@echo off
start C:\Users\b\Desktop\A.lnk
```
4. 因为直接运行 A.bat 会有个窗口一闪而过, 所以新建个 A.vbs 来运行这个bat来避免这个窗口
```
createobject("wscript.shell").run "D:\A.bat",0
```
5. 打开“运行”输入“shell:startup”然后回车，然后将“A.vbs”剪切到打开的目录中