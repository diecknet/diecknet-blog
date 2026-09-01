---
slug: "powershell-suppress-output"
title: "Suppressing PowerShell Output"
date: 2024-04-09
comments: true
tags: [powershell]
---

Sometimes PowerShell commands return information even though we are not interested in it. There are different scenarios in which you can suppress the output.

**🎬 I have also created a [video on this topic](https://youtu.be/0hS3IWrr_3I).**

I will use the `New-NetFirewallRule` cmdlet as an example, which I can use to add a new rule in the Windows Firewall:

```powershell
New-NetFirewallRule -DisplayName "Block outbound connections to port 443" -Direction Outbound -RemotePort 443 -Protocol TCP -Action Block
```

[![Example of excessive output from a PowerShell cmdlet: running New-NetFirewallRule](/images/2024/2024-04-09_PowerShell_new-netfirewallrule_example.jpg "Example of excessive output from a PowerShell cmdlet: running New-NetFirewallRule")](/images/2024/2024-04-09_PowerShell_new-netfirewallrule_example.jpg)

When I run that, I get an object back that represents the firewall rule. That is useful if I want to process it further in a script. But sometimes I do not need that information.

## `$null` vs. `Out-Null`

I would usually suppress it by assigning the output of the command to the predefined variable `$null`. `$null` is read-only, so it does not really receive another value.

```powershell
$null = New-NetFirewallRule -DisplayName "Block outbound connections to port 443" -Direction Outbound -RemotePort 443 -Protocol TCP -Action Block
```

An alternative is to pipe the result of the command to the `Out-Null` cmdlet.

```powershell
New-NetFirewallRule -DisplayName "Block outbound connections to port 443" -Direction Outbound -RemotePort 443 -Protocol TCP -Action Block | Out-Null
```

[![2 ways to suppress the output of a PowerShell command: with $null and Out-Null](/images/2024/2024-04-09_PowerShell_hide_output_example_1.jpg "2 ways to suppress the output of a PowerShell command: with $null and Out-Null")](/images/2024/2024-04-09_PowerShell_hide_output_example_1.jpg)

I have found that assigning to `$null` is usually more performant than piping to `Out-Null`. That is because the execution of the pipe always has some impact on performance. In some cases there is no difference, or only a small one; in other cases it is more significant.

But both are faster than always showing the object. Of course it also depends on the cmdlet and the object returned, but in my experience it was reproducibly a few milliseconds slower when I let the created firewall rule be displayed.

[![Measurements for different ways of suppressing output and not suppressing it](/images/2024/2024-04-09_PowerShell_suppress-output-comparison.jpg "Measurements for different ways of suppressing output and not suppressing it")](/images/2024/2024-04-09_PowerShell_suppress-output-comparison.jpg)

## Suppressing errors

It can also happen that your cmdlet writes errors. If you are not interested in them and just want to continue, you can try setting the common parameter `-ErrorAction` to `SilentlyContinue`.

```powershell
$null = New-Item C:\diecknet\Hello\World -Type Directory -ErrorAction SilentlyContinue
```

But this does not work for all cmdlets and not for all errors. Some errors are so severe that you cannot simply continue with `SilentlyContinue`. In that case, you can try catching the error with a `try-catch` construct.

```powershell
<# Basic information about try-catch:
The code whose errors should be caught goes in the try block.
It is best to keep the try block as small as possible, so roughly one or two commands that belong together. Not the whole script.
#>

try {
    This-Command-does-not-exist
} catch {}
```

Normally, you would try to mitigate the error in the `catch` block. In other words, you would take some measures so that the error is less severe. But if your only goal is to prevent an error message from appearing, you can also leave the `catch` block empty. Ideally, of course, you combine that with suppressing the regular output.

```powershell
try {
    $null = This-Command-does-not-exist
} catch {}
```

## Suppressing all output

In some situations, there may be more output than just standard output or perhaps error messages as well. PowerShell has several additional output streams.

| Stream ID | Description | Available from | Write cmdlet |
| --------- | ----------- | ------------- | ------------ |
| 1 | **Success** stream | PowerShell 2.0 | `Write-Output` |
| 2 | **Error** stream | PowerShell 2.0 | `Write-Error` |
| 3 | **Warning** stream | PowerShell 2.0 | `Write-Warning` |
| 4 | **Verbose** stream | PowerShell 2.0 | `Write-Verbose` |
| 5 | **Debug** stream | PowerShell 2.0 | `Write-Debug` |
| 6 | **Information** stream | PowerShell 5.0 | `Write-Information` |
| n/a | **Progress** stream | PowerShell 2.0 | `Write-Progress` |

I do not want to go too deep into the individual output streams here. Check out the [video about PowerShell output streams on my YouTube channel](https://www.youtube.com/watch?v=tpzQA3F9O_s) if you want. Instead, I will briefly show you how to suppress all output streams.

Here is an example script that writes to different output streams:

```powershell
# Filename: Multi-Output-Example.ps1
function Get-MultipleOutputs {
    $DebugPreference = "Continue"
    $WarningPreference = "Continue"
    $VerbosePreference = "Continue"
    Write-Verbose "Preference variables set."
    Write-Debug "Hello from the debug stream :)"
    Write-Warning "Oh no, a warning! What should we do?"
    Write-Verbose "Example output completed..."
}

Get-MultipleOutputs
```

To prevent output from all streams, you can append `*>$null` to the end of a line or command. This can be used for the following cases:

- A whole script: `./Multi-Output-Example.ps1 *>$null`
- A single command, such as a cmdlet: `Get-MultipleOutputs *>$null`
- And also for native commands, such as `.exe` programs that can be executed in the command line or PowerShell: `ping localhost *>$null`

## Closing words

Of course, it is often better to pay attention to the output of cmdlets and react to it in code. Nevertheless, there are cases where output is not necessary. If that happens to you, you now know how to suppress it.
