---
slug: "powershell-array-plus"
title: "Das Problem mit Array += in PowerShell"
date: 2024-09-12
comments: true
tags: [powershell]
---

Die PowerShell macht es leider recht einfach ineffizienten Code zu schreiben. Viele Leute benutzen zum Beispiel die `+=` Schreibweise um ein Array zu befüllen. Nicht empfehlenswert!

```powershell {hl_lines=[4]}
# So bitte nicht machen!
$Array = @()
for ($i = 0; $i -lt 10000; $i++) {
    $Array += $i
}
```

Mit `Measure-Command` können wir messen, wie lange die Ausführung eines Skriptblocks dauert. Bei mir hat die Ausführung des obigen Codes in einer Test-VM über 2 Sekunden benötigt.

[![Das Ergebnis von Measure-Command: TotalMilliSeconds 2260](/images/2024/2024-09-12_Measure-Command1.jpg "Das Ergebnis von Measure-Command: TotalMilliSeconds 2260")](/images/2024/2024-09-12_Measure-Command1.jpg)

## Ursache

Die Ursache ist, dass Arrays in PowerShell eigentlich statisch sind. Sie können nicht *wirklich* um neue Einträge ergänzt werden. Stattdessen wird der Inhalt vom Array kopiert, um den neuen Eintrag ergänzt und in einem neuen Array Objekt gespeichert. Meistens wird das alte Array dann in die gleiche Variable gespeichert, wie das alte Array - deshalb ist dieser Vorgang nicht richtig sichtbar und wird nicht bemerkt.

## Alternativen

Es gibt verschiedene Alternativen zur `+=` Methode.

### Pipeline abfangen

Wenn die Daten im Array nur einmalig angelegt werden sollen, aber nicht verändert werden müssen, dann bevorzuge ich folgendes. Ich nehme meine Variable in der ich das Array speichern möchte, und weise als Inhalt einfach die Rückgabe meiner Schleife zu. Innerhalb der Schleife erfolgt dann gar keine Zuweisung, sondern nur das Ausgabe eines Objekts. Die initialisierung der Variable als Array z.B. per `$MeinArray = @()` ist in dem Fall auch nicht nötig.

```powershell
# $MeinArray erhält als Inhalt die Rückgabe der Schleife
$MeinArray = for ($i = 0; $i -lt 10000; $i++) {
    $i # Diese Rückgabe landet automatisch in der Variable $MeinArray
}
```

### Generic List

Wenn die Daten auch geändert werden sollen, ist eine Generic List praktisch. Diese muss per .NET Methode initialisiert werden, was minimal komplizierter als normale PowerShell Cmdlets ist. Aber der Code kann natürlich auch einfach kopiert werden, deshalb spielt es nicht wirklich eine Rolle.

```powershell
$List = [Collections.Generic.List[PSObject]]::new()
for ($i = 0; $i -lt 10000; $i++) {
    $List.Add($i)
}
```

Ich zeige das auch noch mit mehr Details in [einem Video im kostenlosen PowerShell Kurs](https://www.youtube.com/watch?v=tCJyYLgiSZA).

### Weitere Alternativen

Es gibt auch noch weitere Alternativen, wie z.B. Hashtables.

```powershell
$MeineHashtable = @{"Hallo"="Hallo PowerShell"}
# Verschiedene Varianten um Daten zur Hashtable hinzuzufügen
$MeineHashtable["hi"] = "Hi PowerShell :)"
$MeineHashTable.Add("moin","MOIN MOIN!")
```

## Verbesserungen ab PowerShell 7.5

Ab PowerShell 7.5 (erscheint voraussichtlich im November 2024) ist die Problematik aber etwas [entschärft](https://github.com/PowerShell/PowerShell/pull/23901). Die `+=` Methode funktioniert dort weitaus schneller als in bisherigen PowerShell Versionen. 100%ig ideal ist sie trotzdem nicht, da weiterhin Daten unnötig im Arbeitsspeicher hin und her kopiert werden müssen.

[![+= ist weitaus schneller in PowerShell 7.5, als in bisherigen Versionen. Hier 55ms statt 2768ms.](/images/2024/2024-09-12_Measure-Command2.jpg "+= ist weitaus schneller in PowerShell 7.5, als in bisherigen Versionen. Hier 55ms statt 2768ms.")](/images/2024/2024-09-12_Measure-Command2.jpg)

## Geschwindigkeit messen

Mit folgendem Code habe ich die Geschwindigkeit von `+=` vs. Generic Lists gemessen. Wobei der Testcode für "Allocated Memory" nur in PowerShell 7 funktioniert, nicht in Windows PowerShell 5.1.

```powershell
#Requires -Version 7.4
$Host.UI.RawUI.WindowTitle = $PSVersionTable.PSVersion
Write-Host "Using PowerShell $($PSVersionTable.PSVersion)" -ForegroundColor DarkYellow
"--------------------------------------"

#region Test Array +=
$s = [gc]::GetTotalAllocatedBytes($true)

$Time = (Measure-Command {
    &{
        $val = @()
        for ($i = 0; $i -lt 10000; $i++) {
            $val += $i
        }
    }
}).TotalMilliseconds

$e = [gc]::GetTotalAllocatedBytes($true);
$RAM = [math]::Round(($e-$s)/1MB,2)

Write-Host "Using += took $($Time)ms"
Write-Host "Allocated Memory $($RAM)MB"
#endregion

"--------------------------------------"

#region Test List

$s = [gc]::GetTotalAllocatedBytes($true)

$Time = (Measure-Command {
    &{
        $List = [Collections.Generic.List[PSObject]]::new()
        for ($i = 0; $i -lt 10000; $i++) {
            $List.Add($i)
        }
    }
}).TotalMilliseconds

$e = [gc]::GetTotalAllocatedBytes($true);
$RAM = [math]::Round(($e-$s)/1MB,2)

Write-Host "Using List.Add() took $($Time)ms"
Write-Host "Allocated Memory $($RAM)MB"
#endregion
```
