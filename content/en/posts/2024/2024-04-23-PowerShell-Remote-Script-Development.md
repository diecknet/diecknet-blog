---
slug: "powershell-remote-script-development"
title: "Developing PowerShell Scripts Remotely"
date: 2024-04-23
comments: true
tags: [powershell]
---

It is possible to develop PowerShell scripts remotely. In other words, the script is stored and executed on a remote computer, but the input comes from the local editor tool. This works with both the classic Windows PowerShell ISE and with Visual Studio Code. In VS Code, you can work with remote Windows PowerShell as well as remote PowerShell 7 systems.

**🎬 I have also created a [video on this topic](https://www.youtube.com/watch?v=T009J35wJQE).**

## Windows PowerShell ISE

The Windows PowerShell ISE only supports remote Windows systems with Windows PowerShell. To develop a script remotely, you can start a session via the menu "File" -> "New Remote PowerShell Tab".

[![Start a new remote PowerShell tab in the PowerShell ISE](/images/2024/2024-04-23_PS_Remote_ISE_1.jpg "Start a new remote PowerShell tab in the PowerShell ISE")](/images/2024/2024-04-23_PS_Remote_ISE_1.jpg)

In the dialog "New Remote PowerShell Tab", you can then enter the hostname of the remote computer and optionally a different username. If the user you are currently logged in as locally already has rights for the remote computer, you do not need to enter them here again.

[![Entering the remote computer name in the dialog for a new remote PowerShell tab in the PowerShell ISE](/images/2024/2024-04-23_PS_Remote_ISE_2.jpg "Entering the remote computer name in the dialog for a new remote PowerShell tab in the PowerShell ISE")](/images/2024/2024-04-23_PS_Remote_ISE_2.jpg)

A new tab opens. The square brackets in the prompt indicate that it is a remote system.

[![PowerShell ISE connected to Server1](/images/2024/2024-04-23_PS_Remote_ISE_3.jpg "PowerShell ISE connected to Server1")](/images/2024/2024-04-23_PS_Remote_ISE_3.jpg)

To create a new script file on the remote computer, you can use the `New-Item` cmdlet. To edit a script that is located on the remote computer, you can use the `psedit` command.

```powershell
# Create script file
New-Item RemoteExample.ps1

# Edit script
psedit .\RemoteExample.ps1
```

[![Creating and editing a remote script in the PowerShell ISE](/images/2024/2024-04-23_PS_Remote_ISE_4.jpg "Creating and editing a remote script in the PowerShell ISE")](/images/2024/2024-04-23_PS_Remote_ISE_4.jpg)

A tab for your "remote file" then opens inside the remote tab. If you move the mouse pointer over the title of the remote file tab, a local path appears where the script is cached. If you save the script, the changes are automatically transferred to the remote system.

[![The remote script in the PowerShell ISE has a local path](/images/2024/2024-04-23_PS_Remote_ISE_5.jpg "The remote script in the PowerShell ISE has a local path")](/images/2024/2024-04-23_PS_Remote_ISE_5.jpg)

Now you can basically develop a script normally in the Windows PowerShell ISE. You can run individual lines or the whole script. The commands are executed on the remote system, as shown in the screenshot below. The content of the variable `$ENV:COMPUTERNAME` is output, showing that the script is running on host `Server1`.

[![Developing a remote script in the PowerShell ISE](/images/2024/2024-04-23_PS_Remote_ISE_6.jpg "Developing a remote script in the PowerShell ISE")](/images/2024/2024-04-23_PS_Remote_ISE_6.jpg)

Debugging is also possible. In the following screenshot, for example, I set a breakpoint with the `F9` key and ran the script in debugging mode with `F5`.

[![Debugging a remote script in the PowerShell ISE](/images/2024/2024-04-23_PS_Remote_ISE_7.jpg "Debugging a remote script in the PowerShell ISE")](/images/2024/2024-04-23_PS_Remote_ISE_7.jpg)

When you are done, you can simply close the remote tab.

[![Closing the remote tab in the PowerShell ISE](/images/2024/2024-04-23_PS_Remote_ISE_8.jpg "Closing the remote tab in the PowerShell ISE")](/images/2024/2024-04-23_PS_Remote_ISE_8.jpg)

## Visual Studio Code

Visual Studio Code also supports remote PowerShell development. And here, PowerShell 7 is even possible, while Windows PowerShell still works. The important thing is that you have installed the [PowerShell extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell). And the extension console must also be running. If you are not already editing a PowerShell script locally, the extension console may not be running yet. To start it, you can open the Command Palette with the key combination "Ctrl" + "Shift" + "P". There you can search for "PowerShell: Restart Session" and run it.

[![Visual Studio Code PowerShell extension restart](/images/2024/2024-04-23_PS_Remote_VSCode_1.jpg "Visual Studio Code PowerShell extension restart")](/images/2024/2024-04-23_PS_Remote_VSCode_1.jpg)

To connect to a Windows PowerShell system, you can simply run `Enter-PSSession <Hostname>` in the extension console. For example:

```powershell
Enter-PSSession Server1
```

[![Visual Studio Code connecting to a remote Windows PowerShell system](/images/2024/2024-04-23_PS_Remote_VSCode_2.jpg "Visual Studio Code connecting to a remote Windows PowerShell system")](/images/2024/2024-04-23_PS_Remote_VSCode_2.jpg)

If you want to connect to a PowerShell 7 system, you need to provide the `-Hostname` parameter. Otherwise, the omitted parameter name is interpreted as `-ComputerName`, which is only suitable for Windows PowerShell systems. In both cases, you can use `-Username` to specify a different username if your remote system requires it.

```powershell
Enter-PSSession -Hostname DC2 -Username administrator
```

[![Visual Studio Code connecting to a PowerShell 7 system](/images/2024/2024-04-23_PS_Remote_VSCode_3.jpg "Visual Studio Code connecting to a PowerShell 7 system")](/images/2024/2024-04-23_PS_Remote_VSCode_3.jpg)

Creating and editing scripts is basically the same as in the Windows PowerShell ISE: new script files can be created with `New-Item`, and editing a script works with `psedit`. Then you can also run the current line or selection with `F8`, or the whole script with `F5`.

```powershell
# Create script file
New-Item RemoteExample.ps1

# Edit script
psedit .\RemoteExample.ps1
```

In theory, remote debugging should also work, but when I tested it in March 2024, it did not work. That seems to be a known issue, and it should work again soon.

When you are done, you can end a remote session with `Exit-PSSession`.
