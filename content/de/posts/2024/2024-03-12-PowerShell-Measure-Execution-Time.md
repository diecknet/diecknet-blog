---
slug: "powershell-measure-execution-time"
title: "Die Ausführungsdauer von PowerShell Code messen"
date: 2024-03-12
comments: true
tags: [powershell, measure, optimization, timespan]
---

Wenn ihr euren PowerShell Code auf Geschwindigkeit optimieren wollt, dann macht es Sinn Zeiten zu messen. Es gibt mehrere Möglichkeiten um zu messen, wie lange die Ausführung von einem Stück PowerShell Code dauert.  
**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://youtu.be/-tpR-KQpPq4)**

## Möglichkeit 1: Measure-Command

Eine einfache Möglichkeit ist das Cmdlet `Measure-Command`. Es nimmt einen ScriptBlock entgegen, der dann auch ausgeführt wird. Und wir erhalten im Anschluss ein Messergebnis in Form eines `TimeSpan` Objekts. Ein einfaches Beispiel dafür:

```powershell
Measure-Command { Get-Disk }
```

[![Messung per Measure-Command](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_1.jpg "Messung per Measure-Command")](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_1.jpg)

Aber wir können auch mehr messen, als nur einen einzelnen Befehl. Hier ein Beispiel bei dem ein längerer Code ausgeführt und gemessen wird.

```powershell
Measure-Command {
    ($i = 0; $i -lt 100; $i++) {
        "Hallo $i"
    }
}
```

[![Längere Messung per Measure-Command](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_2.jpg "Längere Messung per Measure-Command")](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_2.jpg)

Das zurückgegebene TimeSpan Objekt hat mehreren Eigenschaften. Ich würde hier in der Regel mit den Eigenschaften arbeiten, die mit "Total" anfangen - die zeigen nämlich die komplette Dauer. Aber die Zeitangaben ohne "Total" als Präfix können auch einen guten Überblick geben.

Was euch aber vielleicht aufgefallen ist: Die eigentliche Ausgabe von den Befehlen die wir messen - die ist gar nicht sichtbar. Zumindest die Ausgaben, die in die normalen Output Streams reingeschrieben werden. Eine Ausnahme wäre `Write-Host`. Denn `Write-Host` schreibt zwar auch in den Information Stream, aber sorgt auch dafür, dass die Ausgabe direkt an den Konsolenhost gesendet wird. Wenn ich also `Write-Host` innerhalb des `Measure-Command` Blocks verwende um Text auszugeben, dann funktioniert es.

```powershell
Measure-Command {
    for($i = 0; $i -lt 5; $i++) {
        Write-Host "Hallo $i"
    }
}
```

[![Text-Ausgabe per Write-Host bei Verwendung von Measure-Command](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_3.jpg "Text-Ausgabe per Write-Host bei Verwendung von Measure-Command")](/images/2024/2024-03-12_PowerShell_Execution_Time_Measure-Command_3.jpg)

Aber das ist auch nicht für alle Szenarien geeignet. Manchmal möchte man ja vielleicht ein komplettes Objekt ausgeben beziehungsweise die Rückgabe von einem Cmdlet direkt sehen, trotz Messung. In dem Fall ist die andere Methode besser geeignet.

## Möglichkeit 2: Stopwatch .NET Objekt

