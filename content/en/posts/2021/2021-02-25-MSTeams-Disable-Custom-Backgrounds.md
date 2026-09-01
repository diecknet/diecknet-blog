---
comments: true
aliases:
    - msteams-disable-custom-backgrounds
slug: MSTeams-Disable-Custom-Backgrounds
title: "Microsoft Teams: Disable Custom Backgrounds"
subtitle: "Prevent unwanted Teams camera backgrounds"
date: 2021-02-25
tags: [microsoft365, office365, microsoftteams, powershell]
cover:
    image: /images/2021/2021-02-25_TeamsMeetingPolicy_new.png
---

After Microsoft introduced virtual backgrounds for MS Teams meetings, I saw some interesting background images in meetings. Nevertheless, I do not think it is necessary to prohibit the free selection of backgrounds. Since this is handled differently by different companies, I describe the configuration options here. The meeting policy can be used to restrict the background selection.

## Configuration options

The option "VideoFiltersMode" can currently only be set via PowerShell, not via the Teams Admin Center. The following configuration options exist:

| Option name                   | Background blur | Default backgrounds | Custom backgrounds |
| ----------------------------- | ------------------------- | --------------------- | ------------------- |
| **NoFilters**                 | ❌ No                   | ❌ No               | ❌ No             |
| **BlurOnly**                  | ✅ Yes                     | ❌ No               | ❌ No             |
| **BlurandDefaultBackgrounds** | ✅ Yes                     | ✅ Yes                 | ❌ No             |
| **AllFilters** (default)     | ✅ Yes                     | ✅ Yes                 | ✅ Yes               |

By default, the **AllFilters** option is enabled for all users. If needed, several Teams meeting policies can be used to allow different background options for different users.

## Prerequisites

-   Administrator rights for Teams in the tenant
-   [Microsoft Teams PowerShell module](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install) (TL;DR `Install-Module MicrosoftTeams`)
-   Optional: if the current Teams PowerShell module version is not installed, you may also need the Skype for Business Online PowerShell module

## Connect to Microsoft Teams PowerShell Online

First, we must connect to the Microsoft Teams service via PowerShell:

```powershell
Connect-MicrosoftTeams
$session=New-CsOnlineSession
Import-PSSession $session
```

## Retrieve the policies

To check which meeting policies are currently configured, run the following command:

```powershell
Get-CsTeamsMeetingPolicy | ft Identity,Description,VideoFiltersMode
```

Because no new policies were defined in my case, we will adjust the default policy "Global".

## Adjust the policy

If you want to adjust a different policy instead of "Global", you must change the `-Identity` parameter.

```powershell
Set-CsTeamsMeetingPolicy -Identity Global -VideoFiltersMode BlurandDefaultBackgrounds
```

## Bonus tip: Teams PowerShell for Delegated Access Permission (DAP)

As a Microsoft Cloud Solution Provider (CSP) partner, this configuration can also be performed via the delegated permission "Administer On Behalf Of (AOBO)". To do this, the name of the customer tenant must be provided when connecting to the online services. Then you can sign in with the authorized user account from the Microsoft partner tenant. Of course, the placeholder `<TenantName>` must be replaced by the correct name of the customer tenant.

```powershell
Connect-MicrosoftTeams -TenantId <TenantName>.onmicrosoft.com
$session=New-CsOnlineSession -OverrideAdminDomain <TenantName>.onmicrosoft.com
Import-PSSession $session
```

## Further Reading

-   [Microsoft Teams PowerShell module](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install)
-   [Meeting policy settings - Video filters mode](https://docs.microsoft.com/en-us/microsoftteams/meeting-policies-in-teams#meeting-policy-settings---video-filters-mode)
