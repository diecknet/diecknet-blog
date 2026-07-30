---
comments: true
aliases:
    - teamsautoupgrade-fail
slug: TeamsAutoUpgrade-fail
title: Der Wechsel von Skype for Business zu Teams ist frustrierend
tags:
    [
        MicrosoftTeams,
        SkypeForBusiness
    ]
cover:
    image: /images/2021/2021-08-05_TeamsUpgradeInMinusOneDays.png
imageAlt: -1 Tage bis zum Teams-Upgrade. Gute Nachrichten!
date: 2021-08-18
---

Der Upgrade-Prozess von Skype for Business Online zu Microsoft Teams ist ein Desaster gewesen. Mehrere SMB-Kunden haben mir unnötige Fehler zu Teams/Skype gemeldet. Mit unnötig meine ich: **Sie haben bis 2021-07-31 keine Probleme mit Teams gehabt.**

## Problem: Plötzlich sind Skype-Besprechungen in Outlook Mobile wieder da

Ein Kunde hat gemeldet, dass in Outlook auf iOS plötzlich wieder Skype-Besprechungen statt Teams-Besprechungen angezeigt worden sind.

![Skype Meeting in Outlook on iOS](/images/2021/2021-08-11-TeamsUpgrade_SuddenlySkypeMeetings.png "Skype Meeting in Outlook on iOS")

Dieser Kunde hat seinen Microsoft-365-Tenant selbst verwaltet. Er hat Teams schon seit längerer Zeit (>2 Jahre) exklusiv verwendet, hat aber nie auf den Modus "TeamsOnly" umgestellt. Ich bin sicher, dass dort die Message-Center-Einträge nicht regelmäßig gelesen worden sind (wenn überhaupt). Microsoft hat den Kunden mit einer Nachricht wie dieser informiert, wenn das automatische Upgrade fehlgeschlagen ist:

> We ran into a problem upgrading your organization to Microsoft Teams, so we paused your upgrade. We understand you were expecting this upgrade to happen soon, and we apologize for the delay.
>  
> **How does this affect me?** Your users should have the same Skype for Business experience they're accustomed to using. It should appear as if nothing has changed.
>  
> **What do I need to do to prepare for this change?** We're working to fix the problem that caused us to pause your upgrade. We'll notify you when we're ready, once again, to upgrade your users to Teams.
>  
> There are no actions you need to take. Please click Additional Information below to learn more.

Direkt danach ist noch eine weitere Nachricht gekommen:

> As part of the upcoming Skype for Business Online service retirement (originally announced in MC219641 of July '20), your organization has been scheduled for an [assisted upgrade](https://docs.microsoft.com/en-us/microsoftteams/upgrade-assisted) to help transition your Skype for Business Online users to Microsoft Teams. However, we paused your scheduled upgrade after detecting one or more DNS records that point to a domain in an on-premises Skype for Business deployment. These records are required if your organization includes on-premises Skype for Business users.
>  
> If your organization does not have any on-premises Skype for Business Server or Lync Server users, these DNS records must be updated to point to Microsoft 365 or removed by **August 13, 2021**.
>  
> Microsoft cannot take this step for you. If you do not remove stale DNS records, your assisted upgrade will still be rescheduled for a later date, but taking these steps gives you greater control over the upgrade experience.

Okay, das Upgrade ist also gestoppt worden. Laut Nachricht hat der Kunde DNS-Einträge gehabt, die auf ein lokales Skype-for-Business-Server-System gezeigt haben. Das Problem ist: **Der Kunde hat keinen S4B-Server gehabt.** Und er hat auch früher keinen gehabt. Der Upgrade-Prozess hat einfach angenommen, dass es einen gegeben hat.

![The Teams-Upgrade was paused!](/images/2021/2021-08-18_TeamsUpgradePaused.png "The Teams-Upgrade was paused!")

## Das eigentliche Problem

![We can't upgrade this organization to 'Teams Only' mode.](/images/2021/2021-08-18_TeamsUpgradeFailed.png "We can't upgrade this organization to 'Teams Only' mode.")

Das eigentliche Problem ist gewesen, dass dieser Kunde Wildcard-DNS-Einträge für seine Domains im öffentlichen DNS verwendet hat. Wenn der Upgrade-Prozess nach den Skype-DNS-Einträgen gesucht hat, hat er daher die IP-Adresse der Website des Kunden als Antwort erhalten. Der Upgrade-Prozess hat nicht geprüft, ob:

- die Domain Wildcard-DNS-Einträge verwendet hat
- die gelieferte DNS-Antwort tatsächlich auf eine laufende Skype-for-Business-Server-Umgebung gezeigt hat (oder ob es diese in der Vergangenheit jemals gegeben hat)

Die Anleitung in der Fehlermeldung (wenn man manuell auf Teams upgraden will) ist nicht wirklich hilfreich gewesen: Microsoft hat angenommen, dass der Kunde wirklich eine S4B-Bereitstellung gehabt hat, daher ist nur empfohlen worden, Benutzer mit `Move-CsUser` zu migrieren.  
Nebenbei: Vor einiger Zeit ist diese Fehlermeldung nur sichtbar gewesen, wenn das Upgrade auf TeamsOnly per PowerShell versucht worden ist. Das Teams Admin Center hat nur einen "unknown error" angezeigt.

## Die Lösung

Nachdem wir DNS-Einträge in der DNS-Zone des Kunden erstellt haben, die auf Skype for Business Online gezeigt haben, haben wir den Tenant auf Teams Only upgraden können. Die Option für Skype-Besprechungen in Outlook für iOS ist kurz danach wieder auf Teams-Besprechungen zurückgestellt worden.

Das sind die DNS-Einträge ([Quelle](https://docs.microsoft.com/en-us/skypeforbusiness/troubleshoot/online-configuration/dns-configuration-issue)):

### SRV-Einträge

Type|Service|Protocol|Port|Weight|Priority|TTL|Name|Target|
|-|-|-|-|-|-|-|-|-|
|SRV|_sip|_tls|443|1|100|1 hour|**\<DomainName>**|sipdir.online.lync.com|
|SRV|_sipfederationtls|_tcp|5061|1|100|1 hour|**\<DomainName>**|sipfed.online.lync.com|

### CNAME-Einträge

|Type|Host name|Destination|TTL|
|-|-|-|-|
|CNAME|sip.**\<DomainName>**|sipdir.online.lync.com|1 hour|
|CNAME|lyncdiscover.**\<DomainName>**|webdir.online.lync.com|1 hour|

## Meine Gedanken zum Problem

Ich hätte mir gewünscht, dass das automatische/assistierte Upgrade die DNS-Konfiguration einer Domain besser verstanden hätte. Alternativ hätte es zumindest eine Option geben sollen, um den DNS-Check beim Upgrade in den TeamsOnly-Modus zu überspringen. Etwas wie eine `-Force`-Option für `Grant-CsTeamsUpgradePolicy -Global`.  
Beide Wege haben den Wechsel in den TeamsOnly-Modus deutlich einfacher und reibungsloser gemacht.
