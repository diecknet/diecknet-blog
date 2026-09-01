---
comments: true
aliases:
    - exchange-online-cache-mode-shared-mailboxes
slug: Exchange-Online-Cache-Mode-Shared-Mailboxes
title: Outlook Cache Mode for Shared Mailboxes
tags: [exchange, exchange online, shared mailbox, freigegebenes postfach]
cover:
    image: /images/2021/2021-11-19-Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden_Zoomed.png
imageAlt: A screenshot showing the Outlook message that more items are available on the server.
date: 2021-11-19
---

In newer Microsoft Outlook versions it is no longer possible to retrieve additional emails in cache mode for shared mailboxes. Instead, the following message appears at the end of the email list:

> There are more items in this folder on the server.
>
> Connect to the server to view them

[![Outlook message: There are more items in this folder on the server. Connect to the server to view them.](/images/2021/2021-11-19-Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden_Zoomed.png "Outlook message: There are more items in this folder on the server. Connect to the server to view them.")](/images/2021/2021-11-19-Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden_Zoomed.png)

In personal mailboxes, the option to retrieve more items from the server is instead provided.

> There are more items in this folder on the server.
>
> Click here to view more information about Microsoft Exchange

[![Outlook message: There are more items in this folder on the server. Click here to view more information about Microsoft Exchange.](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen_Zoomed.png "Outlook message: There are more items in this folder on the server. Click here to view more information about Microsoft Exchange.")](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen_Zoomed.png)

## Workaround

Because it is not always practical to simply enable cache mode for all mailbox data in all shared mailboxes, I looked for a workaround. Many people recommend not caching shared mailboxes at all. If possible, however, I would still cache them for at least a certain period of time.

**Note: In some environments this approach does not work and no link to display all items is shown. The cause is currently unclear to me.**

In short, the approach is as follows:

1. Disable AutoMapping for the mailbox. To do this, the permission on the mailbox must be removed and then granted again with the additional parameter `-AutoMapping:$false` via PowerShell. After that, wait 1 hour for the permission to become active.
1. Add the shared mailbox as an additional account, not as a shared mailbox.
1. When entering the credentials, sign in with the user's credentials (not with the shared mailbox email address).
1. Restart Outlook.
1. The cache period can now be configured separately for the shared mailbox. Retrieval of data beyond the cache period is possible.

### 1. Disable AutoMapping

Using [Exchange Online PowerShell](https://docs.microsoft.com/de-de/powershell/exchange/exchange-online-powershell?view=exchange-ps), first remove the FullAccess permission, then assign it again with the additional parameter `-AutoMapping:$false`. In this example, the shared mailbox is called `MyShared-Mailbox` and the user with full access is `andreas.dieckmann`. I am assuming an Exchange Online environment here.

```powershell
Remove-MailboxPermission MyShared-Mailbox -User andreas.dieckmann -AccessRights fullaccess
Add-MailboxPermission MyShared-Mailbox -User andreas.dieckmann -AccessRights fullaccess -AutoMapping:$false
```

Now wait 1 hour for the permission to become active.

### 2. Add the shared mailbox as an additional account

Add a new account, for example via "File" -> "Account Settings" -> "Account Settings..." -> "New...".
Enter the email address and click "Connect".

[![Outlook account setup: Add an account.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-01.png "Outlook account setup: Add a shared mailbox as an account.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-01.png)

[![Outlook account setup: Add an account.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-02.png "Outlook account setup: Add a shared mailbox as an account.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-02.png)

### 3. Enter the user's credentials

In the authentication dialog, remove the email address of the shared mailbox and enter the email address of the user instead. If you are already asked for the password of the shared mailbox, click "Sign in with a different account".

[![Outlook account setup: Remove the shared mailbox email address.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-03.png "Outlook account setup: Remove the shared mailbox email address.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-03.png)

[![Outlook account setup: Enter the user's email address.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-04.png "Outlook account setup: Enter the user's email address.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-04.png)

### 4. Restart Outlook

Exit Outlook and restart it.

[![Outlook close dialog](/images/2021/2021-11-19-Close-Outlook.png "Outlook close dialog")](/images/2021/2021-11-19-Close-Outlook.png)

### 5. Set the cache period

The cache period is now separately configurable in the account settings. If you change the period, you must restart Outlook again.

[![Outlook cache period for shared mailbox](/images/2021/2021-11-19-E-Mail-Konto-Cache-Zeitraum.png "Outlook cache period for shared mailbox")](/images/2021/2021-11-19-E-Mail-Konto-Cache-Zeitraum.png)

## Result

After that, retrieving emails should be possible if they are older than the cache period. To do this, click "Click here to view more information about Microsoft Exchange".

[![Outlook cache period for shared mailbox](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen.png "Outlook cache period for shared mailbox")](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen.png)

## Conclusion

I am fairly happy with this workaround. I am not aware of a really good way to automate it. I also have at least one tenant where the setting does not work. In that case the shared mailbox is added as an additional account, but retrieving non-cached emails is still not possible.
