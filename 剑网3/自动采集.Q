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
MacroID=f04a5c50-6d4a-45bc-909f-0f5aa51c7d41
Description=自动采集
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

Call 大漠注册()

Function 大漠注册()
    need_ver = "3.1233"
    Set ws = createobject("Wscript.Shell")
    ws.run "regsvr32 atl.dll /s"
    Set ws = nothing
    PutAttachment "C:\Users\ChrisWang\Desktop\大漠插件3.1233", "*.*"
    PutAttachment ".\Plugin", "RegDll.dll"
    Call Plugin.RegDll.Reg("C:\Users\ChrisWang\Desktop\大漠插件3.1233\dm.dll")
    Set dm = createobject("dm.dmsoft")
    ver = dm.Ver()
    If ver <> need_ver Then
        Set dm = nothing
        Set ws = createobject("Wscript.Shell")
        ws.run "regsvr32 C:\Users\ChrisWang\Desktop\大漠插件3.1233\dm.dll /s"
        Set ws = nothing
        Delay 1200
        Set dm = createobject("dm.dmsoft")
        ver = dm.Ver()
        If ver <> need_ver Then
            MessageBox "插件版本错误,当前使用的版本是:" & ver & ",插件所在目录是:" & dm.GetBasePath()
            MessageBox "请关闭程序,重新打开本程序再尝试"
            EndScript
        End If
    Else
        TracePrint ver
        TracePrint "注册成功！"
    End If
End Function

Sub OnScriptExit()
    dm_ret = dm.UnBindWindow() 
End Sub

Function 一秒内随机延迟()
    Randomize
    Delay Rnd*700+400
End Function

Function dm随机点击(x, y, w,h,way)
    dm.MoveToEx x,y,w,h
    Call 一秒内随机延迟()
    If way = "L" Then
        dm.LeftClick
    Else
        dm.RightClick 
    End If
    Call 一秒内随机延迟()
End Function

Function dm找单个图(picPath)
    pos = dm.FindPicE(0,0,800,600,picPath,"000000",0.9,0)
    pos = split(pos,"|")
    If int(pos(1)) > 0 Then 
        x = pos(1)
        y = pos(2)
        TracePrint  picPath + "位置： x:"+x+"y:"+y
    End If
    dm找单个图 = pos
End Function


Function dm小地图找色(colorStr)
    dm_ret = dm.FindColor(720,50,800,110,colorStr,1.0,0,intX,intY)
    If intX >= 0 and intY >= 0 Then
        TracePrint "找到"
    End If
    dm找色 = dm_ret
End Function



Function 按键找字(word)
    iCoord = Plugin.Pic.FindWordShape(0, 0, 2560, 1920, word, "宋体", 9, 0, 0.6)
    XY = Split(iCoord,"|")   
    If X >= 0 and Y >= 0 Then
        TracePrint  word+"位置x"+XY(0) +"y:"+XY(1)
    End If
    按键找字 = XY
End Function

//hwnd = dm.FindWindow("地下城与勇士","地下城与勇士") 
//dm_ret = dm.BindWindow(hwnd, "normal", "normal", "normal", 0)





	

SetSimMode 1


While 1
     KeyPress "F", 1
   Call 一秒内随机延迟()
Wend
