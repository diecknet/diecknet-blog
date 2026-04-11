---
slug: "powershell-find-process-listening-port"
title: "Find out which Process is listening on a Port using PowerShell"
date: 2026-04-14
tags: [powershell, windows]
cover: 
    image: "/images/2026/2026-04-14_Get-NetTCPConnection.jpg"
---

If you want to find out which process is listening on a specific TCP/UDP port, you can also use PowerShell for this in Windows. I find this easier than analyzing the output of `netstat`.

I also show this [in a Video on YouTube](https://youtu.be/SGvbBbsIpjw).

## For TCP: Get-NetTCPConnection

For TCP connections, there is the `Get-NetTCPConnection` cmdlet. However, it only returns the ID of the running process (the `OwningProcess` property), but we can resolve that using `Get-Process`. Manually, you would do it like this:

```powershell
Get-NetTCPConnection -LocalPort 1337

# Example Output
# LocalAddress                        LocalPort RemoteAddress                       RemotePort State       AppliedSetting OwningProcess
# ------------                        --------- -------------                       ---------- -----       -------------- -------------
# 0.0.0.0                             1337      0.0.0.0                             0          Listen                     1712 

Get-Process -Id 1712
```

But you can cleverly combine PowerShell cmdlets to turn them into a one-liner. Of course, there are various ways to shorten the code or customize it. Here are a few examples that all essentially do the same thing, but in different ways.

```powershell
# With brackets
Get-Process -Id (Get-NetTCPConnection -LocalPort 1337).OwningProcess

# Using the pipe (% is an Alias for ForEach-Object)
Get-NetTCPConnection -LocalPort 1337 | % { Get-Process -Id $_.OwningProcess }

# Shortened variant
ps -Id (Get-NetTCPConnection -localp 135).OwningProcess
```

The return value is a `[System.Diagnostics.Process]` object with various properties. At first glance, `ProcessName` is the most interesting.

[![Example for Get-NetTCPConnection](/images/2026/2026-04-14_Get-NetTCPConnection.jpg "Example for Get-NetTCPConnection")](/images/2026/2026-04-14_Get-NetTCPConnection.jpg)

However, you can also retrieve more information about the program on the hard drive by running `Get-Process` with the `-FileVersionInfo` parameter. This returns a `[System.Diagnostics.FileVersionInfo]` object instead.

```powershell
Get-Process -FileVersionInfo -Id (Get-NetTCPConnection -LocalPort 1337).OwningProcess

# Example output
# ProductVersion   FileVersion      FileName
# --------------   -----------      --------
# 1.3.3.7          1.3.3.7          C:\Example\SomeExample.exe
```

## For UDP: Get-NetUDPEndpoint

A different cmdlet is required for UDP: `Get-NetUDPEndpoint`  
In the standard output, the `OwningProcess` property isn't shown for me, but it still exists.

```powershell
Get-NetUdpEndpoint -LocalPort 31337

# Example output
# LocalAddress                             LocalPort
# ------------                             ---------
# 0.0.0.0                                  31337
```

I’ll spare us the two-step manual query; instead, here are again a few more options for one-liners:

```powershell
# With brackets
Get-Process -Id (Get-NetUDPEndpoint -LocalPort 31337).OwningProcess

# Using the pipe (% is an Alias for ForEach-Object)
Get-NetUDPEndpoint -LocalPort 31337 | % { Get-Process -Id $_.OwningProcess }

# Shortened variant
ps -Id (Get-NetUDPEndpoint -localp 31337).OwningProcess
```

As with the examples for TCP, `Get-Process` returns a `[System.Diagnostics.Process]` object for the process.

[![Example for Get-NetUDPEndpoint](/images/2026/2026-04-14_Get-NetUDPEndpoint.jpg "Example for Get-NetUDPEndpoint")](/images/2026/2026-04-14_Get-NetUDPEndpoint.jpg)

Once again you can add the `-FileVersionInfo` parameter to `Get-Process` to see the full path on the hard drive and other infos.

```powershell
Get-Process -FileVersionInfo -Id (Get-NetUDPEndpoint -LocalPort 31337).OwningProcess

# Example output
# ProductVersion   FileVersion      FileName
# --------------   -----------      --------
# 1.3.3.7          1.3.3.7          C:\Example\SomeOtherExample.exe
```
