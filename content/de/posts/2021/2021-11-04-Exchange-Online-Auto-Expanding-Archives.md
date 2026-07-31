---
comments: true
aliases:
    - exchange-online-auto-expanding-archives
slug: Exchange-Online-Auto-Expanding-Archives
title: "Auto-Expanding Archives in Exchange Online prüfen"
date: 2021-11-04
tags: [exchange, exchange online, powershell, archive mailbox]
cover:
    image: /images/2021/2021-11-04_Get-AdditionalMailbox-AutoExpandingArchivesInfo.png
---

Wenn ihr Auto-Expanding Archives für Exchange-Online-Postfächer aktiviert habt, wollt ihr vielleicht herausfinden, ob zusätzlicher Speicher tatsächlich bereitgestellt wird.

Im Exchange Admin Center (EAC) öffnet ihr den Infobereich des Benutzerpostfachs. Dann klickt ihr auf "Manage mailbox archive".

[![Exchange Admin Center - Postfachbereich](/images/2021/2021-11-04_Exchange_Online_Mailbox.png "Exchange Admin Center - Postfachbereich")](/images/2021/2021-11-04_Exchange_Online_Mailbox.png)

Ein Auto-Expanding Archive stellt bei Bedarf zusätzlichen Archivspeicher bereit. Standardarchive haben 100 GB verfügbaren Speicher. Wenn das Archiv bereits größer als 100 GB ist, muss zusätzlicher Speicher vorhanden sein.

[![Exchange Admin Center - Archivpostfachauslastung](/images/2021/2021-11-04_Exchange_Online_Mailbox_Archive_Usage.png "Exchange Admin Center - Archivpostfachauslastung")](/images/2021/2021-11-04_Exchange_Online_Mailbox_Archive_Usage.png)

Übrigens: Dieser Lizenzhinweis wird offenbar angezeigt, unabhängig davon, ob dem Benutzer eine Exchange Online Plan 2 Lizenz zugewiesen ist oder nicht:

> Unlimited storage is a premium feature that requires an Exchange Online Plan 2 or Exchange Online Archiving license to enable it for each user mailbox"

Und es wird weiterhin "unlimited storage" erwähnt, obwohl seit 2021-11-01 beim Archivieren kein "unlimited storage" mehr enthalten ist. Der Speicher ist jetzt auf 1,5 TB begrenzt.

## Zusätzliche Speicherorte prüfen

Wenn das Hauptarchiv des Postfachs sein Limit von 100 GB erreicht, wird ein weiterer Speicher hinzugefügt. Dieser zusätzliche Speicher heißt "Auxilary Archive" oder kurz "AuxArchive".

Ich habe eine PowerShell-Funktion geschrieben, um alle Postfachorte eines Benutzers aufzulisten. Sie listet auch Informationen zur Speichernutzung auf.

```powershell
# prerequisite: Exchange Online PowerShell module, must be connected to the service
function Get-AdditionalMailbox($Identity) {
    $MailboxLocations = (Get-MailboxLocation -User $Identity)
    $AdditionalMailbox = forEach($MailboxLocation in $MailboxLocations) {
        $MailboxStats = Get-MailboxStatistics -Identity ($MailboxLocation.MailboxGuid).ToString()
        # output this to the foreach loop:
        [PSCustomObject]@{
            "MailboxID"=$MailboxLocation.MailboxGuid;
            "MailboxType"=$MailboxLocation.MailboxLocationType;
            "TotalItemSize"=$MailboxStats.TotalItemSize;
            "TotalDeletedItemSize"=$MailboxStats.TotalDeletedItemSize;
        }
    }
    return $AdditionalMailbox
}
```

Beispielergebnis:

Der Benutzer hat ein "Primary"-Postfach, ein "MainArchive"-Postfach und ein weiteres "AuxArchive"-Postfach.

[![Exchange Online PowerShell - Benutzerdefinierter Befehl zum Abrufen aller Postfachorte eines Benutzerpostfachs](/images/2021/2021-11-04_Get-AdditionalMailbox-AutoExpandingArchivesInfo.png "Exchange Online PowerShell - Benutzerdefinierter Befehl zum Abrufen aller Postfachorte eines Benutzerpostfachs")](/images/2021/2021-11-04_Get-AdditionalMailbox-AutoExpandingArchivesInfo.png)

## Verwandte Links

-   [Office 365: Auto-Expanding Archive FAQ (Exchange Team Blog)](https://techcommunity.microsoft.com/t5/exchange-team-blog/office-365-auto-expanding-archives-faq/ba-p/607784)
-   [Microsoft Caps Exchange Online’s Unlimited Archive at 1.5 TB (Practical 365)](https://practical365.com/microsoft-caps-exchange-onlines-unlimited-archive/)
