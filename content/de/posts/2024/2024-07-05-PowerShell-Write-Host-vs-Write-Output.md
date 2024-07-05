---
slug: "powershell-write-host-vs-write-output"
title: "PowerShell Write-Host VS. Write-Output"
date: 2024-07-05
comments: true
tags: [powershell]
---
In PowerShell könnt ihr ja Text mit dem Cmdlet `Write-Host` ausgeben. Aber es wird teilweise davon abgeraten das zu verwenden. Es gibt zum Beispiel die Alternative `Write-Output`. In diesem Post erkläre ich euch die Unterschiede.

**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://www.youtube.com/watch?v=eHBO4b_Riho)**  

## Write-Host

`Write-Host` gibt Daten auf dem PowerShell **Host** aus, dem Programm, welches die aktuelle PowerShell Sitzung hostet. Oft ist das der `ConsoleHost`, aber z.B. die PowerShell ISE oder Visual Studio Code verwenden eigene Hosts, die sich in manchen Aspekten voneinander unterscheiden.

[![Beispiel für andere PowerShell Hosts: Visual Studio Code und PowerShell ISE](/images/2024/2024-07-05_Other_PSHosts.jpg "Beispiel für andere PowerShell Hosts: Visual Studio Code und PowerShell ISE")](/images/2024/2024-07-05_Other_PSHosts.jpg)

`Write-Host` kann die Art und Weise beeinflussen, wie die Daten vom PowerShell Host ausgegeben werden. Zum Beispiel kann mit `-ForegroundColor` die Textfarbe und mit `-BackgroundColor` die Hintergrundfarbe angepasst werden. 
Also wenn ihr ein Skript interaktiv in einer Konsole ausführt, dann kann `Write-Host` durchaus nützlich sein um eine ansprechendere Ausgabe zu ermöglichen.
Ein ganz großer Nachteil ist allerdings: Daten die per `Write-Host` ausgegeben werden, können dann nicht in der Pipeline weiterverarbeitet werden.

Also das Ergebnis kann z.B. nicht in eine Variable gespeichert werden:

```powershell
$Variable = Write-Host "Hallo PowerShell"
# Rückgabe: Hallo PowerShell

$Variable
# = keine sichtbare Rückgabe
```

Und auch nicht an andere Cmdlets gepiped werden:

```powershell
Write-Host "C:\temp" | Get-ChildItem
# Rückgabe: C:\temp (und nicht der Inhalt von C:\temp !)
```

## Write-Output

`Write-Output` hingegen *kann* weiterverarbeitet werden:

```powershell
$Variable = Write-Output "Hallo PowerShell"
$Variable
# Rückgabe: Hallo PowerShell

Write-Output "C:\temp" | Get-ChildItem
# Rückgabe: < Inhalt von C:\temp ... >
```

Dafür fehlen dann aber die Möglichkeiten zur Formatierung, die `Write-Host` hat.

## Wann was verwenden?

Es ist vorteilhaft die Unterschiede zwischen `Write-Host` und `Write-Output` zu kennen und zu nutzen. Also z.B. wenn ihr in einem Skript die Rückgabe von einem ScriptBlock wie z.B. aus einer Schleife in eine Variable speichert, dann würden Ausgaben per `Write-Output` höchstwahrscheinlich euer Ergebnis-Array mit unnötigen Einträgen verunreinigen. Wenn ihr dann aber `Write-Host` verwendet, dann könnt ihr eine Ausgabe erzeugen, ohne dass diese im Ergebnis-Array landet.

```powershell
$Ps1Files = Get-ChildItem *.ps1 -Recurse
$Ergebnis = foreach($File in $Ps1Files) {
    $File.FullName # Das wird an die Schleife ausgegeben
    Write-Host "$($File.Name)" -NoNewLine -ForeGroundColor Yellow
    Write-Host " gefunden..."
}
```

[![Ergebnis des vorangegangenem Codes: Bunte Ausgabe per Write-Host und Befüllung einer Variable](/images/2024/2024-07-05_Write-Host-in-a-Loop.jpg "Ergebnis des vorangegangenem Codes: Bunte Ausgabe per Write-Host und Befüllung einer Variable")](/images/2024/2024-07-05_Write-Host-in-a-Loop.jpg)

Oder wenn ihr ein Skript in Azure Automation ausführt, dann landen Ausgaben die per `Write-Host` erzeugt werden **nicht** in den Logs. Wenn ihr Skripte für Azure Automation erzeugt, dann müsst ihr also `Write-Output` statt `Write-Host` verwenden. 

```powershell
# Azure Automation Beispielcode
Write-Output "Azure Automation verwendet übrigens einen weiteren PowerShell Host"
Get-Host

Write-Host "Ausgaben per Write-Host sind in Azure Automation nicht sichtbar"
```

[![Ausführung des vorangegangenem PowerShell Runbooks in Azure Automation: Ausgabe wird per Write-Output bzw. durch ein beliebiges Cmdlet erzeugt. Ausgabe per Write-Host ist nicht sichtbar](/images/2024/2024-07-05_Write-Output-in-Azure-Automation.jpg "Ausführung des vorangegangenem PowerShell Runbooks in Azure Automation: Ausgabe wird per Write-Output bzw. durch ein beliebiges Cmdlet erzeugt. Ausgabe per Write-Host ist nicht sichtbar")](/images/2024/2024-07-05_Write-Output-in-Azure-Automation.jpg)

### Write-Output ist eigentlich optional

Wenn ihr jetzt denkt, dass tendenziell `Write-Output` zu bevorzugen ist: Ihr müsst eigentlich auch nicht mal `Write-Output` verwenden. Ihr könnt nämlich auch einfach direkt euer gewünschtes Objekt - sei es aus einer Variable oder einem Cmdlet oder sonst wie - im Code referenzieren und dann wird es ausgegeben. Also vorteilhaft ist dann vielleicht nur, dass ein kleines bisschen einfacher ersichtlich ist "Hey hier wird ganz bewusst eine Ausgabe im Code erzeugt".

```powershell
Write-Output "Hallo :)"
# Rückgabe: Hallo :)
```

## Hinweis zu Output Streams

Abgesehen von `Write-Output` und `Write-Host` gibt es auch noch weitere Ausgabe Cmdlets, wie z.B. `Write-Information`, `Write-Error`, `Write-Warning` und so weiter. Ihr könntet damit Ausgaben erzeugen und sie in verschiedene Output Streams leiten. Die Person die das Skript dann am Ende ausführt kann dann selbst entscheiden welche Infos (sprich: welche Streams) sie sehen möchte. Interessanterweise schreibt `Write-Host` nicht nur direkt in den Konsolenhost, sondern auch in den Information Stream.
Wenn ihr mehr zu dem Thema wissen wollt, dann schaut mal [dieses Video hier zu PowerShell Output Streams an](https://www.youtube.com/watch?v=tpzQA3F9O_s).

## Fazit

Zusammengefasst würde ich sagen:
`Write-Host` gibt Infos vorallem visuell aus für den User in der Konsole. `Write-Output` ist unabhängig davon und gibt Infos innerhalb der PowerShell Pipeline weiter. Wenn `Write-Output` der letzte Befehl in einer Pipeline ist, dann wird die Info sichtbar ausgegeben und kann dann durch andere Logging-Funktionalitäten besser aufgefangen werden.
