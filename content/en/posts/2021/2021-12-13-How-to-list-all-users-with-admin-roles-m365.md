---
comments: true
aliases:
    - how-to-list-all-users-with-admin-roles-m365
slug: How-to-list-all-users-with-admin-roles-m365
title: "List all Users with administrative roles in a Microsoft 365 environment"
date: 2021-12-13
tags: [azure ad, microsoft 365, powershell]
---

## Option 1: Use M365 Admin Portal

There is finally a way in the main Microsoft 365 Admin Portal. Go to ["Roles" -> "Role assignments"](https://admin.microsoft.com/Adminportal/Home?#/rbac/directory) and click on "Export admin list" to get a CSV file with all admins and their roles.

[![M365 Admin Center - role assignments](/images/2023/2023-12-06_Export_m365_admin_role_assignments.jpg "M365 Admin Center - role assignments")](/images/2023/2023-12-06_Export_m365_admin_role_assignments.jpg)

## Option 2: Use PowerShell / Azure AD Graph Module

Just a short PowerShell snippet to list all users with administrative roles in a Microsoft 365 (or Azure AD) environment. Please note that this uses the older Azure AD Graph Module (already planned for deprecation). I don't have an example code that uses the newer Microsoft Graph API **yet**.

### Prerequisites

You need the Azure AD PowerShell for Graph module installed, and you need to connect to your Azure AD tenant.

1. [Install the Azure AD PowerShell for Graph module (if you don't have it yet)](https://docs.microsoft.com/en-us/powershell/azure/active-directory/install-adv2?view=azureadps-2.0)
1. Connect to your tenant by executing `Connect-AzureAD`

### PowerShell Code to list all admins

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

### What this doesn't do

1. This snippet doesn't export which roles the users have
1. This snippet doesn't export App/Service Principals with admin roles

But that's all that I needed at this moment. Feel free to modify the code to your needs.
