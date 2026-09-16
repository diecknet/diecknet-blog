---
slug: "powershell-recycle-bin"
title: "Emptying the Recycle Bin with PowerShell"
date: 2026-09-16
tags: [powershell, windows]
---

If you want to empty the Windows Recycle bin automatically, you can use PowerShell. In this post, I'll show you how.

I also demonstrate everything mentioned here [in this video on YouTube](https://youtu.be/BiIrZsEvz5c).

## Why though?

I don't claim that using PowerShell to empty the Recycle Bin is generally better than using the GUI. But with PowerShell you can automate it. For example as part of a custom system clean-up script.

## Note: Works only on Windows

The code shown in this post only works on Windows.

## Empty Recycle Bin of the current user

The following code empties the Recycle Bin of the current user:

```powershell
Clear-RecycleBin
```

Optionally, you can add the `-Force` parameter to prevent additional confirmation prompts:

```powershell
Clear-RecycleBin -Force
```

If you have multiple volumes on your computer, you might want to empty only the Recycle Bin of a specific drive:

```powershell
Clear-RecycleBin -DriveLetter E -Force
```

## Empty Recycle Bin of all users

Sadly the native `Clear-RecycleBin` cmdlet only empty the Recycle Bin of the *current user*. If you want to empty the Recycle Bins of all users on the system you need to work with the file system. 

In case you didn't know: The Recycle Bin is stored in a folder called `$Recycle.Bin` which is stored on the root of the drive (one for each volume).
Since the dollar symbol gets interpreted as a sign for a variable, we have to use the `'` single quotes, instead of `"` double quotes for the path.

```powershell
Remove-Item 'C:\$Recycle.Bin' -Force -Recurse
```

And if you have other volumes, you can either empty the Recycle Bins with a hard coded path like this:

```powershell
Remove-Item 'E:\$Recycle.Bin' -Force -Recurse
```

Or do something automatic for all volumes by using the PowerShell pipeline to combine a few cmdlets, for example I came up with this snippet:

```powershell
Get-Volume | 
    Where-Object {$_.DriveLetter -and $_.DriveType -ne "CD-ROM"} | 
    ForEach-Object { Remove-Item "$($_.DriveLetter):\`$Recycle.Bin -Force -Recurse }
```
