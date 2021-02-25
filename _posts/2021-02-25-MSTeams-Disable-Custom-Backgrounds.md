---
layout: post
title: "Microsoft Teams: Benutzerdefinierte Hintergründe deaktivieren"
subtitle: "Unseriöse Teams Kamera-Hintergründe unterbinden"
lang: de
tags: [microsoft365, office365, microsoftteams,powershell]
image: "/img/2021/2021-02-25_TeamsMeetingPolicy_new.png"
---
![Konfiguration der Teams Global Meeting Policy](/img/2021/2021-02-25_TeamsMeetingPolicy_new.png "Konfiguration der Teams Global Meeting Policy")<br /><br />
Nachdem Microsoft virtuelle Hintergründe für MS Teams Besprechungen eingeführt hat, habe ich einige *interessante* custom Backgrounds in Meetings gesehen. Falls ihr in eurem Tenant die Verwendung der Videofilter Hintergründe für Teams einschränken wollt, könnt ihr hierzu eine Besprechungsrichtline konfigurieren.

## Möglichkeiten zur Konfiguration

Folgende Konfigurationsmöglichkeiten bestehen:

|Name der Option |Bedeutung  |
|---------|---------|
|**NoFilters**     |Verwendung von Hintergründen ist deaktiviert.|
|**BlurOnly**     |User kann den Hintergrund weichzeichnen, aber keine Bilder als Hintergrund verwenden. |
|**BlurandDefaultBackgrounds**     |User kann den Hintergrund weichzeichnen **und** kann die Standard-Bilder als Hintergrund verwenden. |
|**AllFilters**     |User kann den Hintergrund weichzeichnen **und** kann die Standard-Bilder als Hintergrund verwenden **und** kann eigene Hintergründe einfügen (Standard). |

Standardmäßig ist die Option **AllFilters** für alle Benutzer aktiviert. Bei Bedarf können mehrere Teams Besprechungsrichtlinien verwendet werden, um den Benutzern unterschiedliche Hintergrundoptionen zu erlauben.

## Voraussetzungen

- Administratorrechte für Teams im Tenant
- [Microsoft Teams PowerShell Modul](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install){:target="_blank" rel="noopener noreferrer"} (TL;DR {% ihighlight PowerShell %}Install-Module MicrosoftTeams{% endihighlight %})
- optional: falls nicht die aktuelle Teams PowerShell Modulversion installiert ist, benötigt ihr *eventuell* noch das Skype for Business Online PowerShell Modul

## Mit Microsoft Teams PowerShell Online verbinden

Zunächst müssen wir uns per PowerShell mit dem Microsoft Teams Service verbinden:

{% highlight powershell linedivs %}
Connect-MicrosoftTeams
$session=New-CsOnlineSession
Import-PSSession $session
{% endhighlight %}

## Abrufen der Richtlinien

Um zu überprüfen, welche Meeting Policies aktuell konfiguriert sind folgenden Befehl ausführen:

{% highlight powershell linedivs %}
Get-CsTeamsMeetingPolicy | ft Identity,Description,VideoFiltersMode
{% endhighlight %}

Da in meinem Fall keine neuen Richtlinien definiert wurden, werden wir die default Policy "Global" anpassen.

## Anpassen der Richtlinie

Falls ihr eine andere Richtlinie anstatt "Global" anpassen möchtet, müsst ihr den Parameter {% ihighlight PowerShell %}-Identity{% endihighlight %} anpassen.

{% highlight powershell linedivs %}
Set-CsTeamsMeetingPolicy -Identity Global -VideoFiltersMode BlurandDefaultBackgrounds
{% endhighlight %}

## Bonus-Tipp: Teams PowerShell für Delegated Access Permission (DAP)

Als Microsoft Cloud Solution Provider (CSP) Partner kann diese Konfiguration auch per delegierter Berechtigung "Administer On Behalf Of (AOBO)" durchgeführt werden. Hierzu muss beim Verbinden mit den Onlineservices der Name des Kundentenants angegeben werden. Anschließend kann sich mit dem berechtigten Benutzerkonto aus dem Microsoft Partnertenant eingeloggt werden. Der Platzhalter {% ihighlight PowerShell %}<TenantName>{% endihighlight %} muss natürlich ersetzt werden durch den richtigen Namen des **Kunden**tenants.

{% highlight powershell linedivs %}
Connect-MicrosoftTeams -TenantId <TenantName>.onmicrosoft.com
$session=New-CsOnlineSession -OverrideAdminDomain <TenantName>.onmicrosoft.com
Import-PSSession $session
{% endhighlight %}

## Weiterführende Links

- [Microsoft Teams PowerShell Modul](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install){:target="_blank" rel="noopener noreferrer"}
- [Meeting policy settings - Video filters mode](https://docs.microsoft.com/en-us/microsoftteams/meeting-policies-in-teams#meeting-policy-settings---video-filters-mode){:target="_blank" rel="noopener noreferrer"}
