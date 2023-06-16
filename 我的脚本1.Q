[General]
SyntaxVersion=2
BeginHotkey=121
BeginHotkeyMod=0
PauseHotkey=0
PauseHotkeyMod=0
StopHotkey=123
StopHotkeyMod=0
RunOnce=1
EnableWindow=
MacroID=b9bafb4c-4f25-43fa-803a-7c4cba2215fd
Description=我的脚本1
Enable=1
AutoRun=0
[Repeat]
Type=0
Number=1
[SetupUI]
Type=2
QUI=
[Relative]
SetupOCXFile=
[Comment]

[Script]
//Plugin.Sys.ExitOS 0

修理 = 1
TracePrint 修理


//支持Exit Function 命令退出函数过程
Msgbox 函数过程("我是函数,被你调用了")
EndScript
Function 函数过程(a)
修理 = 0
TracePrint 修理

    函数过程=a
End Function
//定义一个函数过程,可以在脚本中调用这个函数