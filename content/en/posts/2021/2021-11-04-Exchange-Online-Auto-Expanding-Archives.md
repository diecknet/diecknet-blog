---
aliases:
    - exchange-online-auto-expanding-archives
slug: Exchange-Online-Auto-Expanding-Archives
title: "Verify Auto-Expanding Archives in Exchange Online"
date: 2021-11-04
contenttags: [exchange, exchange online, powershell, archive mailbox]
image: /images/2021/2021-11-04_Get-AdditionalMailbox-AutoExpandingArchivesInfo.png
---

If you have Auto-Expanding Archives for Exchange Online Mailboxes enabled, you might want to find out, if it actually provisions additional storage.

In the Exchange Admin Center (EAC), open the info pane of the user's mailbox. Click on "Manage mailbox archive".

[![Exchange Admin Center - Mailbox Pane](/images/2021/2021-11-04_Exchange_Online_Mailbox.png "Exchange Admin Center - Mailbox Pane")](/images/2021/2021-11-04_Exchange_Online_Mailbox.png)

An Auto-Expanding Archive provisions more Archive storage space, if needed. Default Archives have 100 GB of storage available. If the archive is already bigger than 100 GB, we must have additional storage.

[![Exchange Admin Center - Archive Mailbox Usage](/images/2021/2021-11-04_Exchange_Online_Mailbox_Archive_Usage.png "Exchange Admin Center - Archive Mailbox Usage")](/images/2021/2021-11-04_Exchange_Online_Mailbox_Archive_Usage.png)

By the way: This license note is apparently shown regardless whether that user has an Exchange Online Plan 2 license assigned or not:

> Unlimited storage is a premium feature that requires an Exchange Online Plan 2 or Exchange Online Archiving license to enable it for each user mailbox"

And it still mentions "unlimited storage", even though since 2021-11-01 the Archiving does not include "unlimited storage" anymore. The storage is now limited to 1.5 TB.

## Check for additional storage locations

When the main Archive of the Mailbox reaches it's limit of 100 GB, another storage gets added. The additional storage is called "Auxilary Archive" or short "AuxArchive".

I wrote a PowerShell function to list all the Mailbox locations of a user. It also lists some storage consumption information. 

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

Example of result:

The user has a "Primary" mailbox, a "MainArchive" mailbox and another "AuxArchive" mailbox.

[![Exchange Online PowerShell - Custom command to retrieve all mailbox locations of a user mailbox](/images/2021/2021-11-04_Get-AdditionalMailbox-AutoExpandingArchivesInfo.png "Exchange Online PowerShell - Custom command to retrieve all mailbox locations of a user mailbox")](/images/2021/2021-11-04_Get-AdditionalMailbox-AutoExpandingArchivesInfo.png)

## Related Links

-   [Office 365: Auto-Expanding Archive FAQ (Exchange Team Blog)](https://techcommunity.microsoft.com/t5/exchange-team-blog/office-365-auto-expanding-archives-faq/ba-p/607784)
-   [Microsoft Caps Exchange Online’s Unlimited Archive at 1.5 TB (Practical 365)](https://practical365.com/microsoft-caps-exchange-onlines-unlimited-archive/)

