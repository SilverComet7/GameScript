Call 大漠注册()
Set dm = createobject("dm.dmsoft")
dm.SetPath "C:\Users\Administrator\Desktop\3.1230"
dm_ret = dm.SetDict(0, "字库.txt")
Do Until Hwnd > 0
Hwnd = Plugin.Window.Find("地下城与勇士", "地下城与勇士")
TracePrint Hwnd
Delay 1200
Loop
Call Plugin.Window.Move(Hwnd, 0, 0)
Call Plugin.Window.Active(Hwnd)
dm_ret = dm.BindWindow(hwnd, "normal", "normal", "normal", 0)
Delay 200
foobar = dm.CreateFoobarRect(0, 0, 600, 800, 200)
dm_ret = dm.FoobarFillRect(foobar, 0, 0, 800, 200, "000000")
dm_ret = dm.FoobarLock(foobar)
dm_ret = dm.FoobarUpdate(foobar)
//================================================>
dm.MoveTo 0, 0
Delay 200
dm.LeftClick
Delay 500
dm.KeyPress 27
Delay 200
Do
dm.KeyPress 66
Delay 200
dm_ret = dm.FindPic(348,21,444,70,"拍卖行(B).bmp","000000",0.9,0,intX,intY)
If intX >= 0 and intY >= 0 Then
TracePrint "拍卖行已打开"
Exit Do
Else
dm.KeyPress 27
Delay 200
End If
Loop
dm.MoveTo 399+s_s, 547
Delay 50
dm.LeftClick
Delay 120
dm.MoveTo 636+s_s, 88
Delay 50
dm.LeftClick
Delay 120
dm.MoveTo 198+s_s,90
Delay 50
dm.LeftClick
Delay 20
物品 = Form1.InputBox1.Text
SayString 物品
Do
Rem ss
dm.MoveTo 589+s_s,91
Delay 50
dm.LeftClick
Delay 60
For 100
Delay 20
dm_ret = dm.FindPic(446,132,498,156,"小时.bmp","020202",0.9,0,intX,intY)
If intX >= 0 and intY >= 0 Then
Exit For
End If
Next
dm_ret = dm.FindColor(531,124,613,143,"ff3232-000000",1.0,0,intX,intY)
If intX >= 0 and intY >= 0 Then
MessageBox "金币不足，脚本停止！"
ExitScript
End If
wp_zj = dm.Ocr(531, 124, 613, 143, "ffb400-000000", 1.0)
wp_sl = dm.Ocr(155, 119, 199, 141, "ffffff-000000", 1.0)
wp_szdj = CLng(Form1.InputBox2.Text)
wp_dj = wp_zj / wp_sl
s = Plugin.Sys.GetDateTime()
dm_ret = dm.FoobarPrintText(foobar, s&"----物品单价为："&wp_dj, "ff0000")
dm_ret = dm.FoobarUpdate(foobar)
If wp_dj <= wp_szdj Then
dm.MoveTo 579 + s_s, 144
Delay 50
dm.LeftClick
Delay 20
dm.KeyPress 13
Delay 20
dm.KeyPress 13
Delay 500
dm.KeyPress 13
ElseIf wp_dj > wp_szdj Then
Goto ss
End If
Delay 150
dm.MoveTo 399+s_s, 547
Delay 50
dm.LeftClick
Delay 150
Loop
// ================================================================
Function 大漠注册()
need_ver = "3.1230"
Set ws = createobject("Wscript.Shell")
ws.run "regsvr32 atl.dll /s"
Set ws = nothing
PutAttachment "C:\Users\Administrator\Desktop\3.1230", "*.*"
PutAttachment ".\Plugin", "RegDll.dll"
Call Plugin.RegDll.Reg("C:\Users\Administrator\Desktop\3.1230\dm.dll")
Set dm = createobject("dm.dmsoft")
ver = dm.Ver()
If ver <> need_ver Then
Set dm = nothing
Set ws = createobject("Wscript.Shell")
ws.run "regsvr32 C:\Users\Administrator\Desktop\3.1230\dm.dll /s"
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
Function s_s()
z_x = 1 * 0.9
z_d = 5 * 0.91
Randomize
s_s = ((z_d - z_x + 1) * Rnd + z_x)
End Function
Sub OnScriptExit()
dm.UnBindWindow
TracePrint "解绑完成！"
End Sub