---
aliases:
    - exchange-online-per-azure-automation
slug: Exchange-Online-per-Azure-Automation
title: "Exchange Online per Azure Automation steuern im Jahr 2024"
date: 2023-01-09
lastmod: 2024-06-25
tags: [microsoft365, office365, exchangeonline, powershell, exo, azure, azureautomation]
cover:
    image: /images/2023/2023-AA-EXO.jpg
comments: true    
---

Wenn ihr Exchange Online per Azure Automation steuern wollt, dann ist **Managed Identities** was ihr benutzen solltet (diese Aussage wurde zuletzt geprüft im Juni 2024).

## Legacy Ansatz

Früher wurden dafür auch gerne RunAs Accounts oder Plaintext Credentials (🤢) verwendet, aber das gilt mittlerweile als veraltet. RunAs Accounts sind zum Herbst 2023 abgekündigt und zu Klartext-Kennwörtern muss ich nix sagen, oder?
Eventuell bieten sich noch App Registrierungen in Entra ID an, aber wenn ihr wirklich einfach nur per Azure Automation ein paar Exchange Online Einstellungen automatisieren wollt, ist das eigentlich nicht notwendig.

## Managed Identities + Exchange Online PowerShell

Eine **System Assigned Managed Identity** weist einer Azure Resource eine *Identität* zu. Dieser Identität können Rechte zugewiesen werden, z.B. für die Administration von Exchange Online oder bestimmten Azure Ressourcen. Die Verwaltung der Identität erfolgt automatisch, es muss also kein Passwort regelmäßig geändert werden oder ähnliches. Und wenn die dazugehörige Ressource (in dem Fall das Azure Automation Konto) gelöscht wird, wird die System Assigned Managed Identity automatisch mitgelöscht.
Das Exchange Online PowerShell Modul unterstützt ab Version 3 Managed Identities für die Authentifizierung.

Theoretisch sollte das ganze auch mit einer User Assigned Managed Identities funktionieren. Dabei wird die Managed Identity selbst erzeugt und kann dann mehreren Azure Ressourcen zugewiesen werden. Für manche Szenarien sicher auch praktisch.

### Managed Identity aktivieren

Ich bevorzuge es System Assigned Managed Identities zu verwenden, da so effektiv nur eine Ressource die Rechte erhält. Ihr könnt im Automation Account unter "Account Settings" -> "Identity" prüfen, ob eine Managed Identity verwendet wird. Hier ein Beispiel-Screenshot mit einer vorhandenen Managed Identity: Der Status steht auf "On" und es wird eine Object ID aufgeführt.

[![Beispiel für einen Azure Automation Account mit einer System Assigned Managed Identity](/images/2024/2024-06-21_AutomationAccount-Managed-Identity.jpg "Beispiel für einen Azure Automation Account mit einer System Assigned Managed Identity")](/images/2024/2024-06-21_AutomationAccount-Managed-Identity.jpg)

Die Zuweisung der "Exchange Administrator"-Rolle an die Managed Identity erfolgt dann anschließend per [PowerShell/Graph API](#konfiguration-per-powershell).

### Konfiguration per PowerShell

In diesem Abschnitt wird beschrieben, wie ihr die Konfiguration per PowerShell durchführen könnt. Die Zuweisung der "Exchange Administrator"-Rolle an eine Managed Identity erfolgt einmalig per **lokaler** PowerShell - der nachfolgende Code wird also nicht in Azure Automation als Runbook ausgeführt.

Voraussetzungen:

- Das Microsoft.Graph PowerShell Modul
- Ein Benutzeraccount mit der Admin-Rolle "Privileged Role Administrator" oder "Globaler Administrator"

Falls ihr das Modul noch nicht installiert habt, könnt ihr es wie folgt installieren ([mehr Infos hier](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0)):

```powershell
Install-Module Microsoft.Graph
```

Anschließend könnt ihr den nachfolgenden Code verwenden. Der Code ist inline kommentiert, also erkläre ich jetzt hier nichts weiter.

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

### Modul hinzufügen

Egal ob ihr bereits "Runtime Environments" verwendet, oder noch die "Old experience", ihr müsst das ExchangeOnlineManagement PowerShell Modul hinzufügen. Im Falle der "Old experience" zum gesamten Automation Account. Wenn ihr Runtime Environments verwendet, dann fügt das Modul stattdessen zu einem Runtime Environment hinzu bzw. legt ein neues Runtime Environment an. Das Modul wird sowohl von Windows PowerShell, als auch PowerShell 7 unterstützt.

### Exchange Online PowerShell verwenden

Folgender Beispiel Code für ein Runbook verbindet sich als System Managed Managed Identity mit der Exchange Online Verwaltung, führt einen Exchange Online PowerShell Befehl aus und trennt dann die Verbindung zu Exchange Online wieder.

```powershell
# Replace the Organization name with a domain from your tenant
Connect-ExchangeOnline -ManagedIdentity -Organization demotenant.de

# Example command that uses Exchange Online PowerShell: List all mailboxes
Get-ExoMailbox

# Disconnect again to free up connections
Disconnect-ExchangeOnline -Confirm:$false
```

## How-to Video

Ich habe auch ein [Video](https://www.youtube.com/watch?v=unXf7ma1NR4) erstellt, in dem zeige wie Exchange Online per Azure Automation gesteuert werden kann. Dabei wird eine System Assigned Managed Identity für das Azure Automation Konto verwendet und dieser Identität die Rechte zur Exchange Verwaltung zugewiesen.

[![Exchange Online per Azure Automation verwalten (YouTube)](/images/2023/2023-01-09_Azure_Automation_Exchange_online_thumbnail.png "Exchange Online per Azure Automation verwalten (YouTube)")](https://www.youtube.com/watch?v=unXf7ma1NR4)

## Weiterführende Links

Die offizielle Microsoft Dokumentation dazu ist hier zu finden: [https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps](https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps)