Eine andere Möglichkeit um Zeiten zu messen ist mit dem .NET Objekt `Stopwatch` - also zu deutsch Stoppuhr. Wenn wir jetzt die Ausführungsdauer von einem Stück PowerShell Code messen wollen, dann starten wir einfach davor die Stoppuhr und beenden sie nach dem Code. Anschließend können wir unser Ergebnis anzeigen.
Ich erstelle das Objekt mit einem Aufruf der Methode `StartNew()` aus der Klasse `System.Diagnostics.Stopwatch`. Damit wird in einem Schritt ein StopWatch Objekt erstellt und die Stoppuhr gestartet. Theoretisch könnte man auch erst das Objekt erstellen und dann den Messvorgang starten, aber ich finde es so besser, weil es weniger Code erfordert.
Anschließend nehmen wir unseren ganzen PowerShell Code der gemessen werden soll. Es ist hier **nicht notwendig** den Code noch mit geschweiften Klammern `{}` zu umschließen. Nach unserem eigentlichen Code rufen wir die `Stop()` Methode des Stopwatch Objekts auf. Dadurch ist die Messung aber nur beendet, das Ergebnis wird noch nicht angezeigt. Um das Ergebnis zu sehen, schauen wir uns die `Elapsed` Eigenschaft des StopWatch Objekts an. Das liefert uns wie auch schon die `Measure-Command` Funktion ein `TimeSpan` Objekt zurück. Auch hier finde ich die "Total" Eigenschaften praktischer, die die Gesamtdauer des Vorgangs repräsentieren.

```powershell
$StopWatch = [System.Diagnostics.Stopwatch]::StartNew()

"Wie lange dauert dieser Code wohl..?"

$StopWatch.Stop()
$StopWatch.Elapsed
```

[![Messung per .NET Stopwatch Objekt in PowerShell](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_1.jpg "Messung per .NET Stopwatch Objekt in PowerShell")](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_1.jpg)

## Mehrfach Messen ist sinnvoll

Egal welche der beiden Möglichkeiten ihr verwendet: Es macht Sinn nicht nur einmal zu messen, sondern mehrfach. Und je nachdem was ihr messt, können die Ergebnisse auch schon dadurch verfälscht sein, dass etwas zwischen gecached ist oder noch nicht gecached ist. Also zum Beispiel, wenn ihr ein Cmdlet verwendet, welches aus irgendeinem heruntergelandenen Modul kommt. Wenn ihr noch kein anderes Cmdlet aus dem Modul ausgeführt habt und das Modul nicht explizit geladen habt, dann versucht PowerShell erstmal das Cmdlet zu finden und dann wenn es das Modul gefunden hat, dann wird das Modul geladen. Und dann erst wird das Cmdlet ausgeführt. Dadurch kann dann die erste Ausführung von einem Befehl länger dauern, als alle weiteren späteren Ausführungen.
In den meisten Fällen fahrt ihr dann besser, wenn ihr das entsprechende Modul schon vorab mit `Import-Module` ladet und dann erst eure Messungen durchführt. Also um sicherzugehen, dass die Testergebnisse nicht verzerrt werden.
Hier mal ein kleines Beispiel wie man ein Stück Code mehrfach (1000 Mal!) testen könnte:

```powershell
<# 
    Ich verwende hier eine Generic List zum Speichern der Testergebnisse,
    die eignet sich besser dazu Daten aus einer Schleife hinzuzufügen.
#>
$AllTests = [System.Collections.Generic.List[PSObject]]::new()

for($i = 0; $i -lt 1000; $i++) {
    $StopWatch = [System.Diagnostics.Stopwatch]::StartNew()

    "Wie lange dauert dieser Code wohl..?"

    $StopWatch.Stop()
    $AllTests.Add($StopWatch.Elapsed)
}

# Einfache Übersicht mit Minimum, Maximum und Durchschnitt
$AllTests.TotalMilliseconds | Measure-Object -Average -Maximum -Minimum

```

[![Mehrfache Messung per .NET Stopwatch Objekt in PowerShell](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_2.jpg "Mehrfache Messung per .NET Stopwatch Objekt in PowerShell")](/images/2024/2024-03-12_PowerShell_Execution_Time_NET_Stopwatch_2.jpg)

Man kann die Daten bestimmt auch noch besser und sinnvoller aufbereiten, aber für einfache Szenarien hat mir das so immer ausgereicht.

## Weiterführende Links

- PowerShell Cmdlet `Measure-Command`: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/measure-command?view=powershell-5.1>
- .NET Klasse `StopWatch`: <https://learn.microsoft.com/de-de/dotnet/api/system.diagnostics.stopwatch.startnew?view=netframework-4.8.1>
