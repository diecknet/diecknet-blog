---
slug: "powershell-array-plus"
title: "The Problem with Array += in PowerShell"
date: 2024-09-12
comments: true
tags: [powershell]
---

PowerShell unfortunately makes it quite easy to write inefficient code. Many people, for example, use the `+=` syntax to populate an array. That is not recommended.

```powershell {hl_lines=[4]}
# Please do not do it this way!
$Array = @()
for ($i = 0; $i -lt 10000; $i++) {
    $Array += $i
}
```

We can measure how long the execution of a scriptblock takes with `Measure-Command`. On my test VM, the execution of the code above took over 2 seconds.

[![The result of Measure-Command: TotalMilliSeconds 2260](/images/2024/2024-09-12_Measure-Command1.jpg "The result of Measure-Command: TotalMilliSeconds 2260")](/images/2024/2024-09-12_Measure-Command1.jpg)

## Reason

The reason is that arrays in PowerShell are actually static. They cannot really be extended with new entries. Instead, the contents of the array are copied, the new entry is added, and the result is stored in a new array object. In most cases, the old array is then stored in the same variable as before, which makes this process not very visible and easy to overlook.

## Alternatives

There are several alternatives to the `+=` method.

### Capture the pipeline

If the data in the array only needs to be created once and does not need to be modified, I prefer the following approach. I take the variable in which I want to store the array and simply assign the output of my loop to it. No assignment takes place inside the loop itself; instead, an object is output. Initializing the variable as an array, for example with `$MeinArray = @()`, is also unnecessary in this case.

```powershell
# $MeinArray receives the output of the loop as its content
$MeinArray = for ($i = 0; $i -lt 10000; $i++) {
    $i # This output is automatically stored in the variable $MeinArray
}
```

### Generic List

If the data also needs to be changed, a generic list is practical. It must be initialized using a .NET method, which is slightly more complicated than normal PowerShell cmdlets. But the code can of course be copied, so it is not really a problem.

```powershell
$List = [Collections.Generic.List[PSObject]]::new()
for ($i = 0; $i -lt 10000; $i++) {
    $List.Add($i)
}
```

I also show this in more detail in [a video in the free PowerShell course](https://www.youtube.com/watch?v=tCJyYLgiSZA).

### Other alternatives

There are also other alternatives, such as hashtables.

```powershell
$MeineHashtable = @{"Hallo"="Hallo PowerShell"}
# Various ways to add data to the hashtable
$MeineHashtable["hi"] = "Hi PowerShell :)"
$MeineHashTable.Add("moin","MOIN MOIN!")
```

## Improvements in PowerShell 7.5

From PowerShell 7.5 onward (expected to arrive in November 2024), the problem is somewhat [mitigated](https://github.com/PowerShell/PowerShell/pull/23901). The `+=` method works much faster there than in previous PowerShell versions. It is still not 100 percent ideal, however, because data still needs to be copied unnecessarily through memory.

[![+= is much faster in PowerShell 7.5 than in previous versions. Here 55ms instead of 2768ms.](/images/2024/2024-09-12_Measure-Command2.jpg "+= is much faster in PowerShell 7.5 than in previous versions. Here 55ms instead of 2768ms.")](/images/2024/2024-09-12_Measure-Command2.jpg)

## Measure performance

With the following code, I measured the speed of `+=` vs. generic lists. The test code for "Allocated Memory" only works in PowerShell 7, not in Windows PowerShell 5.1.

```powershell
#Requires -Version 7.4
$Host.UI.RawUI.WindowTitle = $PSVersionTable.PSVersion
Write-Host "Using PowerShell $($PSVersionTable.PSVersion)" -ForegroundColor DarkYellow
"--------------------------------------"

#region Test Array +=
$s = [gc]::GetTotalAllocatedBytes($true)

$Time = (Measure-Command {
    &{
        $val = @()
        for ($i = 0; $i -lt 10000; $i++) {
            $val += $i
        }
    }
}).TotalMilliseconds

$e = [gc]::GetTotalAllocatedBytes($true);
$RAM = [math]::Round(($e-$s)/1MB,2)

Write-Host "Using += took $($Time)ms"
Write-Host "Allocated Memory $($RAM)MB"
#endregion

"--------------------------------------"

#region Test List

$s = [gc]::GetTotalAllocatedBytes($true)

$Time = (Measure-Command {
    &{
        $List = [Collections.Generic.List[PSObject]]::new()
        for ($i = 0; $i -lt 10000; $i++) {
            $List.Add($i)
        }
    }
}).TotalMilliseconds

$e = [gc]::GetTotalAllocatedBytes($true);
$RAM = [math]::Round(($e-$s)/1MB,2)

Write-Host "Using List.Add() took $($Time)ms"
Write-Host "Allocated Memory $($RAM)MB"
#endregion
```
