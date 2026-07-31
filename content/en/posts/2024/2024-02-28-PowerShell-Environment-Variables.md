---
slug: "powershell-environment-variables"
title: "PowerShell: Accessing Environment Variables"
date: 2024-02-28
comments: true
tags: [powershell, environment variables, windows]
---

Accessing environment variables via PowerShell is very simple.
**🎬 I also created a [video on this topic](https://youtu.be/25-jcylahSo).**

## Read an environment variable via the `$Env:` variable

The simplest way is through the `$Env:` variable. Just type `$Env`, then a colon, and then the name of the environment variable whose value you want to read.

```powershell
$Env:username
```

This outputs the username of the currently logged-in user.

[![Example output of $Env:username in PowerShell - the current username is displayed](/images/2024/2024-02-28_PowerShell_ENV_1.jpg "Example output of $Env:username in PowerShell - the current username is displayed")](/images/2024/2024-02-28_PowerShell_ENV_1.jpg)

This also works cross-platform, for example on Linux.

## Read environment variables via a PSDrive

Environment variables are also available as a PSDrive, meaning as a PowerShell drive. That means you can navigate through all environment variables just like through a file system. For example, you can list all environment variables with `Get-ChildItem`.

```powershell
Get-ChildItem Env:
```

This gives you a nice listing of all environment variables and their values. This also works cross-platform, for example on Linux.
[![Example output of Get-ChildItem Env: in PowerShell - the environment variables are listed](/images/2024/2024-02-28_PowerShell_ENV_2.jpg "Example output of Get-ChildItem Env: in PowerShell - the environment variables are listed")](/images/2024/2024-02-28_PowerShell_ENV_2.jpg)

## Scopes of environment variables

On Windows there are three scopes for environment variables (English: scopes):

- Machine scope (sometimes also called System scope)
- User scope
- Process scope

These three scopes form a hierarchy, and values set there are inherited downward unless they are overridden at a lower level.
In the screenshot below, for example, the variable "TEMP" is set system-wide to `C:\Windows\Temp`. But in the user scope it is overridden by `C:\Users\diecknet\AppData\Local\Temp`.

[![Example of environment variables - GUI and PowerShell side by side](/images/2024/2024-02-28_PowerShell_ENV_3.jpg "Example of environment variables - GUI and PowerShell side by side")](/images/2024/2024-02-28_PowerShell_ENV_3.jpg)

In addition, it can also be overridden at the process level. In PowerShell I can simply use a `$Env:` variable and assign a different value.

```powershell
$Env:TEMP = "C:\TEMP"
```

For this PowerShell process, the value is then different. **Subordinate processes will also be started with the modified environment variables.**

If we want to change an environment variable not only for the current process scope, but for the user scope or the system scope, it is not as simple as a normal variable assignment in PowerShell.

## Setting environment variables in other scopes

To set user-scope or system-scope environment variables, we can use a .NET method, namely:

```powershell
[System.Environment]::SetEnvironmentVariable("Name","Value","Scope")
```

Possible values for the scope are `Machine`, `User`, or `Process`. If you want to make a system-wide change, meaning a variable in the Machine scope, you need administrator rights, otherwise the operation will fail.

```powershell
# Example to set an environment variable in the Machine scope
[System.Environment]::SetEnvironmentVariable("Hello","TEST","Machine")

# Example to set an environment variable in the User scope
[System.Environment]::SetEnvironmentVariable("Hello","TEST","User")
```

Note: If you make a change for one of these higher levels, it will not automatically be inherited by the currently running PowerShell process. The environment variables are loaded when the process starts.

## Deleting an environment variable

If you want to delete an environment variable, you can simply set it to an empty value. This works with both the `$Env:` syntax and the .NET method.

```powershell
# Delete an environment variable using the .NET method
[System.Environment]::SetEnvironmentVariable("Channel","","User")

# Delete an environment variable using the $Env: syntax
$Env:Test123 = ""
# Delete an environment variable using the $Env: syntax (this also works)
$Env:Test123 = $null
```
