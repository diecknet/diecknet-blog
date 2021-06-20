---
layout: post
title: Exchange Room Mailbox - Set Permissions
subtitle: Set Exchange Mailboxfolder permissions using PowerShell
date: 2020-01-15
contenttags: [exchange, powershell, exchange2013]
image: /assets/images/2020-01-15_17_44_53-_CalendarPermission-Error-Outlook.png
---
By default, the "Calendar" folder in Exchange 2013 Room Mailboxes has the "LimitedDetails" permission for the "Standard" security principal. Therefore, if no other permissions are configured, users cannot view details for appointments in this room. For better usability in Outlook, the "Reviewer" permission is more suitable. This allows items to be listed and details to be displayed. If required, the [CalendarProcessing](https://docs.microsoft.com/en-us/powershell/module/exchange/mailboxes/set-calendarprocessing?view=exchange-ps) can be adjusted so that details such as the description and subject of the appointment are not saved in the room mailbox. Whether all this makes sense always depends on the environment.

## List the current permissions

Use the following PowerShell code to list the current permissions of the "Calendar" (German: "Kalender") folders of all room mailboxes. The code must be executed in the Exchange Management Shell.

``` powershell
$rooms=Get-Mailbox -RecipientTypeDetails "RoomMailbox"
foreach($room in $rooms) {
 $calendar=$null
 $calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Kalender" -ErrorAction SilentlyContinue
 if(!($calendar)) {
  $calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Calendar" -ErrorAction SilentlyContinue
 }
 $calendar | Select Identity,User,AccessRights
}

```

This code is compatible with German and English language systems. For other languages the identity parameter in line 4 needs to be adjusted.

**Result:**

![List the calendar permissions for all room mailboxes](/assets/images/2020-01-15_17_20_31-CalendarPermissions.png "List the calendar permissions for all room mailboxes. The permissions are not standardized (PowerShell Window)")

In this case the permissions were not set consistently for all meeting rooms of the client.

## Set Standard permissions for all room mailboxes

The following PowerShell code can be used to change all permissions for the "Standard" security principal to the "Reviewer" permission level.

``` powershell
$rooms=Get-Mailbox -RecipientTypeDetails "RoomMailbox"
foreach($room in $rooms) {
 $calendar=$null
 $calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Kalender" -User Standard -ErrorAction SilentlyContinue
 if(!($calendar)) {
  $calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Calendar" -User Standard -ErrorAction SilentlyContinue
 }
 Set-MailboxFolderPermission -Identity $calendar.Identity -User Standard -AccessRights Reviewer
}
```

## Exchange Versions

This procedure was tested with Exchange 2013. The procedure should also apply to Exchange 2016/2019 and Exchange Online.
