---
comments: true
aliases:
    - powershell-task-scheduler
slug: PowerShell-Task-Scheduler
title: PowerShell-Skript mit der Windows-Aufgabenplanung ausführen
subtitle: Der Parameter, den ich ständig vergessen habe, ist '-file'
tags: [powershell, windows, task scheduler]
cover:
    image: /images/2021/2021-10-13_TaskScheduler_PowerShell_Script.png
imageAlt: Ein Screenshot der Aktionskonfiguration einer geplanten Windows-Aufgabe zum Ausführen eines PowerShell-Skripts.
date: 2021-10-13
---

Eine kurze Notiz für mich selbst - wie ich ein PowerShell-Skript mit der Windows-Aufgabenplanung ausgeführt habe.

## Aufgabenplanung öffnen

Ein schneller Weg, die Aufgabenplanung zu öffnen:
`[WIN]` + `R`, dann `taskschd.msc` ausführen.

## Neue Aufgabe erstellen

"Aufgabenplanungsbibliothek" → "Neue Aufgabe erstellen" öffnen.
Alle selbsterklärenden Optionen wie Name, Beschreibung, Benutzerkonto, Trigger usw. setzen.

## Aktion festlegen

| Setting                  | Value                      |
| ------------------------ | -------------------------- |
| Action                   | Start a program            |
| Program/script           | `powershell.exe`             |
| Add arguments (optional) | `-file "C:\Path\Script.ps1"` |
