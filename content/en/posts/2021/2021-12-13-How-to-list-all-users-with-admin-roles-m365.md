---
aliases:
    - how-to-list-all-users-with-admin-roles-m365
slug: How-to-list-all-users-with-admin-roles-m365
title: "List all Users with administrative roles in a Microsoft 365 environment"
date: 2021-12-13
tags: [azure ad, microsoft 365, powershell]
---

Just a short PowerShell snippet to list all users with administrative roles in a Microsoft 365 (or Azure AD) environment. In the Admin Portals you can usually only list all the users with a specific role, not all users with **any admin role**.

## Prerequisites

You need the Azure AD PowerShell for Graph module installed, and you need to connect to your Azure AD tenant.

1. [Install the Azure AD PowerShell for Graph module (if you don't have it yet)](https://docs.microsoft.com/en-us/powershell/azure/active-directory/install-adv2?view=azureadps-2.0)
1. Connect to your tenant by executing `Connect-AzureAD`

## PowerShell Code to list all admins

Read the following snippet, make sure it's not malicious or stupid, then execute it. The script outputs a CSV export into `C:\temp\AAD_Admins.csv`.

```powershell
$AllRoleAssignments = ForEach ($Role in (Get-AzureADMSRoleDefinition)) {
    $RoleAssignment = Get-AzureADMSRoleAssignment -Filter "roleDefinitionId eq '$($Role.Id)'"
    if($RoleAssignment) {
        $User = Get-AzureADObjectByObjectId -ObjectIds $RoleAssignment.PrincipalId
        if($User.ObjectType -eq "User") {
            $User | Select-Object DisplayName,UserPrincipalName,ObjectType
        }
    }
}
$AllRoleAssignments | Sort-Object -Unique "UserPrincipalName" | Export-csv -Encoding utf8 -NoTypeInformation -Path C:\temp\AAD_Admins.csv
```

## What this doesn't do

1. This snippet doesn't export which roles the users have
1. This snippet doesn't export App/Service Principals with admin roles

But that's all that I needed at this moment. Feel free to modify the code to your needs.
