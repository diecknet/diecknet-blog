---
slug: "powershell-dot-sourcing"
title: "PowerShell Dot Sourcing"
date: 2024-03-26
comments: true
tags: [powershell]
---

With PowerShell dot sourcing, you can import a script file into your PowerShell session. The script is executed normally, but variables, functions, and so on that are defined in it remain available in the session. That is not the case with a normal script invocation. It always reminds me of the PHP `include` command because I spent a lot of time messing around with PHP in my youth. 😅

**🎬 I have also created a [video on this topic](https://youtu.be/TTnKAU-Po7Q).**

## Normal script invocation

For comparison, a script is normally executed like this. Either with a relative path or with an absolute path.

```powershell
# Relative path
.\MeinSkript.ps1

# Absolute path:
& C:\diecknet\MeinSkript.ps1
```

When the script is run normally, I can see any output from the script, but functions or variables from the script are not available anymore. In the screenshot below, for example, the function `Test-BeispielFunktion` and the variable `$TestVariable` from the script are not available in the session.

[![Example of a normal script invocation: variables and functions from the script are NOT available in the session](/images/2024/2024-03-25_No_DotSourcing.jpg "Example of a normal script invocation: variables and functions from the script are NOT available in the session")](/images/2024/2024-03-25_No_DotSourcing.jpg)

## Invocation with dot sourcing

With dot sourcing, a dot and a space are placed before the path. Dot sourcing can also use either a relative or an absolute path.

```powershell
# Relative path
. .\MeinSkript.ps1

# Absolute path:
. C:\diecknet\MeinSkript.ps1
```

When I run the script with dot sourcing, it does not just execute the code, but imports everything into the global scope of the PowerShell session. That means I can, for example, access a function defined in the script or display the contents of a variable. In the screenshot below, the function `Test-BeispielFunktion` and the variable `$TestVariable` defined in the script are also available in the session afterward.

[![Example of dot sourcing: variables and functions from the script are available in the session](/images/2024/2024-03-25_DotSourcing_Example.jpg "Example of dot sourcing: variables and functions from the script are available in the session")](/images/2024/2024-03-25_DotSourcing_Example.jpg)

## When to use dot sourcing?

I use dot sourcing when I want to reuse a function without creating a full PowerShell module for it. And importing via dot sourcing works naturally both in the console and in script files.

By the way, Visual Studio Code and the PowerShell ISE also run code with dot sourcing by default. That is why, for example, the contents of variables are available after executing the code there as well.
