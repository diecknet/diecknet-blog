---
slug: Azure-AD-Connect-Staging-mode-PowerShell
title: "Set Azure AD Connect Staging Mode via PowerShell"
date: 2022-07-21
contenttags: [azure ad, powershell, azure ad connect]
image: /images/2022/2022-07-21_Azure-AD-Connect-Staging-mode-is-enabled.png
---

Here's a quick tip on howto enable or disable the Staging Mode in Azure AD Connect via PowerShell. Sadly there is no native Cmdlet in the style of `Set-ADSyncStagingMode` or something like that.

In this article I'll first explain the approach and then later on list the full command block you can use. So feel free to skip below to the end of the post. The following PowerShell Cmdlets have to get executed on the Azure AD Connect Server.

**Execute these commands on your own risk.**

## List current Azure AD Connect Staging mode setting

First of all we can retrieve the current Azure AD Connect Settings using `Get-ADSyncGlobalSettings`.

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
$aadSyncSettings
```

[![Screenshot of PowerShell Code Execution - Retrieve Azure AD Connect Settings](/images/2022/2022-07-21_AAD-Connect-Settings-Overview-PowerShell.png "Screenshot of PowerShell Code Execution - Retrieve Azure AD Connect Settings")](/images/2022/2022-07-21_AAD-Connect-Settings-Overview-PowerShell.png)

## Investigate the Parameters of the ADSyncGlobalSettings Object

So the interesting stuff is hidden in the "parameters"-property. The settings regarding the Staging Mode lays in "Microsoft.Synchronize.StagingMode".

```powershell
$aadSyncSettings.parameters
```

[![Screenshot of PowerShell Code Execution - Found the Staging mode](/images/2022/2022-07-21_AzureAD-Connect-Staging-Mode-spotted-PowerShell.png "Screenshot of PowerShell Code Execution - Found the Staging mode")](/images/2022/2022-07-21_AzureAD-Connect-Staging-Mode-spotted-PowerShell.png)

## Change the Staging Mode

To configure the Staging Mode we need to set "Microsoft.Synchronize.StagingMode" to either "True" (enable Staging mode) or "False" (disable Staging mode).

```powershell
# to disable AAD Connect Staging mode
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="False"
```

```powershell
# to enable AAD Connect Staging mode
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="True"
```

## Actually SET the Staging Mode

Haha, yes. We're not done yet. As of right now, we only have a PowerShell Object ("Microsoft.IdentityManagement.PowerShell.ObjectModel.GlobalSettings") representing the Azure AD Connect settings. And changing that Object doesn't change the actual configuration of Azure AD Connect. So we have to set the actual configuration to our modified Settings Object.

```powershell
Set-ADSyncGlobalSettings $aadSyncSettings
```

[![Screenshot of PowerShell Code Execution - Changing and setting the Staging mode](/images/2022/2022-07-21_AzureAD-Connect-Staging-mode-set-by-powershell.png "Screenshot of PowerShell Code Execution - Changing and setting the Staging mode")](/images/2022/2022-07-21_AzureAD-Connect-Staging-mode-set-by-powershell.png)

Afterwards I verified in the GUI (Azure AD Connect Wizard) for the desired result. In my case the Staging Mode was enabled now. Awesome!

[![Verification of Azure AD Connect Staging Mode in the Wizard](/images/2022/2022-07-21_Azure-AD-Connect-Staging-mode-is-enabled.png "Verification of Azure AD Connect Staging Mode in the Wizard")](/images/2022/2022-07-21_Azure-AD-Connect-Staging-mode-is-enabled.png)

## Summary - Full Code Snippets

After we gathered all these informations, we can create our own short PowerShell Code Snippets to check/enable/disable the Azure AD Connect Staging mode.

### Snippet to check for Azure AD Connect Staging Mode

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value
# output "False" means Staging mode is disabled
# output "True" means Staging mode is enabled
```

### Snippet to Disable Azure AD Connect Staging Mode

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="False"
Set-ADSyncGlobalSettings $aadSyncSettings
```

### Snippet to Enable Azure AD Connect Staging Mode

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="True"
Set-ADSyncGlobalSettings $aadSyncSettings
```

