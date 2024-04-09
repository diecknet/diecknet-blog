---
slug: "powershell-suppress-output"
title: "PowerShell Ausgabe unterdrücken"
date: 2024-04-09
comments: true
tags: [powershell]
---

Manchmal geben PowerShell Befehle eine Rückmeldung aus, obwohl uns das gar nicht interessiert. Es gibt verschiedene Szenarien, wie ihr die Ausgaben unterdrücken könnt.
Ich verwende hier zum Beispiel das Cmdlet `New-NetFirewallRule` mit dem ich eine neue Regel in der Windows Firewall hinzufügen kann:

```powershell
New-NetFirewallRule -DisplayName "Ausgehende Verbindungen zu Port 443 blockieren" -Direction Outbound -RemotePort 443 -Protocol TCP -Action Block
```

[![Beispiel für eine exzessive Rückgabe von Informationen durch ein PowerShell Cmdlet: Der Aufruf von New-NetFirewallRule](/images/2024/2024-04-09_PowerShell_new-netfirewallrule_example.jpg "Beispiel für eine exzessive Rückgabe von Informationen durch ein PowerShell Cmdlet: Der Aufruf von New-NetFirewallRule")](/images/2024/2024-04-09_PowerShell_new-netfirewallrule_example.jpg)

Wenn ich das ausführe, dann kriege ich als Rückgabe ein Objekt, welches die Firewall Regel repräsentiert. Wenn man das in einem Skript weiterverarbeiten möchte ist es natürlich sinnvoll. Manchmal braucht man die Info aber nicht.

## `$null` vs. `Out-Null`

Ich würde das jetzt am ehesten unterdrücken, indem ich die automatische vordefinierte Variable `$null` verwende und ihr die Rückgabe des Befehls zuweise. `$null` ist read-only, erhält dadurch also nicht wirklich einen anderen Wert zugewiesen.

```powershell
$null = New-NetFirewallRule -DisplayName "Ausgehende Verbindungen zu Port 443 blockieren" -Direction Outbound -RemotePort 443 -Protocol TCP -Action Block
```

Eine Alternative dazu wäre, das Ergebnis des Befehls an das Cmdlet `Out-Null` zu pipen.

```powershell
New-NetFirewallRule -DisplayName "Ausgehende Verbindungen zu Port 443 blockieren" -Direction Outbound -RemotePort 443 -Protocol TCP -Action Block | Out-Null
```

[![2 Möglichkeiten die Ausgabe eines PowerShell Befehls zu unterdrücken: Mit $null und Out-Null](/images/2024/2024-04-09_PowerShell_hide_output_example_1.jpg "2 Möglichkeiten die Ausgabe eines PowerShell Befehls zu unterdrücken: Mit $null und Out-Null")](/images/2024/2024-04-09_PowerShell_hide_output_example_1.jpg)

Ich habe die Erfahrung gemacht, dass die Zuweisung zu `$null` performanter arbeitet als das Pipen zu `Out-Null`. Das liegt daran, dass die Ausführung der Pipe immer eine Auswirkung auf die Performance hat. In manchen Fällen macht es keinen Unterschied, oder nur einen kleinen - in anderen Fällen ist es gravierender.

Beides ist aber auf jeden schneller als das Objekt immer sichtbar auszugeben. Es kommt natürlich auch immer auf das Cmdlet und das ausgegebene Objekt an, aber bei mir war es reproduzierbar einige Millisekunden langsamer, wenn ich die erstellte Firewall-Regel sichtbar ausgeben lasse.

[![Messwerte von unterschiedlich unterdrückter Ausgabe und nicht-unterdrückter Ausgabe](/images/2024/2024-04-09_PowerShell_suppress-output-comparison.jpg "Messwerte von unterschiedlich unterdrückter Ausgabe und nicht-unterdrückter Ausgabe")](/images/2024/2024-04-09_PowerShell_suppress-output-comparison.jpg)

## Fehler unterdrücken

Es kann aber auch sein, dass euer Cmdlet Fehler ausgibt. Wenn euch die nicht interessieren und ihr einfach weiter machen wollt, dann könnt ihr probieren den Common Parameter `-ErrorAction` auf `SilentlyContinue` zu setzen.

```powershell
$null = New-Item C:\diecknet\Hallo\Welt -Type Directory -ErrorAction SilentlyContinue
```

