---
slug: "exchange-hybrid-without-ever-having-an-exchange-server"
title: "Synchronisierte Exchange Objekte ohne Exchange Server verwalten"
date: 2023-04-12
comments: true
tags: [Hybrid, Exchange, Azure AD Connect, Exchange Server, AAD, Azure Active Directory, Active Directory]
cover: 
    image: "/images/2023/2023-04-12-Exchange-YouTube-Thumbnail.jpg"
---

Es ist ja schon seit einiger Zeit möglich, die Exchange Server Verwaltungstools ohne einen vollständigen Exchange Server zu verwenden.
Die meisten Anleitungen gehen davon aus, dass schon mindestens ein Exchange Server vorhanden war und dieser dann entfernt wird. Und die [Microsoft Dokumentation verweist nur am Rande auf das Thema][mshybridemt] und erklärt nicht wirklich.
  
In diesem Post gehe ich auf ein Szenario ein, was vorallem viele kleinere Unternehmen betrifft:
Im Microsoft 365 Admin Center wird angezeigt:

> Dieser Benutzer wird mit Ihrem lokalen Active Directory synchronisiert. Einige Details können nur über Ihre lokale Active Directory bearbeitet werden

**Aber wie kann die Konfiguration über das lokale Active Directory vorgenommen werden?**

## Video zu dem Thema

Ich habe auch ein [Video][video] zu dem Thema erstellt:
[![Video Thumbnail "Synchronisierte User trotzdem administrieren"](/images/2023/2023-04-12-Exchange-YouTube-Thumbnail-player.jpg)][video]

## Ursache

Die Ursache liegt in Azure AD Connect. Auf Grund der Architektur der Verzeichnissynchronisierung zwischen On-Premises Windows Server Active Directory und Azure Active Directory ist festgelegt, dass die Benutzerattribute von On-Premises stammen. Die Änderung ist dann nur an der Quelle möglich. Also im lokalen AD.
Allerdings ist die Verwaltung von Exchange-bezogenen Attributen wie z.B. die E-Mail Adresse nur über die Exchange Verwaltungstools supported. Also müssen die Exchange Management Tools lokal installiert werden. Und damit die Attribute an den Benutzerobjekten überhaupt existieren, werden die Exchange Schemaerweiterungen benötigt.

## Installation Exchange Verwaltungstools und Schemaerweiterungen

Wenn noch nie ein Exchange Server beziehungsweise eine Exchange-Organisation im Active Directory vorhanden waren, können trotzdem die Exchange-Schemaerweiterungen im AD installiert werden. Ein vollständiger Exchange Server muss dafür nicht installiert werden.

### Voraussetzungen

Es wird ein Computer benötigt, auf dem die Exchange *Management Tools* installiert werden können.

Berechtigungen:

- Für die initiale Einrichtung werden Domänenadministratorrechte benötigt
- Optional kann die spätere Verwaltung von Exchange Empfängern auch an Mitglieder einer Sicherheitsgruppe delegiert werden

Betriebssystem:

- Windows Server 2022 (bevorzugt, damit habe ich es getestet)
- Windows Server 2019

Weitere Komponenten:

- [.NET Framework 4.8][net48] (ist bei Windows Server 2022 bereits vorinstalliert)
- [Visual C++ 2012 Runtime][cplusplus2012]
- Und natürlich muss das [aktuellste Exchange Server 2019 CU heruntergeladen][ex2019download] und gemounted werden

### Setup Assistent GUI

1. Das `setup.exe` vom Exchange Installationsdatenträger starten
2. Beim Schritt "Serverrollenauswahl" folgende Optionen aktivieren:
   - [x] Verwaltungstools
   - [x] Für die Installation von Exchange Server erforderliche Windows Server-Rollen und -Funktionen automatisch installieren
