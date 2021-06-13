---
title: "Microsoft Teams: Benutzerdefinierte Hintergründe deaktivieren"
subtitle: "Unerwünschte Teams Kamera-Hintergründe unterbinden"
lang: de
tags: [microsoft365, office365, microsoftteams, powershell]
image: "/img/2021/2021-02-25_TeamsMeetingPolicy_new.png"
---
![Konfiguration der Teams Global Meeting Policy](/img/2021/2021-02-25_TeamsMeetingPolicy_new.png "Konfiguration der Teams Global Meeting Policy")<br /><br />
Nachdem Microsoft virtuelle Hintergründe für MS Teams Besprechungen eingeführt hat, habe ich einige interessante Hintergrundbilder in Meetings gesehen. Trotzdem ist es meiner Meinung nach nicht notwendig, die freie Auswahl von Hintergründen zu verbieten. Da dies jedoch von Unternehmen zu Unternehmen unterschiedlich gehandhabt wird, beschreibe ich hier die Konfigurationsmöglichkeiten. Zur Einschränkung der Hintergrundauswahl kann eine Besprechungsrichtline verwendet werden.

## Möglichkeiten zur Konfiguration

Die Option "VideoFiltersMode" kann zur Zeit nur per PowerShell gesetzt werden - nicht per Teams Admin Center. Folgende Konfigurationsmöglichkeiten bestehen:

|Name der Option |Hintergrund Weichzeichnen |Standard Hintergründe |Eigene Hintergründe |
|---|---|---|---|
|**NoFilters**     |❌ Nein |❌ Nein |❌ Nein |
|**BlurOnly**     |✅ Ja |❌ Nein |❌ Nein |
|**BlurandDefaultBackgrounds**     |✅ Ja |✅ Ja |❌ Nein |
|**AllFilters** (Standardwert)    |✅ Ja |✅ Ja |✅ Ja |

Standardmäßig ist die Option **AllFilters** für alle Benutzer aktiviert. Bei Bedarf können mehrere Teams Besprechungsrichtlinien verwendet werden, um den Benutzern unterschiedliche Hintergrundoptionen zu erlauben.

## Voraussetzungen

- Administratorrechte für Teams im Tenant
- [Microsoft Teams PowerShell Modul](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install){:target="_blank" rel="noopener noreferrer"} (TL;DR ``` powershell Install-Module MicrosoftTeams```)
- optional: falls nicht die aktuelle Teams PowerShell Modulversion installiert ist, benötigt ihr *eventuell* noch das Skype for Business Online PowerShell Modul

## Mit Microsoft Teams PowerShell Online verbinden

Zunächst müssen wir uns per PowerShell mit dem Microsoft Teams Service verbinden:

``` powershell
Connect-MicrosoftTeams
$session=New-CsOnlineSession
Import-PSSession $session
```

## Abrufen der Richtlinien

Um zu überprüfen, welche Meeting Policies aktuell konfiguriert sind folgenden Befehl ausführen:

``` powershell
Get-CsTeamsMeetingPolicy | ft Identity,Description,VideoFiltersMode
```

Da in meinem Fall keine neuen Richtlinien definiert wurden, werden wir die default Policy "Global" anpassen.

## Anpassen der Richtlinie

Falls ihr eine andere Richtlinie anstatt "Global" anpassen möchtet, müsst ihr den Parameter ``` powershell -Identity``` anpassen.

``` powershell
Set-CsTeamsMeetingPolicy -Identity Global -VideoFiltersMode BlurandDefaultBackgrounds
```

## Bonus-Tipp: Teams PowerShell für Delegated Access Permission (DAP)

Als Microsoft Cloud Solution Provider (CSP) Partner kann diese Konfiguration auch per delegierter Berechtigung "Administer On Behalf Of (AOBO)" durchgeführt werden. Hierzu muss beim Verbinden mit den Onlineservices der Name des Kundentenants angegeben werden. Anschließend kann sich mit dem berechtigten Benutzerkonto aus dem Microsoft Partnertenant eingeloggt werden. Der Platzhalter ``` powershell <TenantName>``` muss natürlich ersetzt werden durch den richtigen Namen des **Kunden**tenants.

``` powershell
Connect-MicrosoftTeams -TenantId <TenantName>.onmicrosoft.com
$session=New-CsOnlineSession -OverrideAdminDomain <TenantName>.onmicrosoft.com
Import-PSSession $session
```

## Weiterführende Links

- [Microsoft Teams PowerShell Modul](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install){:target="_blank" rel="noopener noreferrer"}
- [Meeting policy settings - Video filters mode](https://docs.microsoft.com/en-us/microsoftteams/meeting-policies-in-teams#meeting-policy-settings---video-filters-mode){:target="_blank" rel="noopener noreferrer"}
