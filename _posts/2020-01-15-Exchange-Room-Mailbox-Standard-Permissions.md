---
layout: post
title: Exchange Raumpostfach - Berechtigungen setzen
subtitle: Exchange Postfachordner Berechtigungen per PowerShell setzen
lang: de
tags: [exchange, powershell, exchange 2013]
image: "/img/2020-01-15 17_44_53-_CalendarPermission-Error-Outlook.png"
---
![Exchange Raumpostfach - Berechtigungen](/img/2020-01-15 17_44_53-_CalendarPermission-Error-Outlook.png "Exchange Raumpostfach Berechtigungen (Outlook Fenster) - Zugriff wurde für den Benutzer verweigert.")<br/><br/>
Standardmäßig haben Exchange 2013 Raumpostfächer die Berechtigung "LimitedDetails" für das Sicherheitsprinzipal "Standard". Wenn also keine weiteren Berechtigungen konfiguriert sind, können die Anwender keine Details für Termine in diesem Raum anzeigen. Für eine bessere Bedienbarkeit in Outlook ist die Berechtigung "Reviewer" besser geeignet. Hierdurch dürfen Elemente aufgelistet und Details angezeigt werden. Bei Bedarf kann noch das [CalendarProcessing](https://docs.microsoft.com/en-us/powershell/module/exchange/mailboxes/set-calendarprocessing?view=exchange-ps){:target="_blank" rel="noopener noreferrer"} angepasst werden, sodass Details wie Beschreibung und Betreff des Termins nicht im Raumpostfach gespeichert werden. Ob das alles sinnvoll ist, kommt immer auf die Umgebung an.

## Auflisten der aktuellen Berechtigungen
Mit folgendem PowerShell Code lassen sich die aktuellen Berechtigungen auflisten. Der Code muss in der Exchange Management Shell ausgeführt werden.
{% highlight powershell linedivs %}
$rooms=Get-Mailbox -RecipientTypeDetails "RoomMailbox"
foreach($room in $rooms) {
	$calendar=$null
	$calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Kalender" -ErrorAction SilentlyContinue
	if(!($calendar)) {
		$calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Calendar" -ErrorAction SilentlyContinue
	}
	$calendar | Select Identity,User,AccessRights
}

{% endhighlight %}
Dieser Code ist für deutsch- und englischsprachige Systeme geeignet. Bei anderen Sprachen sollte der Identity Parameter in Zeile 4 angepasst werden.

**Ergebnis:**

![Auflistung Kalenderberechtigungen für mehrere Raumpostfächer](/img/2020-01-15 17_20_31-CalendarPermissions.png "Auflistung Kalenderberechtigungen für mehrere Raumpostfächer. Die Berechtigungen sind nicht einheitlich (PowerShell Fenster)")

In diesem Fall waren die Berechtigungen nicht einheitlich für alle Besprechungsräume des Kunden gesetzt. 

## Standard Berechtigungen für alle Raumpostfächer setzen
Mit folgendem PowerShell Code lassen sich alle Berechtigungen für das Sicherheitsprinzipal "Standard" auf die Berechtigungsstufe "Reviewer" ändern.
{% highlight powershell linedivs %}
$rooms=Get-Mailbox -RecipientTypeDetails "RoomMailbox"
foreach($room in $rooms) {
	$calendar=$null
	$calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Kalender" -User Standard -ErrorAction SilentlyContinue
	if(!($calendar)) {
		$calendar=Get-MailboxFolderPermission -Identity "$($room.userprincipalname):\Calendar" -User Standard -ErrorAction SilentlyContinue
	}
	Set-MailboxFolderPermission -Identity $calendar.Identity -User Standard -AccessRights Reviewer
}
{% endhighlight %}

