---
aliases:
    - exchange-hybrid-hcw8064-oauth
slug: Exchange-Hybrid-HCW8064-OAuth
title: "Exchange Hybrid: HCW8064 OAuth konnte nicht eingerichtet werden"
subtitle: OAuth Konfiguration manuell durchführen
tags: [exchange, exchange2013, exchangehybrid, oauth, office365]
cover:
    image: /images/2020/2020-04-28-HCW8064-01.png
date: 2020-05-01
---

Zum Abschluss des Hybrid Configuration Wizard (HCW) wurde mir folgende Warnungs-Meldung angezeigt:

> HCW8064 - Der Assistent für Hybridkonfiguration wurde abgeschlossen, er konnte den OAuth-Anteil der Hybridkonfiguration aber nicht ausführen. Wenn Sie Features benötigen, die OAuth voraussetzen, können Sie versuchen den Assistenten für Hybridkonfiguration erneut auszuführen oder OAuth mithilfe dieser manuellen Schritte manuell konfigurieren.

Der Link "**Weitere Informationen**" verweist auf [https://support.microsoft.com/en-us/help/3089172/hcw-has-completed-but-was-not-able-to-perform-the-oauth-portion-of-you](https://support.microsoft.com/en-us/help/3089172/hcw-has-completed-but-was-not-able-to-perform-the-oauth-portion-of-you). Wenn man schaut, wofür OAuth verwendet, wird [dieser Artikel](https://docs.microsoft.com/en-us/exchange/using-oauth-authentication-to-support-ediscovery-in-an-exchange-hybrid-deployment-exchange-2013-help?redirectedfrom=MSDN) referenziert. Dort ist zu lesen, OAuth für Cross-Premises eDiscovery Suchen benötigt wird. Da diese erwähnten Funktionen in dem Projekt nicht relevant waren, habe ich das erstmal ignoriert. Eine erneute Ausführung des HCW hat übrigens auch kein OAuth einrichten können.

OAuth _kann_ allerdings auch für die Authentifizierung für den Cross-Premise Austausch von Free/Busy Informationen genutzt werden. Der verlinkte [OAuth-Artikel](https://docs.microsoft.com/en-us/exchange/using-oauth-authentication-to-support-ediscovery-in-an-exchange-hybrid-deployment-exchange-2013-help?redirectedfrom=MSDN) erwähnt allerdings **ausschließlich** eDiscovery - das ist auch die Sektion der Dokumentation in der sich der Artikel befindet. Weitere OAuth-Szenarien werden hier nicht erläutert. Im [Artikel zur Konfiguration von OAuth für Exchange Hybrid](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help) wird Free/Busy auch nicht erwähnt.

## Kein Free/Busy möglich

Nachdem die ersten Test-User zu Exchange Online migriert wurden, hat sich gezeigt, dass der Cross-Premise Abruf von Free/Busy Informationen nicht funktioniert. Zur Erläuterung von Hybrid Free/Busy gibt es hier zwei sehr gute Artikel im Exchange Team Blog:

-   [Demystifying Hybrid Free/Busy: what are the moving parts?](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-what-are-the-moving-parts/ba-p/607704)
-   [Demystifying Hybrid Free/Busy: Finding errors and troubleshooting](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-finding-errors-and-troubleshooting/ba-p/607727)

## Intra-Organization Connector (IOC)

Sowohl On-Premise als auch in Exchange Online kann geprüft werden, ob ein **Intra-Organization Connector** (für Hybrid OAuth notwendig) verwendet wird. Da die Konfiguration per HCW fehlgeschlagen ist, sollte keine funktionierende IOC Konfiguration hinterlegt sein.

```powershell
Get-IntraOrganizationConnector | fl
```

Das Attribut "Enabled" steht auf "False", demnach wird kein OAuth verwendet. Also wie erwartet.
!["Get-IntraOrganizationConnector | fl" - "Enabled" steht auf "False"](/images/2020/2020-04-28-IOC-01.png "'Get-IntraOrganizationConnector | fl' - 'Enabled' steht auf 'False'")

## Organization Relationship (ORG REL)

Als nächstes sollte geprüft werden, ob ein Organization Relationship vorhanden ist.

```powershell
Get-OrganizationRelationship | fl
```

![Get-OrganizationRelationship verwenden um zu überprüfen ob ein Organization Relationship zur O365 Mail Domain vorhanden ist](/images/2020/2020-04-28-ORG-REL.png "Get-OrganizationRelationship verwenden um zu überprüfen ob ein Organization Relationship zur O365 Mail Domain vorhanden ist")

In meinem Fall, wurde ein Organization Relationship zurückgegeben. Es wird also DAUTH verwendet.

## DAUTH Überprüfung

Ich habe hier tatsächlich nur an der Oberfläche gekratzt. Nach einigem Troubleshooting hat sich gezeigt, dass die Authentifizierung per DAUTH in diesem Fall tatsächlich nicht funktioniert. Ich habe zum Überprüfen in Outlook on the Web (OWA) versucht eine Cross-Premise Verfügbarkeit abzurufen. In der Browser-Entwicklerkonsole (per "F12" aufrufbar) kann dann unter "Network" nach "GetUserAvailabilityInternal" gefiltert werden.
![Abruf der Entwickleroptionen - Network im Browser für OWA](/images/2020/2020-04-28-NetworkConsoleBrowserOWA.png "Abruf der Entwickleroptionen - Network im Browser für OWA")

Die relevanten Informationen die ich dort finden konnte:

> Error 0x80048800  
> wst:FailedAuthentication  
> AADSTS901124: Application 'fydibohf25spdlt.example.com' does not exist.

Die Details zum Free/Busy Troubleshooting sind auch im [Exchange Team Blog: Demystifying Hybrid Free/Busy: Finding errors and troubleshooting](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-finding-errors-and-troubleshooting/ba-p/607727) zu finden. Da die nicht existente Application und der Code "AADSTS901124" anscheinend kein Standard-Szenario ist, wollte ich eigentlich schon ein Ticket bei Microsoft eröffnen. Da aber OAuth ohnehin die moderne und empfohlene Authentifizierungsmethode ist, kann man aber auch ersteinmal dafür Troubleshooting betreiben.

## OAuth manuell einrichten

Grundsätzlich wird die manuelle Einrichtung von OAuth im Artikel [Configure OAuth authentication between Exchange and Exchange Online organizations](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help) beschrieben. Ich wiederhole das jetzt nicht hier alles. Was bei mir allerdings noch anders war:

### Exchange Server Auth Certificate abgelaufen und erneuert

Im Abschnitt ["Step 3: Export the on-premises authorization certificate"](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help#step-3-export-the-on-premises-authorization-certificate) wird beschrieben, wie das **Microsoft Exchange Server Auth Certificate** exportiert werden kann. Im nächsten Schritt würde es dann in Exchange Online importiert werden. Da das Exchange 2013 System beim Kunden bereits seit über 5 Jahren im Betrieb ist, wurde das Zertifikat bereits einmal ausgetauscht. Da Hybrid und OAuth hier noch nie verwendet wurden, wurde das neue Zertifikat auch nie für die Authentifizierung hinterlegt.

Auf [msxfaq.de gibt es einen guten Artikel zu Exchange OAuth](https://www.msxfaq.de/exchange/e2013/exchange_oauth.htm). Dort wird unter anderem beschrieben, wie per `powershell Set-AuthConfig` das neue Zertifikat hinterlegt werden kann:

```powershell
Set-AuthConfig -NewCertificateThumbprint <myCertThumbprint> -NewCertificateEffectiveDate (Get-Date)
Set-AuthConfig -PublishCertificate
```

Anschließend ist noch ein `iisreset` notwendig.

### Intra-Organization Connector konfigurieren

Anschließend konnte ich der Dokumentation entsprechend weiter verfahren ([Step 3, 4 und 5](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help#step-3-export-the-on-premises-authorization-certificate)). [Step 6 und 7](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help#step-6-create-an-intraorganizationconnector-from-your-on-premises-organization-to-office-365) waren nicht mehr zutreffend. Die IOC mussten nicht mehr angelegt werden, sondern mussten nur noch per `Get-IntraOrganizationConnector | Set-IntraOrganizationConnector -Enabled $true` aktiviert werden. Step 8 spielte keine Rolle, da keine pre-Exchange 2013 SP1 Server in der Umgebung vorhanden waren.

## Tests

Anschließend konnte ich folgende Tests erfolgreich durchführen:

### OAuth Test per PowerShell

In On-Premise Exchange Management Shell ausführen:

```powershell
Test-OAuthConnectivity -Service EWS -TargetUri https://outlook.office365.com/ews/exchange.asmx -Mailbox <On-Premises Mailbox> -Verbose | Format-List
```

In Exchange Online PowerShell ausführen:

```powershell
Test-OAuthConnectivity -Service EWS -TargetUri <external hostname authority of your Exchange On-Premises deployment>/metadata/json/1 -Mailbox <Exchange Online Mailbox> -Verbose | Format-List
```

### Abruf von Free/Busy Zeiten (Cross-Premise)

Tatsächlich konnten Cross-Premise die Free/Busy Zeiten abgerufen werden - in beide Richtungen. Hier ein exemplarischer Screenshot, der die Abfrage von einem Exchange Online Postfach zu einem Exchange On-Premise Postfach zeigt.

![Outlook on the Web: Abruf von Free/Busy Zeiten von Exchange Online zu Exchange On-Premise - erfolgreich](/images/2020/2020-04-28-FreeBusy.png "Outlook on the Web: Abruf von Free/Busy Zeiten von Exchange Online zu Exchange On-Premise - erfolgreich")

## Weiterführende Links

-   [Demystifying Hybrid Free/Busy: what are the moving parts? (Exchange Team Blog)](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-what-are-the-moving-parts/ba-p/607704)
-   [Demystifying Hybrid Free/Busy: Finding errors and troubleshooting (Exchange Team Blog)](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-finding-errors-and-troubleshooting/ba-p/607727)
-   [Configure OAuth authentication between Exchange and Exchange Online organizations (docs.microsoft.com)](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help)
-   [Exchange OAuth Artikel (msxfaq.de)](https://www.msxfaq.de/exchange/e2013/exchange_oauth.htm)
