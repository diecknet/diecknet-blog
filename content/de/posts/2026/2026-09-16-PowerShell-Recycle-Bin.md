---
slug: "powershell-recycle-bin"
title: "Leeren des Papierkorbs mit PowerShell"
date: 2026-09-16
tags: [powershell, windows]
---

Wenn ihr den Windows-Papierkorb automatisiert leeren möchtet, könnt ihr dafür PowerShell verwenden. In diesem Beitrag zeige ich euch, wie das geht.

Ich demonstriere alles, was hier erwähnt wird, auch [in diesem Video auf YouTube](https://youtu.be/BiIrZsEvz5c).

## Warum überhaupt?

Ich will nicht so tun, als ob das Leeren des Papierkorbs mit PowerShell besser sei als die Verwendung der grafischen Oberfläche. Aber mit PowerShell könnt ihr es automatisieren. Zum Beispiel als Teil eines eigenen System-Aufräum-Skripts.

## Hinweis: Funktioniert nur unter Windows

Der hier gezeigte Code funktioniert nur unter Windows.

## Papierkorb des aktuellen Benutzers leeren

Der folgende Code leert den Papierkorb des aktuellen Benutzers:

```powershell
Clear-RecycleBin
```

Optional könnt ihr noch den Parameter `-Force` hinzufügen, um zusätzliche Bestätigungsaufforderungen zu unterdrücken:

```powershell
Clear-RecycleBin -Force
```

Wenn ihr mehrere Laufwerke auf eurem Computer habt, möchtet ihr eventuell nur den Papierkorb eines bestimmten Laufwerks leeren:

```powershell
Clear-RecycleBin -DriveLetter E -Force
```

## Papierkorb aller Benutzer leeren

Leider leert das Cmdlet `Clear-RecycleBin` nur den Papierkorb des aktuellen Benutzers. Wenn ihr den Papierkorb aller Benutzer auf dem System leeren möchtet, müsst ihr mit dem Dateisystem arbeiten.

Falls ihr es nicht wisst: Der Papierkorb wird in einem Ordner namens `$Recycle.Bin` gespeichert, der im Stammverzeichnis des Laufwerks liegt (jeweils einer pro Laufwerk).
Da das Dollarzeichen als Variablenzeichen interpretiert wird, müssen wir für den Pfad statt `"` einfache Anführungszeichen `'` verwenden.

```powershell
Remove-Item 'C:\$Recycle.Bin' -Force -Recurse
```

Und wenn ihr andere Laufwerke habt, könnt ihr die Papierkörbe dort entweder mit einem hart-coded Pfad leeren, z.B. so:

```powershell
Remove-Item 'E:\$Recycle.Bin' -Force -Recurse
```

Oder ihr macht es automatisch für alle Laufwerke, indem ihr die PowerShell Pipeline nutzt um mehrere Cmdlets miteinander zu kombinieren. Zum Beispiel habe ich dafür dieses Snippet geschrieben:

```powershell
Get-Volume | 
    Where-Object {$_.DriveLetter -and $_.DriveType -ne "CD-ROM"} | 
    ForEach-Object { Remove-Item "$($_.DriveLetter):\`$Recycle.Bin -Force -Recurse }
```
