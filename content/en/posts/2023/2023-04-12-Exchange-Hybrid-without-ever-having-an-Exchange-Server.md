---
slug: "managing-synchronized-exchange-objects-without-an-exchange-server"
title: "Managing synchronized Exchange objects without an Exchange Server"
date: 2023-04-12
comments: true
tags: [Hybrid, Exchange, Azure AD Connect, Exchange Server, AAD, Azure Active Directory, Active Directory]
cover: 
    image: "/images/2023/2023-04-12-Exchange-YouTube-Thumbnail.jpg"
---

It has been possible for some time to use the Exchange Server management tools without a full Exchange Server.
Most guides assume that at least one Exchange Server already existed and was then removed. And the [Microsoft documentation only briefly mentions the topic][mshybridemt] and does not really explain it.

In this post I look at a scenario that affects many smaller companies:
In the Microsoft 365 Admin Center it says:

> This user is synchronized with your on-premises Active Directory. Some details can only be edited through your on-premises Active Directory.

**But how can the configuration be done through the local Active Directory?**

## Video on the topic

I also created a [video][video] on the topic:
[![Video Thumbnail "Manage synchronized users anyway"](/images/2023/2023-04-12-Exchange-YouTube-Thumbnail-player.jpg)][video]

## Cause

The cause lies in Azure AD Connect. Due to the architecture of directory synchronization between on-premises Windows Server Active Directory and Azure Active Directory, it is defined that the user attributes come from on-premises. Changes can therefore only be made at the source, which means in the local AD.
However, managing Exchange-related attributes, such as the email address, is only supported through the Exchange management tools. So the Exchange Management Tools must be installed locally. And in order for the attributes to exist on the user objects at all, the Exchange schema extensions are required.

## Installing the Exchange management tools and schema extensions

If there has never been an Exchange Server or an Exchange organization in Active Directory, the Exchange schema extensions can still be installed in AD. A full Exchange Server does not need to be installed for this.

### Prerequisites

You need a computer on which the Exchange management tools can be installed.

Permissions:

- Domain administrator rights are required for the initial setup
- Optionally, later administration of Exchange recipients can also be delegated to members of a security group

Operating system:

- Windows Server 2022 (preferred, this is what I tested with)
- Windows Server 2019

Other components:

- [.NET Framework 4.8][net48] (already preinstalled on Windows Server 2022)
- [Visual C++ 2012 Runtime][cplusplus2012]
- And of course you need to download and mount the [latest Exchange Server 2019 CU][ex2019download]

### Setup Wizard GUI

1. Start the `setup.exe` from the Exchange installation media
2. In the step "Server role selection", enable the following options:
    - [x] Management tools
    - [x] Automatically install the required Windows Server roles and features for Exchange Server installation
3. If there is really no Exchange organization yet, the page "Exchange organization" appears after the page "Space and installation location". Enter any name for the Exchange organization here. I usually use "diecknet-ORG".
![Exchange organization configured in the Setup Wizard](/images/2023/2023-04-12-Exchange-ORG-GUI.jpg)
4. On the "Readiness check" page, you are informed that the Exchange organization will now be created with `Setup /PrepareAD`.
5. After the Setup Wizard has finished, the computer must be restarted once.
6. After restarting the server:
    - From the Microsoft 365 Admin Center, under "Settings" -> "Domains", look up the `.onmicrosoft.com` domain of the tenant. In my case it is, for example, "yr2z8.onmicrosoft.com"
    ![Check the onmicrosoft.com domain in the tenant under Settings - Domains](/images/2023/2023-04-12-Exchange-Tenant-onmicrosoft.com-Domain.jpg)
    - Append this onmicrosoft.com domain name: insert the addition `.mail` between the tenant name and `.onmicrosoft.com` (so it becomes `<tenant name>.mail.onmicrosoft.com`). For example, in my case `yr2z8.onmicrosoft.com` becomes `yr2z8.mail.onmicrosoft.com`.
    - Start an administrative PowerShell session and run the following commands. Replace the domain with your own domain that you just looked up.

        ```powershell
        Add-PSSnapin Microsoft.Exchange.Management.PowerShell.SnapIn
        # Use your own .onmicrosoft.com domain of the tenant here!
        New-RemoteDomain -Name "yr2z8.mail.onmicrosoft.com" -DomainName "yr2z8.mail.onmicrosoft.com"
        Set-RemoteDomain "yr2z8.mail.onmicrosoft.com" -TargetDeliveryDomain $true
        ```

        ![Create the onmicrosoft.com domain as a target delivery domain in the on-premises environment](/images/2023/2023-04-12-Exchange-RemoteDomain.jpg)
    - **Close the PowerShell window.** The `Microsoft.Exchange.Management.PowerShell.SnapIn` is only supported in this configuration for creating the RemoteDomain/TargetDeliveryDomain.
7. Optional: Assign permissions to non-domain admins
    - Start a new administrative PowerShell session and run the following commands.

        ```powershell
        Add-PSSnapin *RecipientManagement
        $env:ExchangeInstallPath\Scripts\Add-PermissionForEMT.ps1
        ```

    - After that, the users who should also be able to manage Exchange recipients can be added to the security group "Exchange Recipient Management EMT".

## Managing Exchange attributes

If Exchange attributes need to be adjusted now, the RecipientManagement PowerShell snap-in must be loaded first. After that, the corresponding PowerShell cmdlets can be used. For example, `New-RemoteMailbox` or `Set-RemoteMailbox`.

```powershell
# Load the snap-in
Add-PSSnapin *RecipientManagement
# Manage Exchange, for example
Get-RemoteMailbox
```

## Tips

- 🏁 It would also be possible to perform the Exchange installation including schema extension via [command line/unattended install options][unattendedInstall]:

    ```cmd
    setup.exe /IAcceptExchangeServerLicenseTerms_DiagnosticDataON /OrganizationName:"diecknet-ORG" /Mode:Install /Roles:ManagementTools /InstallWindowsComponents
    ```

- You can list all available cmdlets like this:

    ```powershell
    Add-PSSnapin *RecipientManagement
    Get-Command -Module *RecipientManagement
    ```

- To make it easier to get to Exchange recipient management, you can create a desktop shortcut with the target `powershell.exe -NoExit -Command "Add-Snapin *RecipientManagement"`. It is best to set it via right-click on the shortcut so that the command runs directly in `C:\` (or any other location). Otherwise it will run in the PowerShell program folder and take up a lot of visible space in the shell 😛.
![Adjust the Exchange EMT shortcut so it runs in C:\](/images/2023/2023-04-12-Exchange-Recipient-Management-Shortcut.jpg)

[cplusplus2012]: https://www.microsoft.com/download/details.aspx?id=30679  "Download: Visual C++ Redistributable for Visual Studio 2012"
[net48]: https://go.microsoft.com/fwlink/?linkid=2088631  "Download .NET Framework 4.8"
[ex2019download]: https://learn.microsoft.com/en-us/exchange/new-features/updates?view=exchserver-2019  "Download Exchange Server 2019 CUs"
[video]: https://youtu.be/aDqBk6O0f-0
[unattendedInstall]: https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deploy-new-installations/unattended-installs?view=exchserver-2019  "Use unattended mode in Exchange Setup"
[mshybridemt]: https://learn.microsoft.com/en-us/exchange/manage-hybrid-exchange-recipients-with-management-tools  "Manage recipients in Exchange Hybrid environments using Management tools"
