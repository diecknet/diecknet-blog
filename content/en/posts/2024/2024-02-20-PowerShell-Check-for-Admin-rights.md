---
slug: "powershell-check-for-admin-rights"
title: "PowerShell: Checking whether you have admin rights"
date: 2024-02-20
comments: true
tags: [powershell, security identifiers, windows, admin rights]
cover: 
    image: "/images/2024/2024-02-20_PowerShell_UAC_Deutsch.jpg"
---

If you create a PowerShell script that should perform actions that require administrator rights, you can also check this in code. This allows you to make sure that your script can be executed successfully. The easiest way is with a `Requires` statement.
**[🎬 I also created a video on this topic.](https://youtu.be/ACUCARq7joM)**

## Requiring admin rights with a Requires statement

```powershell
#Requires -RunAsAdministrator
```

This line can be inserted at any point in the PowerShell code. I would always place it fairly near the top of the script so it is easy to see. But the position technically does not matter. So if the `#Requires` statement is in the code, it is evaluated before the rest of the code is executed. Depending on whether administrator rights are present or not, an error is returned.

[![Error when the #Requires -RunAsAdministrator statement is used in the code but no admin rights are available](/images/2024/2024-02-20_PowerShell_Admin_Requires_Error.jpg "Error when the #Requires -RunAsAdministrator statement is used in the code but no admin rights are available")](/images/2024/2024-02-20_PowerShell_Admin_Requires_Error.jpg)

## Windows: Checking admin rights in code

But the `#Requires -RunAsAdministrator` method is not suitable for every case.
Imagine you have a script that does not necessarily need admin rights, but if they are available, something could be implemented better. For example, a configuration could be set system-wide with admin rights, but if only normal user rights are available, the setting is only applied to the current user. If you want to check for this, you need to use a few .NET methods. There are a few different ways to do it. I think the following is the best because it only takes one line of code.
We use the `[Security.Principal.WindowsIdentity]` class and call the `::GetCurrent()` method there. This will show us some information about the identity currently in use. What we are interested in is the `Groups` property. That is where the groups of our identity are listed. The groups are listed here as Security Identifiers (SIDs). What we are interested in is the SID `S-1-5-32-544`. It means the following:

- Revision level `1`
- Identifier authority value `5` - stands for "NT Authority"
- Domain identifier `32` - stands for Builtin (so not an Active Directory domain)
- And the relative identifier `544` stands for the group "Administrators"

We can check whether the SID is included in the `.Groups` property directly in the same line by using the `-contains` operator.

```powershell
[Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains 'S-1-5-32-544'
```

If the code is executed by a user who theoretically has admin rights, but has not confirmed them via User Account Control (UAC), this method returns `false`, as though the user were not in the admin group. If I start a PowerShell window with admin rights, it returns `true`. I can simply insert this line of code and use an `if` check to evaluate the result and react accordingly. Unfortunately, this only works on Windows, but there it works in both Windows PowerShell and PowerShell 7.

## Cross-platform: Checking admin rights in code

From PowerShell 7.4 onward, there is also a cross-platform way to determine whether we currently have admin rights. We do that again via .NET, but it is simpler than the Windows-only method. We simply read the `IsPrivilegedProcess` property from the `[System.Environment]` class.

```powershell
# Since PowerShell 7.4 (.NET 8)
[System.Environment]::IsPrivilegedProcess
```

Here too, `true` or `false` is returned depending on whether we have admin rights or not. And as mentioned, this works cross-platform, for example also on Linux (`root` rights).

## Requesting admin rights

There is also the option to actively request admin rights. I am not really a fan of that, so the checks above are enough for me. But if you want to do it anyway, I like the code from Jeff Guillet and Pat Richard. [The code was published in the EXPTA blog](https://blog.expta.com/2017/03/how-to-self-elevate-powershell-script.html) - I am not simply copying it. In essence, it also uses a Windows-specific check to determine whether admin rights are available. If they are not, the script restarts itself via `Start-Process` and requests admin rights with the parameter `-Verb RunAs`. The cool thing is that the EXPTA version also preserves the original script parameters.
