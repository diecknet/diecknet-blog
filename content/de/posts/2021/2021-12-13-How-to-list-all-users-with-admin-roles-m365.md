---
comments: true
aliases:
    - how-to-list-all-users-with-admin-roles-m365
slug: How-to-list-all-users-with-admin-roles-m365
title: "Alle Benutzer mit administrativen Rollen in einer Microsoft-365-Umgebung auflisten"
date: 2021-12-13
tags: [azure ad, microsoft 365, powershell]
---

## Option 1: M365 Admin Portal verwenden

Im Microsoft-365-Admin-Portal gab es endlich einen Weg. Geht zu ["Roles" -> "Role assignments"](https://admin.microsoft.com/Adminportal/Home?#/rbac/directory) und klickt auf "Export admin list", um eine CSV-Datei mit allen Admins und ihren Rollen zu erhalten.

[![M365 Admin Center - Rollenzuweisungen](/images/2023/2023-12-06_Export_m365_admin_role_assignments.jpg "M365 Admin Center - Rollenzuweisungen")](/images/2023/2023-12-06_Export_m365_admin_role_assignments.jpg)

## Option 2: PowerShell / Azure AD Graph Module verwenden

Nur ein kurzes PowerShell-Snippet, um alle Benutzer mit administrativen Rollen in einer Microsoft-365- (oder Azure-AD-) Umgebung aufzulisten. Bitte beachte, dass hier das ältere Azure-AD-Graph-Modul verwendet wurde (die Abkündigung war bereits geplant). Ein Beispiel mit der neueren Microsoft Graph API hatte ich **noch nicht**.

### Voraussetzungen

Ihr habt das Azure-AD-PowerShell-for-Graph-Modul installiert und euch mit eurem Azure-AD-Tenant verbunden.

1. [Install the Azure AD PowerShell for Graph module (if you don't have it yet)](https://docs.microsoft.com/en-us/powershell/azure/active-directory/install-adv2?view=azureadps-2.0)
1. Mit `Connect-AzureAD` mit eurem Tenant verbinden

### PowerShell-Code, um alle Admins aufzulisten

Lest das folgende Snippet, stellt sicher, dass es nicht bösartig oder unsinnig ist, und führt es dann aus. Das Skript schreibt einen CSV-Export nach `C:\temp\AAD_Admins.csv`.

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

### Was das nicht gemacht hat

1. Dieses Snippet hat nicht exportiert, welche Rollen die Benutzer hatten
1. Dieses Snippet hat keine App-/Service-Principals mit Adminrollen exportiert

Aber genau das habe ich in dem Moment gebraucht. Passt den Code gern an eure Anforderungen an.
