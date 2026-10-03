---
slug: "automatedlab-basics"
title: "Set Up a Test Environment Automatically with AutomatedLab"
date: 2026-10-03
tags: [powershell, windows]
---

If you often need a test environment, for example to try something out in an Active Directory environment, you don't have to set it up manually. With AutomatedLab, you can simply define a test environment and set it up automatically. AutomatedLab is a free PowerShell module.

I also demonstrate the module [in this video on YouTube](https://youtu.be/v4yjIMkQ4aI).

## Installation

The module should also work on Linux and macOS, but so far I've only used it on Windows.

You can find installation instructions in the official documentation: <https://automatedlab.org/en/latest/Wiki/Basic/install/>

However, I ran the following:

```powershell
Install-Module AutomatedLab -SkipPublisherCheck
Enable-LabHostRemoting -Force
New-LabSourcesFolder -DriveLetter C
```

## ISO Files for the Lab Environment

Inside the "LabSources" folder, there is an "ISOs" folder. The ISO files for automatically installing the operating systems must be placed there.

If you don't have any ISOs handy, you can also download free evaluation copies of Windows 11 or Windows Server from Microsoft: <https://www.microsoft.com/en-us/evalcenter>

You can then use PowerShell to check if the ISOs are recognized correctly:

```powershell
Get-LabAvailableOperatingSystem
```

[![Example output from Get-LabAvailableOperatingSystem, showing Windows Server 2025 and Windows 11 in various editions](/images/2026/2026-10-03-GetLabAvailableOperatingSystem.jpg "Example output from Get-LabAvailableOperatingSystem, showing Windows Server 2025 and Windows 11 in various editions")](/images/2026/2026-10-03-GetLabAvailableOperatingSystem.jpg)

## Define and Set Up the Lab

Here is an example of a simple test environment. If you don't define a password, `Somepass1` will be used as the default password.

To improve readability, I supplied the parameter values using [hashtables and splatting](/en/2024/05/15/powershell-multiline-commands/#splatting). Of course, you can also use the standard `-ParameterName "ParameterValue"` syntax if you prefer.

```powershell
#MyLab.ps1
New-LabDefinition -Name Demotenant -DefaultVirtualizationEngine HyperV

$Domain = @{
    DomainName = "ad.demotenant.de"
}

$DC1 = @{
    Name = "DC1"
    Memory = 4GB
    OperatingSystem = "Windows Server 2025 Standard (Desktop Experience)"
    Roles = "RootDC"
}
Add-LabMachineDefinition @DC1 @Domain

$Server1 = @{
    Name = "Server1"
    Memory = 4GB
    OperatingSystem = "Windows Server 2025 Standard (Desktop Experience)"
}
Add-LabMachineDefinition @Server1 @Domain

$Client1 = @{
    Name = "Client1"
    Memory = 4GB
    OperatingSystem = "Windows 11 Pro"
}
Add-LabMachineDefinition @Client1 @Domain

Install-Lab

Show-LabDeploymentSummary
```

I saved the script as `MyLab.ps1`. One important thing: the script must be run with administrator privileges so it can interact with Hyper-V. You can either start VS Code (or the PowerShell ISE) with administrator privileges, or open a separate PowerShell window with administrator privileges.

```powershell
# must be run with administrator privileges!
.\MyLab.ps1
```

This takes a little while, depending on your system and the lab machines you selected. At the end, you'll see a summary. If everything completed successfully, you can now use the environment.

## Delete the Lab

When you're done with your tests, you can simply delete the environment. If you closed your PowerShell window in the meantime, you can import the lab into the session again with `Import-Lab Demotenant` (use your lab name instead of "Demotenant").

To delete it, simply run `Remove-Lab`.

## More Possibilities and Options

AutomatedLab can do much more, for example, install Microsoft SQL Server or set up multiple AD domains and connect them with trusts. You can also control the IP range used, passwords, and much more. For more information [check out the documentation](https://automatedlab.org/en/latest/).
