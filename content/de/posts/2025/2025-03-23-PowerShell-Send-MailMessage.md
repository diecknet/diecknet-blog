---
slug: "powershell-send-mailmessage"
title: "E-Mails per PowerShell verschicken mit Send-MailMessage"
date: 2025-03-23
tags: [powershell]
---
Es ist recht einfach E-Mails per PowerShell zu verschicken. Dafür gibt es das mitgelieferte Cmdlet `Send-MailMessage`, welches allerdings mittlerweile von Microsoft als veraltet bezeichnet wird:

> ⚠️ Warnung
>
> Das Cmdlet `Send-MailMessage` ist veraltet. Dieses Cmdlet garantiert keine sicheren Verbindungen mit SMTP-Servern. Es ist zwar kein sofortiger Ersatz in PowerShell verfügbar, es wird jedoch empfohlen, `Send-MailMessage` nicht zu verwenden. Weitere Informationen finden Sie unter [Plattformkompatibilitätshinweis DE0005](https://aka.ms/SendMailMessage).

Quelle: <https://learn.microsoft.com/de-de/powershell/module/microsoft.powershell.utility/send-mailmessage?view=powershell-7.5>

Für einige Szenarien ist die Verwendung von `Send-MailMessage` aber *meiner Meinung nach* trotzdem okay. Wenn ihr zum Beispiel einen eigenen SMTP-Server (z.B. Microsoft Exchange Server) betreibt oder angemietet habt (z.B. bei jedem beliebigen Webhoster), dann gibt es dort in der Regel gar keine Unterstützung für modernere Authentifizierungsmethoden. Ihr könnt einen solchen SMTP-Server natürlich auch zusätzlich zu einer Exchange Online Umgebung betreiben. Tendenziell würde ich empfehlen für solche automatischen E-Mails eher eine Subdomain (z.B. "reports.demotenant.de" statt einfach nur "demotenant.de") oder eine separate Domain zu verwenden, aber das ist natürlich kein Muss.

Falls ihr ausschließlich Exchange Online für den E-Mail-Versand verwendet bzw. verwenden wollt, dann ist das Cmdlet `Send-MailMessage` dafür nicht geeignet. Ich werde aber demnächst auch noch ein Video und einen Blog-Post zum Thema "E-Mail Versand per Microsoft Graph und PowerShell" machen. Wenn euch das interessiert, dann schaut demnächst auch hier vorbei und/oder abonniert [meinen YouTube Kanal](https://youtube.com/@diecknet).


## Beispiele

Hier sind ein paar Beispiele, die ich ganz nett fand. Ein paar weitere/andere Beispiele sind auch in der [Microsoft Dokumentation zu dem Cmdlet](https://learn.microsoft.com/de-de/powershell/module/microsoft.powershell.utility/send-mailmessage?view=powershell-7.5) zu finden. Ich demonstriere die Beispiele auch [hier in einem Video](https://youtu.be/zFDWjaKu2EQ).

## Hinweis zu Zugangsdaten

Ihr solltet keine Zugangsdaten im Klartext in eurem PowerShell Code ablegen. Jeder der den Code in die Hand bekommt, hätte dann auch die Zugangsdaten und könnte damit Unfug treiben.
Für einfache Testzwecke könnt ihr die Zugangsdaten interaktiv abfragen. Meine nachfolgenden Beispiele gehen davon aus, dass in der Variable `$Credential` ein PSCredential Objekt mit den Zugangsdaten steckt. Das könnt ihr wie folgt abfragen:

```powershell
# Abfrage der Zugangsdaten und speichern als PSCredential Objekt
$Credential = Get-Credential
```

Hier ist noch ein Video zum Thema "Zugangsdaten sicher im Code ablegen": <https://www.youtube.com/watch?v=C9bYPSWjCDY>

### Hinweis zu Encoding

Ich verwende hier in allen Beispielen explizit UTF8 als Encoding, um Probleme mit Sonderzeichen zu verhindern. Falls die Sonderzeichen bei euch nicht richtig dargestellt werden, schaut mal, ob euer PowerShell Skript auch im UTF8 Encoding gespeichert ist. Falls es dann immer noch nicht hinhaut, müsst ihr eventuell ein anderes Encoding wählen.

### Beispiel 1: Versand per TLS/SSL über Port 25

Ein einfaches Beispiel: Wir verschicken abgesichert per TLS/SSL (`-UseSSL`), aber über Port 25. Die Angabe des Ports ist damit eigentlich optional (`-Port 25`).
Die Zugangsdaten werden aus der Variable `$Credential` verwendet. 

```powershell
# Hinweis: Das Backtick am Ende der Zeile beachten! Die Parameter gehen also in
# der nächsten Zeile weiter.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MeinSMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hallo aus der PowerShell" -Body "Das hier ist der Inhalt der Mail" `
    -Encoding utf8
```

### Beispiel 2: Mehrzeilige E-Mails

Wenn ihr nur ganz kurze E-Mails verschicken wollt, dann kommt ihr vielleicht mit der Angabe des Texts direkt am Parameter aus. Falls ihr dabei einen Zeilenumbruch einfügen wollt, dann könnt ihr `` `r`n `` in euren Parameterwert für `-Body` schreiben. In der Regel würde ich aber den E-Mail-Text in einer Variable definieren und an das Cmdlet übergeben.
Mit folgender Schreibweise könnt ihr einfach einen mehrzeiligen String in PowerShell definieren:

```powershell
$EmailText = @"
Hallo,

das hier ist eine E-Mail.

Viele Grüße
PowerShell
"@

# Hinweis: Das Backtick am Ende der Zeile beachten! Die Parameter gehen also in
# der nächsten Zeile weiter.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MeinSMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hallo aus der PowerShell" -Body $EmailText `
    -Encoding utf8
```

### Beispiel 3: HTML E-Mails

Um eure E-Mails ein wenig hübscher zu gestalten, könnt ihr HTML verwenden. Damit das dann auch vom E-Mail-Client auf Empfängerseite richtig interpretiert wird, muss der Switch Parameter `-BodyAsHTML` angegeben werden. Der eigentliche Body (jetzt im HTML-Format) wird aber trotzdem per `-Body` angegeben.

```powershell
$EmailText = @"
<h1>Hallo,</h1>

<b>das</b> <u>hier</u> ist eine <i>E-Mail</i>.

Viele Grüße
PowerShell
"@

# Hinweis: Das Backtick am Ende der Zeile beachten! Die Parameter gehen also in
# der nächsten Zeile weiter.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MeinSMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hallo aus der PowerShell" -Body $EmailText -BodyAsHTML ` 
    -Encoding utf8
```

### Beispiel 4: PowerShell Array/Objekte zu HTML konvertieren

Richtig nützlich wird es natürlich erst, wenn ihr auch Daten per PowerShell sammelt oder generiert und die dann per E-Mail verschickt. Mit dem Cmdlet `ConvertTo-HTML` könnt ihr ein Array bzw. ein PowerShell Objekt zu HTML konvertieren. Im folgenden liste ich alle lokalen User am Computer auf, um so einen kleinen Report per PowerShell zu verschicken.
Beim Cmdlet `ConvertTo-HTML` verwende ich außerdem die Parameter `-Property` um die Eigenschaften auszuwählen (sonst werden alle genommen) und `-Fragment`, damit nur eine HTML-Tabelle generiert wird und nicht eine komplette Webseite (mit komplettem HTML-Gerüst).

```powershell
$HTMLTabelle = Get-LocalUser | ConvertTo-HTML -Property Name,SID -Fragment
$EmailText = @"
<h1>Hallo,</h1>

das hier ist ein Report über lokale User, generiert per PowerShell.

Viele Grüße
PowerShell
<hr>
$HTMLTabelle
"@

# Hinweis: Das Backtick am Ende der Zeile beachten! Die Parameter gehen also in
# der nächsten Zeile weiter.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MeinSMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hallo aus der PowerShell" -Body $EmailText -BodyAsHTML ` 
    -Encoding utf8
```

### Beispiel 5: Mehrere Empfänger, CC und BCC

Wenn ihr nicht nur normale Empfänger per `-To` Parameter verwenden wollt, sondern auch CC oder BCC, dann könnt ihr dafür die Parameter `-CC` bzw. `-BCC` verwenden.
Und bei allen 3 Parametern könnt ihr mehrere Empfänger eingeben, wenn ihr sie als Array angebt. Zum Beispiel so: `-To "hans.maulwurf@demotenant.de","alexw@demotenant.de"`.

```powershell
# Hinweis: Das Backtick am Ende der Zeile beachten! Die Parameter gehen also in
# der nächsten Zeile weiter.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MeinSMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de","alexw@demotenant.de" `
    -Subject "Hallo aus der PowerShell" -Body "Das hier ist der Inhalt der Mail" `
    -Encoding utf8 -CC "irgendjemand@demotenant.de" -BCC "beispiel@demotenant.de"
```

### Beispiel 6: E-Mail Anhänge

Um E-Mail Anhänge hinzuzufügen, könnt ihr den Pfad zur Datei am Parameter `-Attachment` angeben. Mehrere Anhänge sind auch möglich, wenn sie als Array angegeben werden, z.B. so: `-Attachment "Anhang1.docx","Anhang2.txt"`.

```powershell
# Hinweis: Das Backtick am Ende der Zeile beachten! Die Parameter gehen also in
# der nächsten Zeile weiter.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MeinSMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de","alexw@demotenant.de" `
    -Subject "Hallo aus der PowerShell" -Body "Das hier ist der Inhalt der Mail" `
    -Encoding utf8 -Attachment "Anhang.docx"
```
