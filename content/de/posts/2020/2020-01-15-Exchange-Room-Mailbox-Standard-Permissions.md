---
title: Exchange Raumpostfach - Berechtigungen setzen
subtitle: Exchange Postfachordner Berechtigungen per PowerShell setzen
contenttags: [exchange, powershell, exchange2013]
image: /assets/images/2020-01-15_17_44_53-_CalendarPermission-Error-Outlook.png
date: 2020-01-15
---
> Zugriff wurde für den Benutzer verweigert. - Exchange Raumpostfach Berechtigungen (Outlook Fenster)

Standardmäßig hat der "Kalender"-Ordner von Exchange 2013 Raumpostfächer die Berechtigung "LimitedDetails" für das Sicherheitsprinzipal "Standard". Wenn also keine weiteren Berechtigungen konfiguriert sind, können die Anwender keine Details für Termine in diesem Raum anzeigen. Für eine bessere Bedienbarkeit in Outlook ist die Berechtigung "Reviewer" besser geeignet. Hierdurch dürfen Elemente aufgelistet und Details angezeigt werden. Bei Bedarf kann noch das [CalendarProcessing](https://docs.microsoft.com/en-us/powershell/module/exchange/mailboxes/set-calendarprocessing?view=exchange-ps) angepasst werden, sodass Details wie Beschreibung und Betreff des Termins nicht im Raumpostfach gespeichert werden. Ob das alles sinnvoll ist, kommt immer auf die Umgebung an.

## Auflisten der aktuellen Berechtigungen

Mit folgendem PowerShell Code lassen sich die aktuellen Berechtigungen für den "Kalender" (Englisch: "Calendar") Ordner von allen Raumpostfächern auflisten. Der Code muss in der Exchange Management Shell ausgeführt werden.

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

Dieser Code ist für deutsch- und englischsprachige Systeme geeignet. Bei anderen Sprachen sollte der Identity Parameter in Zeile 4 angepasst werden.

**Ergebnis:**

![Auflistung Kalenderberechtigungen für mehrere Raumpostfächer](/assets/images/2020-01-15_17_20_31-CalendarPermissions.png "Auflistung Kalenderberechtigungen für mehrere Raumpostfächer. Die Berechtigungen sind nicht einheitlich (PowerShell Fenster)")

In diesem Fall waren die Berechtigungen nicht einheitlich für alle Besprechungsräume des Kunden gesetzt.

## Standard Berechtigungen für alle Raumpostfächer setzen

Mit folgendem PowerShell Code lassen sich alle Berechtigungen für das Sicherheitsprinzipal "Standard" auf die Berechtigungsstufe "Reviewer" ändern.

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

## Exchange Versionen

Die Vorgehensweise wurde mit Exchange 2013 getestet. Die Vorgehensweise sollte ebenfalls für Exchange 2016/2019 und Exchange Online zutreffend sein.