3. Wenn wirklich noch keine Exchange Organisation vorhanden ist, kommt nach der Seite "Speicherplatz und Speicherort der Installation" die Seite "Exchange Organisation". Hier einen beliebigen Namen für die Exchange Organisation eingeben. Ich nehme z.B. "diecknet-ORG".
![Exchange Organisation im Setup Assistent konfigurieren](/images/2023/2023-04-12-Exchange-ORG-GUI.jpg)
4. Bei der "Bereitschaftsprüfung" wird darauf hingewiesen, dass nun mit `Setup /PrepareAD` eine Exchange Organisation eingerichtet wird.
5. Nach Abschluss des Setup-Assistenten muss der Computer einmal neugestart werden.
6. Nach Neustart des Servers:
   - Aus dem Microsoft 365 Admin Center unter "Einstellungen" -> "Domänen" die `.onmicrosoft.com` Domain des Tenants raussuchen. Bei mir ist das zum Beispiel "yr2z8.onmicrosoft.com"
   ![onmicrosoft.com Domäne im Tenant nachschauen unter Einstellungen - Domänen](/images/2023/2023-04-12-Exchange-Tenant-onmicrosoft.com-Domain.jpg)
   - Diesen onmicrosoft.com Domainname ergänzen: Zwischen dem Tenantnamen und `.onmicrosoft.com` den Zusatz `.mail` einfügen (also so: `<Tenantname>.mail.onmicrosoft.com`). Beispielsweise wird bei mir aus `yr2z8.onmicrosoft.com` dann `yr2z8.mail.onmicrosoft.com`.
   - Eine administrative PowerShell Session starten. Folgenden Befehle ausführen. Dabei natürlich die eigene Domäne einsetzen die wir gerade rausgesucht haben.

        ```powershell
        Add-PSSnapin Microsoft.Exchange.Management.PowerShell.SnapIn
        # Hier die eigene .onmicrosoft.com Domain des Tenants verwenden!
        New-RemoteDomain -Name "yr2z8.mail.onmicrosoft.com" -DomainName "yr2z8.mail.onmicrosoft.com"
        Set-RemoteDomain "yr2z8.mail.onmicrosoft.com" -TargetDeliveryDomain $true
        ```

        ![onmicrosoft.com Domäne als Target Delivery Domain in der On-Premises Umgebung anlegen](/images/2023/2023-04-12-Exchange-RemoteDomain.jpg)
   - **Das PowerShell Fenster schließen.** Das `Microsoft.Exchange.Management.PowerShell.SnapIn` ist in dieser Konstellation nur für die Anlage der RemoteDomain/TargetDeliveryDomain supported.
7. Optional: Berechtigung für Nicht-Domänenadmins zuweisen
   - Eine neue administrative PowerShell Session starten und folgende Befehle ausführen.

        ```powershell
        Add-PSSnapin *RecipientManagement
        $env:ExchangeInstallPath\Scripts\Add-PermissionForEMT.ps1
        ```

   - Anschließend können die User die ebenfalls Exchange Verwaltungen durchführen sollen zur Sicherheitsgruppe "Exchange Recipient Management EMT" hinzugefügt werden.

## Verwaltung von Exchange Attributen

Wenn jetzt Exchange Attribute angepasst werden sollen, dann muss zuerst das RecipientManagement PowerShell SnapIn geladen werden. Anschließend können die entsprechenden PowerShell Cmdlets verwendet werden. Beispielsweise `New-RemoteMailbox` oder `Set-RemoteMailbox`.

```powershell
# SnapIn laden
Add-PSSnapin *RecipientManagement
# Exchange Verwaltung durchführen, z.B.
Get-RemoteMailbox
```

## Tipps

- 🏁 Es wäre auch möglich die Exchange Installation inkl. Schemaerweiterung per [Commandline/Unattended Install Options][unattendedInstall] durchzuführen:

    ```cmd
    setup.exe /IAcceptExchangeServerLicenseTerms_DiagnosticDataON /OrganizationName:"diecknet-ORG" /Mode:Install /Roles:ManagementTools /InstallWindowsComponents
    ```

- Alle zur Verfügung stehenden Cmdlets lassen sich so auflisten:

    ```powershell
    Add-PSSnapin *RecipientManagement
    Get-Command -Module *RecipientManagement
    ```

- Um einfacher in die Exchange Recipient Verwaltung zu gelangen, könnt ihr euch eine Desktopverknüpfung anlegen, mit dem Ziel `powershell.exe -NoExit -Command "Add-Snapin *RecipientManagement"`. Am besten noch per Rechtsklick auf die Verknüpfung einstellen, dass der Befehl direkt in `C:\` (oder einem beliebigen anderem Ort) ausgeführt wird. Ansonsten wird es nämlich im PowerShell Programm-Ordner ausgeführt und belegt so viel sichtbaren Platz in der Shell 😛.
![Anpassung der Exchange EMT Verknüpfung, sodass sie in C:\ ausgeführt wird](/images/2023/2023-04-12-Exchange-Recipient-Management-Shortcut.jpg)

[cplusplus2012]: https://www.microsoft.com/download/details.aspx?id=30679  "Download: Visual C++ Redistributable for Visual Studio 2012"
[net48]: https://go.microsoft.com/fwlink/?linkid=2088631  "Download .NET Framework 4.8"
[ex2019download]: https://learn.microsoft.com/en-us/exchange/new-features/updates?view=exchserver-2019  "Download Exchange Server 2019 CUs"
[video]: https://youtu.be/aDqBk6O0f-0
[unattendedInstall]: https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deploy-new-installations/unattended-installs?view=exchserver-2019  "Use unattended mode in Exchange Setup"
[mshybridemt]: https://learn.microsoft.com/en-us/exchange/manage-hybrid-exchange-recipients-with-management-tools  "Manage recipients in Exchange Hybrid environments using Management tools"
