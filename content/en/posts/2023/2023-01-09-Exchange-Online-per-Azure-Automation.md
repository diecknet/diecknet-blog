---
aliases:
    - exchange-online-per-azure-automation
slug: Exchange-Online-per-Azure-Automation
title: "Automate Exchange Online with Azure Automation in 2024"
date: 2023-01-09
lastmod: 2024-06-25
tags: [microsoft365, office365, exchangeonline, powershell, exo, azure, azureautomation]
cover:
    image: /images/2023/2023-AA-EXO.jpg
comments: true
---

If you want to manage Exchange Online via Azure Automation, **Managed Identities** is what you should use (this statement was last checked in June 2024).

## Legacy approach

In the past, RunAs Accounts or Plaintext Credentials (🤢) were also commonly used for this purpose, but this is now considered deprecated. RunAs accounts will be  discontinued by fall 2023. And I don't have to say anything about plaintext passwords, do I?
You could still use App Registrations in Entra ID, but if you really just want to automate some Exchange settings via Azure Automation, it's not really necessary.

## Managed Identities + Exchange Online PowerShell

A **System Assigned Managed Identity** assigns an *identity* to an Azure Resource. This identity can be assigned rights, e.g. for the administration of Exchange Online or specific Azure Resources. The management of the identity is done automatically, so there is no need to change a password regularly or anything like that. And if the associated resource (in this case the Azure Automation account) is deleted, the System Assigned Managed Identity is automatically deleted as well.
The Exchange Online PowerShell module supports Managed Identities for authentication starting with version 3.

That should theoretically also work with a User Assigned Managed Identity. In that case you'll create the Managed Identity yourself, but you can assign it to multiple Azure resources. Also useful for some scenarios.

### Enable Managed Identity

I prefer System Assigned Managed Identities, because then only one resource gets the rights. You can check if the Automation Account has a Managed Identity under "Account settings" -> "Identity". Here is a example screenshot with an existing Managed Identity: The status is "On" und an Object ID is shown.

[![Example for an Azure Automation Account with a System Assigned Managed Identity](/images/2024/2024-06-21_AutomationAccount-Managed-Identity.jpg "Example for an Azure Automation Account with a System Assigned Managed Identity")](/images/2024/2024-06-21_AutomationAccount-Managed-Identity.jpg)

The actual assignment of the "Exchange Administrator"-role is done via [PowerShell/Graph API](#configuration-via-powershell).

## Configuration via PowerShell

In this section I'll describe how to configure the permissions using PowerShell. The assignment of the "Exchange Administrator"-role to a Managed Identity needs to be done using a local PowerShell session - the following code shouldn't be run as an Azure Automation runbook.

Prerequisites:

- The Microsoft.Graph PowerShell module
- A user account with the admin role "Privileged Role Administrator" or "Global Administrator"

If you don't have the module installed yet, [check this article](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0).

```powershell
Install-Module Microsoft.Graph
```

Then you can use the following code. The code is commented inline, so I don't explain it here further.


```powershell
Connect-MgGraph -Scopes AppRoleAssignment.ReadWrite.All,Application.Read.All,RoleManagement.ReadWrite.Directory

# Put your Managed Identity / Enterprise App registration name here:
$MI_Name = "Mein-Automation-Account" 

# there is no need to change any of the code below

$MI_SP = Get-MgServicePrincipal -Property "displayName,appId,id" -Filter "servicePrincipalType eq 'ManagedIdentity' and DisplayName eq '$($MI_Name)'" -ErrorAction Stop
if($MI_SP.Count -ne 1) {
    Write-Error "Something is wrong, found $($MI_SP.Count) matching Entra Service Principals. Aborting..."
    exit 1
} else {
    $MI_ID = $MI_SP.Id
}

# try to retrieve the Exchange Online Service Principal (sometimes it's not available)
$EXO_SP = Get-MgServicePrincipal -Filter "AppId eq '00000002-0000-0ff1-ce00-000000000000'"
if(!$EXO_SP) {
    Write-Error "No Exchange Online Service Principal found. Check this for troubleshooting: https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps#what-to-do-if-the-office-365-exchange-online-resource-is-not-available-in-microsoft-entra-id"
    exit 1
    # we can't proceed without the EXO_SP
}

# Exchange.ManageAsApp API Permission
$AppRoleId = "dc50a0fb-09a3-484d-be87-e023b12c6440" 

# the GUID value of the Office 365 Exchange Online resource in Microsoft Entra ID. The AppId value is the same in every organization, but the Id value is different in every organization.
$ResourceID = $EXO_SP.Id 

# the actual assignment of Exchange.ManageAsApp:
New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $MI_ID -PrincipalId $MI_ID -AppRoleId $AppRoleID -ResourceId $ResourceID

$ExchangeAdminRoleID = (Get-MgRoleManagementDirectoryRoleDefinition -Filter "DisplayName eq 'Exchange Administrator'").Id
# the actual assignment of the Exchange Administrator role:
New-MgRoleManagementDirectoryRoleAssignment -PrincipalId $MI_ID -RoleDefinitionId $ExchangeAdminRoleID -DirectoryScopeId "/"
```

### Add the module

Regardless of whether you are already using "Runtime Environments" or the "Old experience", you must add the ExchangeOnlineManagement PowerShell module. In the case of the "Old experience" add it to the Automation account. If you are using Runtime Environments, then add the module to a Runtime Environment instead or create a new Runtime Environment. The module is supported by both Windows PowerShell and PowerShell 7.

### Use Exchange Online PowerShell

The following example code for a runbook connects to the Exchange Online administration as a System Managed Managed Identity, executes an Exchange Online PowerShell command and then disconnects from Exchange Online again.

```powershell
# Replace the Organization name with a domain from your tenant
Connect-ExchangeOnline -ManagedIdentity -Organization demotenant.de

# Example command that uses Exchange Online PowerShell: List all mailboxes
Get-ExoMailbox

# Disconnect again to free up connections
Disconnect-ExchangeOnline -Confirm:$false
```

## Howto Video (German)

I created a [German Video](https://www.youtube.com/watch?v=unXf7ma1NR4) showing how Exchange Online can be controlled via Azure Automation. This involves using a System Assigned Managed Identity for the Azure Automation account and assigning Exchange management rights to this identity. You can probably use the automatic translated Subtitles on YouTube, if you don't speak German.

[![German Video: Manage Exchange Online via Azure Automation (YouTube)](/images/2023/2023-01-09_Azure_Automation_Exchange_online_thumbnail.png "German Video: Manage Exchange Online via Azure Automation (YouTube)")](https://www.youtube.com/watch?v=unXf7ma1NR4)

## Further links

The official Microsoft documentation for this can be found here: [https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps](https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps)