Das funktioniert aber nicht mit allen Cmdlets und nicht mit allen Fehlern. Manche Fehler sind so gravierend, dass nicht einfach mit `SilentlyContinue` fortgefahren werden kann. In so einem Fall könnt ihr versuchen mit einem `try-catch` Konstrukt den Fehler abzufangen.

```powershell
<# Grundsätzliches zu try-catch:
Im try Block steht der Code, dessen Fehler abgefangen werden soll. 
Am besten möglichst wenig Code in den try Block schreiben, also quasi 1-2
Befehle die zusammengehören. Nicht aber das ganze Skript in einen Try-Block schreiben.
#>

try {
    Dieser-Befehl-existiert-nicht
} catch {}
```

Normalerweise würde man den Fehler im `catch` Block versuchen abzumildern. Also irgendwelche Maßnahmen ergreifen die dafür sorgen, dass es nicht so schlimm ist, dass ein Fehler aufgetreten ist. Wenn es uns aber nur darum geht, eine Fehler*ausgabe* zu verhindern, dann können wir den `catch` Block auch leer lassen. Am besten natürlich kombiniert mit der Unterdrückung der regulären Ausgabe.

```powershell
try {
    $null = Dieser-Befehl-existiert-nicht
} catch {}
```

## Alle Ausgaben unterdrücken

In manchen Situationen gibt es aber auch noch mehr Ausgaben als die Standard Ausgabe oder vielleicht noch Fehlermeldungen. Die PowerShell hat nämlich einige weitere Output Streams.

| Stream ID | Beschreibung           | Verfügbar ab   | Write Cmdlet        |
| --------- | ---------------------- | -------------- | ------------------- |
| 1         | **Success** Stream     | PowerShell 2.0 | `Write-Output`      |
| 2         | **Error** Stream       | PowerShell 2.0 | `Write-Error`       |
| 3         | **Warning** Stream     | PowerShell 2.0 | `Write-Warning`     |
| 4         | **Verbose** Stream     | PowerShell 2.0 | `Write-Verbose`     |
| 5         | **Debug** Stream       | PowerShell 2.0 | `Write-Debug`       |
| 6         | **Information** Stream | PowerShell 5.0 | `Write-Information` |
| n/a       | **Progress** Stream    | PowerShell 2.0 | `Write-Progress`    |

Ich will jetzt hier nicht zu tief auf die einzelnen Output Streams eingehen, schaut dafür am besten das [Video zu PowerShell Output Streams auf meinem YouTube Kanal](https://www.youtube.com/watch?v=tpzQA3F9O_s) an. Stattdessen zeige ich euch kurz und knapp wie ihr alle Output Streams unterdrücken könnt.
Hier habe ich ein Beispiel Skript, welches in verschiedene Output Streams schreibt:

```powershell
# Filename: Multi-Output-Beispiel.ps1
function Get-MultipleOutputs {
    $DebugPreference = "Continue"
    $WarningPreference = "Continue"
    $VerbosePreference = "Continue"
    Write-Verbose "Preference Variablen gesetzt."
    Write-Debug "Hallöchen aus dem Debug Stream :)"
    Write-Warning "Ohje, ohje eine Warnung! Was sollen wir nur tun?"
    Write-Verbose "Beispiel-Ausgabe abgeschlossen..."
}

Get-MultipleOutputs
```

Um die Ausgabe von allen Output Streams zu verhindern, können wir an das Ende einer Zeile beziehungsweise eines Befehls `*>$null` anhängen. Also das kann für folgende Fälle genutzt werden:

-   Ein ganzes Skript: `.\Multi-Output-Beispiel.ps1 *>$null`
-   Einen einzelnen Befehl, also zum Beispiel ein Cmdlet: `Get-MultipleOutputs *>$null`
-   Und auch für native Commands also z.B. irgendwelche `.exe` Programme die in der Commandline/PowerShell ausgeführt werden können: `ping localhost *>$null`

## Schlusswort

Natürlich ist es oft besser die Rückgaben von Cmdlets zu beachten und im Code darauf zu reagieren. Dennoch gibt es Fälle, bei denen eine Ausgabe nicht notwendig ist. Wenn das bei euch mal der Fall sein sollte, dann wisst ihr jetzt wie ihr die Ausgabe unterdrücken könnt.
