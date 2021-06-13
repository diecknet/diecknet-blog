---
title: Exchange - Wann wurde das Postfach WIRKLICH erstellt?
subtitle: MSExchWhenMailboxCreated ist nicht was es scheint...
lang: de
tags: [exchange, powershell, exchange2013]
image: "/img/2020/2020-01-25 MSExchWhenMailboxCreated PowerShell.png"
---
![MSExchWhenMailboxCreated Attribute per PowerShell auslesen](/img/2020/2020-01-25 MSExchWhenMailboxCreated PowerShell.png "MSExchWhenMailboxCreated Attribute per PowerShell auslesen - Get-ADUser -Properties MSExchWhenMailboxCreated") <br /><br />
Wenn du herausfinden möchtest, wann ein Exchange Postfach erstellt wurde, wirst du wahrscheinlich über das Active Directory-Benutzer Attribut ``` powershell MSExchWhenMailboxCreated``` stolpern. Um den Wert auszulesen, kannst du PowerShell oder Active Directory-Benutzer und -Computer (ADUC) verwenden.

``` powershell
Get-ADUser -Properties MSExchMaiboxWhenCreated
```

![Get MSExchWhenMailboxCreated attribute using PowerShell](/img/2020/2020-01-25 MSExchWhenMailboxCreated ADUC.png "MSExchWhenMailboxCreated Attribut per Active Directory-Benutzer und Computer anzeigen. Erweiterte Features müssen aktiviert sein.")

## MSExchWhenMailboxCreated enthält nicht die ganze Wahrheit
Das könnte schon das Ende der Geschichte sein. ABER das Attribut ist nicht, was du vielleicht denkst. Das Attribut wird nur propagiert wenn der Benutzer *DAS ERSTE MAL* ein Postfach erhält. Wenn das Postfach zwischenzeitlich deaktiviert und dann später neuerstellt wurde, bleibt trotzdem der Zeitstempel der ersten Postfacherstellung.

![Überprüfung des MSExchWhenMailboxCreated Attributs per PowerShell, nach einer Postfach-Neuerstellung](/img/2020/2020-01-25 MSExchWhenMailboxCreated PowerShell Mailbox recreated.png "Überprüfung des MSExchWhenMailboxCreated Attributs per PowerShell, nach einer Postfach-Neuerstellung - Der alte Wert bleibt.")

## Das wirkliche Datum der Postfacherstellung herausfinden
Wenn die Postfacherstellung erst kürzlich geschehen ist, kannst du eventuell einen entsprechenden Eintrag im Ereignislog des Exchange Servers finden. Wenn du das MSExchange Management Event Log manuell nach Postfacherstellungen durchsuchst (STRG+F und nach "Enable-Mailbox" suchen), findest du eventuell das tatsächliche Datum der Postfacherstellung. Der PowerShell Weg wäre:

``` powershell
Get-EventLog -Source "MSExchange CmdletLogs" -LogName "MSExchange Management" -ComputerName <Servername> -Message "*Enable-Mailbox*test.user*"
```

![Überprüfen des  MSExchange Management Event Log auf Postfacherstellungen](/img/2020/2020-01-25 Exchange mailbox creation event log.png "Überprüfen des  MSExchange Management Event Log auf Postfacherstellungen - Das Postfach wurde kürzlich erstellt per Enable-Mailbox cmdlet.")

## Exchange Versionen
Die Vorgehensweise wurde mit Exchange 2013 CU23 getestet. Ich bin mir nicht sicher, ob das beobachtete Verhalten ein Bug in Exchange 2013 ist. Die generelle Vorgehensweise sollte auch mit Exchange 2016/2019 funktionieren.
