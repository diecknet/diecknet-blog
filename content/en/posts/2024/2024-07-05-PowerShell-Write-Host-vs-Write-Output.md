---
slug: "powershell-write-host-vs-write-output"
title: "PowerShell Write-Host vs. Write-Output"
date: 2024-07-05
comments: true
tags: [powershell]
---
In PowerShell, you can output text with the `Write-Host` cmdlet. However, it is sometimes discouraged to use it. There is the alternative `Write-Output`, for example. In this post, I will explain the differences.

**🎬 I also created a [video on this topic](https://www.youtube.com/watch?v=eHBO4b_Riho).**  

## Write-Host

`Write-Host` writes data to the PowerShell **host**, the program hosting the current PowerShell session. Often this is the `ConsoleHost`, but for example PowerShell ISE or Visual Studio Code use their own hosts, which differ from each other in some aspects.

[![Example of other PowerShell hosts: Visual Studio Code and PowerShell ISE](/images/2024/2024-07-05_Other_PSHosts.jpg "Example of other PowerShell hosts: Visual Studio Code and PowerShell ISE")](/images/2024/2024-07-05_Other_PSHosts.jpg)

`Write-Host` can influence the way data is output by the PowerShell host. For example, `-ForegroundColor` can be used to change the text color and `-BackgroundColor` to change the background color.
So if you run a script interactively in a console, `Write-Host` can be quite useful for producing a more appealing output.
One major disadvantage is that data written with `Write-Host` cannot be processed further in the pipeline.

So the result cannot, for example, be stored in a variable:

```powershell
$Variable = Write-Host "Hallo PowerShell"
# Return: Hallo PowerShell

$Variable
# = no visible return
```

And it also cannot be piped to other cmdlets:

```powershell
Write-Host "C:\temp" | Get-ChildItem
# Return: C:\temp (and not the contents of C:\temp!)
```

## Write-Output

`Write-Output`, on the other hand, can be processed further:

```powershell
$Variable = Write-Output "Hallo PowerShell"
$Variable
# Return: Hallo PowerShell

Write-Output "C:\temp" | Get-ChildItem
# Return: < contents of C:\temp ... >
```

For that, however, you lose the formatting options that `Write-Host` offers.

## When to use which one?

It is beneficial to know and use the differences between `Write-Host` and `Write-Output`. For example, if you store the output of a scriptblock from a loop in a variable, outputs produced with `Write-Output` would likely pollute your result array with unwanted entries. If you use `Write-Host` instead, you can create output without it ending up in the result array.

```powershell
$Ps1Files = Get-ChildItem *.ps1 -Recurse
$Ergebnis = foreach($File in $Ps1Files) {
    $File.FullName # This is output from the loop
    Write-Host "$($File.Name)" -NoNewLine -ForeGroundColor Yellow
    Write-Host " found..."
}
```

[![Result of the previous code: colorful output with Write-Host and filling a variable](/images/2024/2024-07-05_Write-Host-in-a-Loop.jpg "Result of the previous code: colorful output with Write-Host and filling a variable")](/images/2024/2024-07-05_Write-Host-in-a-Loop.jpg)

Or, if you run a script in Azure Automation, outputs created with `Write-Host` do not end up in the logs. If you create scripts for Azure Automation, you should therefore use `Write-Output` instead of `Write-Host`.

```powershell
# Azure Automation example code
Write-Output "Azure Automation also uses another PowerShell host"
Get-Host

Write-Host "Output produced with Write-Host is not visible in Azure Automation"
```

[![Execution of the previous PowerShell runbooks in Azure Automation: output is produced via Write-Output or any other cmdlet. Output produced with Write-Host is not visible](/images/2024/2024-07-05_Write-Output-in-Azure-Automation.jpg "Execution of the previous PowerShell runbooks in Azure Automation: output is produced via Write-Output or any other cmdlet. Output produced with Write-Host is not visible")](/images/2024/2024-07-05_Write-Output-in-Azure-Automation.jpg)

### Write-Output is actually optional

If you think that `Write-Output` should generally be preferred: you do not actually need to use `Write-Output` at all. You can simply reference the object you want to output directly, whether it comes from a variable, a cmdlet, or something else, and it will be displayed. The only advantage is that it is a bit more obvious in the code that you deliberately want to generate output.

```powershell
Write-Output "Hello :)"
# Return: Hello :)

"Hello :)"
# Return: Hello :)
```

## Note on output streams

Apart from `Write-Output` and `Write-Host`, there are also other output cmdlets, such as `Write-Information`, `Write-Error`, `Write-Warning`, and so on. You can use them to produce output and send it to different output streams. The person running the script at the end can decide which information, meaning which streams, they want to see. Interestingly, `Write-Host` does not only write directly to the console host, but also to the information stream.
If you want to know more about this topic, check out [this video about PowerShell output streams](https://www.youtube.com/watch?v=tpzQA3F9O_s).

## Conclusion

In summary, I would say:
`Write-Host` mainly displays information visually for the user in the console. `Write-Output` is independent of that and passes information through the PowerShell pipeline. If `Write-Output` is the last command in a pipeline, the information is displayed visibly and can be captured better by other logging functionality.
