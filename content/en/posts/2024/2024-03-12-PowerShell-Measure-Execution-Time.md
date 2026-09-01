---
slug: "powershell-measure-execution-time"
title: "Measuring the Execution Time of PowerShell Code"
date: 2024-03-12
comments: true
tags: [powershell, measure, optimization, timespan]
---

If you want to optimize the speed of your PowerShell code, it makes sense to measure times. There are several ways to measure how long a piece of PowerShell code takes to run.

**🎬 I have also created a [video on this topic](https://youtu.be/-tpR-KQpPq4).**

## Option 1: Measure-Command

A simple way is to use the `Measure-Command` cmdlet. It accepts a script block, which is then executed. We then get a measurement result in the form of a `TimeSpan` object. A simple example:

```powershell
Measure-Command { Get-Disk }
```

[![Measurement with Measure-Command](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_1.jpg "Measurement with Measure-Command")](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_1.jpg)

But we can measure more than a single command. Here is an example in which a longer block of code is executed and measured.

```powershell
Measure-Command {
    ($i = 0; $i -lt 100; $i++) {
        "Hello $i"
    }
}
```

[![Longer measurement with Measure-Command](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_2.jpg "Longer measurement with Measure-Command")](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_2.jpg)

The returned `TimeSpan` object has several properties. In general, I usually work with the properties that start with "Total" because they show the full duration. But the time values without the "Total" prefix can also give a good overview.

What you may have noticed is that the actual output of the commands we measure is not visible. At least not the output that is written to the normal output streams. An exception would be `Write-Host`, because `Write-Host` also writes to the information stream, but it also sends the output directly to the console host. So if I use `Write-Host` inside the `Measure-Command` block to print text, it works.

```powershell
Measure-Command {
    for($i = 0; $i -lt 5; $i++) {
        Write-Host "Hello $i"
    }
}
```

[![Text output with Write-Host when using Measure-Command](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_3.jpg "Text output with Write-Host when using Measure-Command")](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_3.jpg)

But that is not suitable for every scenario. Sometimes you may want to output a complete object or see the return value of a cmdlet directly, even while measuring. In that case, the other method is more suitable.

## Option 2: The .NET Stopwatch object

Another way to measure time is with the .NET object `Stopwatch`. If we want to measure the execution time of a piece of PowerShell code, we simply start the stopwatch before it and stop it after the code. Then we can display the result.

I create the object by calling the `StartNew()` method of the `System.Diagnostics.Stopwatch` class. That creates a `Stopwatch` object and starts the timer in one step. In theory, you could create the object first and then start the timer, but I find this version better because it requires less code.

Then we place the entire block of PowerShell code that should be measured. It is not necessary to wrap the code in braces `{}`. After our actual code, we call the `Stop()` method of the `Stopwatch` object. That only stops the measurement, though. The result is not displayed yet. To see the result, we look at the `Elapsed` property of the `Stopwatch` object. Like the `Measure-Command` function, it returns a `TimeSpan` object. I also find the "Total" properties more useful here, because they represent the overall duration of the operation.

```powershell
$StopWatch = [System.Diagnostics.Stopwatch]::StartNew()

"How long do you think this code will take..?"

$StopWatch.Stop()
$StopWatch.Elapsed
```

[![Measurement with the .NET Stopwatch object in PowerShell](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_1.jpg "Measurement with the .NET Stopwatch object in PowerShell")](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_1.jpg)

## Measuring multiple times is useful

Whatever method you use, it makes sense to measure more than once. Depending on what you are measuring, the results may also be distorted because something is cached or not cached yet. For example, if you use a cmdlet from a module you downloaded, and you have not yet run any other cmdlet from that module or explicitly imported the module, PowerShell will first try to find the cmdlet, then load the module, and only then execute the cmdlet. That can make the first execution of a command take longer than all later executions.

In most cases, you will be better off if you import the relevant module in advance with `Import-Module` and only then run your measurements. That helps ensure your test results are not skewed.

Here is a small example of how you could test a piece of code multiple times (1000 times!)

```powershell
<# 
    I am using a generic list here to store the test results,
    which is better suited for adding data from a loop.
#>
$AllTests = [System.Collections.Generic.List[PSObject]]::new()

for($i = 0; $i -lt 1000; $i++) {
    $StopWatch = [System.Diagnostics.Stopwatch]::StartNew()

    "How long do you think this code will take..?"

    $StopWatch.Stop()
    $AllTests.Add($StopWatch.Elapsed)
}

# Simple overview with minimum, maximum, and average
$AllTests.TotalMilliseconds | Measure-Object -Average -Maximum -Minimum
```

[![Multiple measurements with the .NET Stopwatch object in PowerShell](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_2.jpg "Multiple measurements with the .NET Stopwatch object in PowerShell")](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_2.jpg)

You could certainly format the data in a better and more meaningful way, but for simple scenarios this has always been enough for me.

## Further reading

- PowerShell cmdlet `Measure-Command`: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/measure-command?view=powershell-5.1>
- .NET class `StopWatch`: <https://learn.microsoft.com/de-de/dotnet/api/system.diagnostics.stopwatch.startnew?view=netframework-4.8.1>
