---
slug: "powershell-dot-sourcing"
title: "PowerShell Dot Sourcing"
date: 2024-03-26
comments: true
tags: [powershell]
---

Mit PowerShell Dot Sourcing könnt ihr eine Skriptdatei in eure PowerShell Session importieren. Das Skript wird erstmal normal ausgeführt, aber gesetzte Variablen, erstellte Funktionen und so weiter sind dann in der Session verfügbar. Bei einem normalen Skript-Aufruf ist das sonst nicht der Fall. Mich erinnert das immer an den PHP-Befehl `include`, weil ich in meiner Jugend mit PHP rumgedaddelt habe 😅

**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://youtu.be/TTnKAU-Po7Q)**

## Normaler Skript-Aufruf

Zum Vergleich: Normalerweise würde man ein Skript ja wie folgt ausführen. Entweder mit einem relativen Pfad oder mit einem absoluten Pfad.

```powershell
# Relativer Pfad
.\MeinSkript.ps1

# Absoluter Pfad:
& C:\diecknet\MeinSkript.ps1
```

Wenn das Skript "normal" ausgeführt wird, dann sehe ich zwar eventuelle Ausgaben des Skriptes, aber Funktionen oder Variablen aus dem Skript sind nicht mehr verfügbar. Im nachfolgenden Screenshot sind zum Beispiel die Funktion `Test-BeispielFunktion` und die Variable `$TestVariable` aus dem Skript nicht in der Session verfügbar.

[![Beispiel für einen normalen Skript-Aufruf: Variablen und Funktionen aus dem Skript sind NICHT in der Session verfügbar](/images/2024/2024-03-25_No_DotSourcing.jpg "Beispiel für einen normalen Skript-Aufruf: Variablen und Funktionen aus dem Skript sind NICHT in der Session verfügbar")](/images/2024/2024-03-25_No_DotSourcing.jpg)

## Aufruf per Dot Sourcing

Beim Dot Sourcing wird stattdessen ein Punkt und dann ein Leerzeichen vor den Pfad gesetzt. Auch beim Dot Sourcing kann sowohl ein relativer, als auch ein absoluter Pfad verwendet werden.

```powershell
# Relativer Pfad
. .\MeinSkript.ps1

# Absoluter Pfad:
. C:\diecknet\MeinSkript.ps1
```

Wenn ich das Skript per Dot Sourcing ausführe, dann wird *nicht nur* der Code ausgeführt, sondern alles in den **Global Scope** der PowerShell Session importiert. Also kann ich jetzt zum Beispiel auf eine im Skript definierte Funktion zugreifen, oder mir den Inhalt einer Variable anzeigen. Im nachfolgenden Screenshot sind beispielsweise die Funktion `Test-BeispielFunktion` und die Variable `$TestVariable` die im Skript definiert wurden auch danach noch in der Session verfügbar.

[![Beispiel für Dot Sourcing: Variablen und Funktionen aus dem Skript sind in der Session verfügbar](/images/2024/2024-03-25_DotSourcing_Example.jpg "Beispiel für Dot Sourcing: Variablen und Funktionen aus dem Skript sind in der Session verfügbar")](/images/2024/2024-03-25_DotSourcing_Example.jpg)

## Wann Dot Sourcing verwenden?

Ich verwende Dot Sourcing, wenn ich eine Funktion wiederverwenden möchte, ohne dafür direkt ein ganzes PowerShell Modul zu erstellen. Und das Importieren per Dot Sourcing funktioniert natürlich sowohl in der Konsole, als auch in Skriptdateien.

Übrigens: Visual Studio Code und die PowerShell ISE führen Code standardmäßig auch per Dot Sourcing aus. Deshalb ist dort auch zum Beispiel der Inhalt von Variablen nach der Ausführung des Codes verfügbar.
