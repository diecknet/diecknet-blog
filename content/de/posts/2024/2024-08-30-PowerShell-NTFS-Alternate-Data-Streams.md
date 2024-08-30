---
slug: "powershell-ntfs-alternate-data-streams"
title: "PowerShell NTFS Alternate Data Streams"
date: 2024-08-30
comments: true
tags: [powershell, ntfs]
draft: true
---
Das Dateisystem NTFS wird standardmäßig unter Windows verwendet. Und normalerweise hat eine Datei nur einen dazugehörigen normalen Datenstrom (Data Stream) mit dem Namen `:$DATA`. Aber es gibt auch die sogenannten "Alternate Data Streams" (ADS), die zusätzliche Daten enthalten können.

Diese ADS werden teilweise vom System verwendet, könnten aber auch von Angreifern verwendet werden, um Daten zu verstecken.

## NTFS Alternate Data Stream auslesen

Aus dem Internet heruntergeladene Dateien erhalten bei vielen Browsern unter Windows ein "Mark of the web" (MOTW) im `Zone.Identifier` Stream. Dieser Stream enthält Infos zur Quelle der Datei - also z.B. dass sie aus dem Internet heruntergeladen wurde.
Um den Inhalt eines ADS auszulesen, kann einfach `Get-Content` mit dem Parameter `-Stream` und der Angabe des Streamnamens verwendet werden. Alternativ kann an den Dateinamen `:<Name des Streams>` angehängt werden.

```powershell
# Zwei Varianten um den Zone.Identifier Stream auszulesen
Get-Content .\Beispiel.txt -Stream Zone.Identifier
Get-Content .\Beispiel.txt:Zone.Identifier

# Rückgabe
[ZoneTransfer]
ZoneId=3
ReferrerUrl=https://diecknet.de
HostUrl=https://github.com
```

Der tatsächliche Inhalt von `Zone.Identifier` kann abweichen. Mal sind mehr oder weniger Infos enthalten. Die Info zur `ZoneId` sollte aber immer enthalten sein. Folgende Werte sind für die Zone möglich:

| Wert  | Bedeutung             |
|-------|-----------------------|
| 0     | My Computer           |
| 1     | Local Intranet Zone   |
| 2     | Trusted sites Zone    |
| 3     | Internet Zone         |
| 4     | Restricted Sites Zone |

Quelle: <https://learn.microsoft.com/en-us/previous-versions/troubleshoot/browsers/security-privacy/ie-security-zones-registry-entries#zones>

Der Windows Smartscreen Filter legt teilweise auch noch einen eigenen ADS namens `SmartScreen` an. Wenn dort `Anaheim` als Inhalt steht, wurde die Datei als unsicher eingestuft.

```powershell
Get-Content .\Beispiel.exe -Stream Smartscreen

# Rückgabe
Anaheim
```

Und falls es irgendwelche komplett anderen Streams gibt, könnt ihr sie natürlich mit der gleichen Vorgehensweise auslesen.

### Mark of the web entfernen

Der reguläre Weg um das "Mark of the web" zu entfernen ist per `Unblock-File` oder per Eigenschaften Dialog der Datei.

```powershell
Unblock-File .\MeineDatei.docx
```

[![Setzen des Hakens 'Zulassen' in den Dateieigenschaften entfernt das Mark of the web](/images/2024/2024-08-30_NTFS_ADS_EigenschaftenDialog.jpg "Setzen des Hakens 'Zulassen' in den Dateieigenschaften entfernt das Mark of the web")](/images/2024/2024-08-30_NTFS_ADS_EigenschaftenDialog.jpg)

## NTFS Alternate Data Streams finden

Um herauszufinden, welche Alternate Data Streams vorhanden sind, kann der Parameter `-Stream` vom Cmdlet `Get-Item` genutzt werden. Mit `*` als Platzhalter können wir alle ADS finden.

```powershell
# Alle Streams von allen Daten im aktuellen Verzeichnis auflisten
Get-Item * -Stream *
```

Die Info, dass der Standard `:$DATA` Stream vorhanden ist, können wir aber auch wegfiltern:

```powershell
Get-Item * -Stream * | Where-Object {$_.Stream -ne ':$DATA' }
```

Noch etwas flexibler geht es mit [dem Skript `Get-NTFSADS.ps1`](https://github.com/diecknet/diecknet-scripts/blob/main/Windows/Get-NTFSADS.ps1) welches ich auf GitHub veröffentlicht habe.

## NTFS Alternate Data Streams schreiben

Es ist möglich eigene Daten in ADS reinzuschreiben. Dafür kann z.B. `Set-Content`/`Add-Content` verwendet werden.

```powershell
# Zwei Varianten um den Beispiel Stream zu setzen, ggf. wird er überschrieben
Set-Content .\MeineDatei.docx -Stream "Beispiel" -Value "Hallo PowerShell!"
Set-Content .\MeineDatei.docx:Beispiel -Value "Hallo PowerShell!"

# Zwei Varianten um den Beispiel Stream zu ergänzen
Add-Content .\MeineDatei.docx -Stream "Beispiel" -Value "Hallo PowerShell!"
Add-Content .\MeineDatei.docx:Beispiel -Value "Hallo PowerShell!"
```

## NTFS Alternate Data Streams löschen

ADS können wie normale Dateien auch per `Remove-Item` gelöscht werden. Die Datei und der `:$DATA` Stream würden im folgenden Beispiel weiter existieren:

```powershell
Remove-Item .\MeineDatei.docx -Stream "Beispiel"
```

## Fazit

NTFS Alternate Data Streams sind eine interessante Funktion. Als Einfallstor für Angreifer sind sie weniger geeignet, da bei einem normalen Download keine zusätzlichen Data Streams übermittelt werden können. Aber in manchen Containerformaten könnten auch ADS übertragen werden, wie z.B. innerhalb von `.vhdx`-Dateien für virtuelle Festplattenabbilder. Allerdings wäre die Verwendung eines ADS-fähigen Containers auch schon sehr auffällig.

Ich denke, dass ADS dann eher von Angreifern verwendet werden könnten, wenn sie sich bereits in einem System eingenistet haben. Dann könnten Schadcodes oder andere Daten versteckt werden. Allerdings sollten (meiner Meinung nach) moderne EDR Lösungen anschlagen, falls ADS verwendet werden - technisch möglich wäre es z.B. per Sysmon Logging.
