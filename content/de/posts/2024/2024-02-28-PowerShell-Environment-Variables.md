---
slug: "powershell-environment-variables"
title: "PowerShell: Zugriff auf Umgebungsvariablen"
date: 2024-02-28
comments: true
tags: [powershell, environment variables, windows]
---

Per PowerShell auf Umgebungsvariablen zugreifen - das geht ganz einfach.  
**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://youtu.be/25-jcylahSo)**

## Umgebungsvariable per `$Env:`-Variable auslesen

Die einfachste Möglichkeit ist per `$Env:`-Variable. Gebt dafür einfach `$Env` ein, dann einen Doppelpunkt und dann den Namen der Umgebungsvariable von der ihr den Wert auslesen wollt.

```powershell
$Env:username
```

Dadurch wird der Username des aktuell angemeldeten Users ausgegeben.

[![Beispiel Ausgabe von $Env:username in der PowerShell - der aktuelle Username wird angezeigt](/images/2024/2024-02-28_PowerShell_ENV_1.jpg "Beispiel Ausgabe von $Env:username in der PowerShell - der aktuelle Username wird angezeigt")](/images/2024/2024-02-28_PowerShell_ENV_1.jpg)

Das funktioniert übrigens plattformübergreifend, also auch zum Beispiel unter Linux.

## Umgebungsvariablen per PSDrive auslesen

Die Umgebungsvariablen stehen auch als PSDrive - also als PowerShell Laufwerk zur Verfügung. Das heißt ihr könnt auch durch alle Umgebungsvariablen navigieren wie durch ein Dateisystem. Ihr könnt zum Beispiel per `Get-ChildItem` alle Umgebungsvariablen auflisten.

```powershell
Get-ChildItem Env:
```

Das ergibt eine nette Auflistung aller Umgebungsvariablen mit den dazugehörigen Werten. Auch das funktioniert plattformübergreifend, also zum Beispiel unter Linux.
[![Beispiel Ausgabe Get-ChildItem Env: in der PowerShell - die Umgebungsvariablen werden aufgelistet](/images/2024/2024-02-28_PowerShell_ENV_2.jpg "Beispiel Ausgabe Get-ChildItem Env: in der PowerShell - die Umgebungsvariablen werden aufgelistet")](/images/2024/2024-02-28_PowerShell_ENV_2.jpg)

## Scopes von Umgebungsvariablen

Unter Windows gibt es drei Bereiche für Umgebungsvariablen (Englisch: Scopes):

- Machine Scope (teilweise wird der auch System Scope genannt)
- User Scope
- Process Scope
  
Diese drei Scopes stellen eine Hierarchie dar und dementsprechend werden die gesetzten Werte herunter geerbt - es sei denn sie werden in einer niedrigeren Ebene überschrieben.
Im nachfolgenden Screenshot ist bei mir zum Beispiel systemweit die Variable "TEMP" auf `C:\Windows\Temp` gesetzt. Aber im User-Scope wird das überschrieben durch `C:\Users\diecknet\AppData\Local\Temp`.

[![Beispiel von Umgebungsvariablen - GUI und PowerShell nebeneinander](/images/2024/2024-02-28_PowerShell_ENV_3.jpg "Beispiel von Umgebungsvariablen - GUI und PowerShell nebeneinander")](/images/2024/2024-02-28_PowerShell_ENV_3.jpg)

Zusätzlich kann es aber auch auf Prozessebene überschrieben werden. In der PowerShell kann ich dafür einfach eine `$Env:`-Variable nehmen und einen anderen Wert zuweisen.

```powershell
$Env:TEMP = "C:\TEMP"
```

Für *diesen* PowerShell *Prozess* ist der Wert dann anders. **Untergeordnete Prozesse werden dann übrigens auch mit den geänderten Umgebungsvariablen gestartet.**  

Wenn wir jetzt aber eine Umgebungsvariable nicht nur für den aktuellen Prozess-Scope, sondern für den User-Scope oder den System-Scope anpassen wollen, dann geht es leider nicht so einfach wie eine normale Variablenzuweisung in der PowerShell.

## Setzen von Umgebungsvariablen in anderen Scopes

Zum Setzen von User-Scope beziehungsweise System-Scope Umgebungsvariablen können wir eine .NET Methode verwenden und zwar:

```powershell
[System.Environment]::SetEnvironmentVariable("Name","Wert","Scope")
```

Mögliche Werte für den Scope sind dann `Machine`, `User` oder `Process`. Wenn ihr eine systemweite Änderung (also von einer Variable im Machine-Scope) machen wollt, dann braucht ihr Admin-Rechte, sonst schlägt der Vorgang fehl.

```powershell
# Beispiel um eine Umgebungsvariable im Machine Scope zu setzen
[System.Environment]::SetEnvironmentVariable("Hallo","TEST","Machine")

# Beispiel um eine Umgebungsvariable im User Scope zu setzen
[System.Environment]::SetEnvironmentVariable("Hallo","TEST","User")
```

Hinweis: Wenn ihr eine Änderung für eine dieser beiden höheren Ebenen macht, dann wird das nicht automatisch runter geerbt auf den aktuellen schon laufenden PowerShell Prozess. Denn die Umgebungsvariablen werden beim Start des Prozesses geladen.

## Umgebungsvariable löschen

Falls ihr eine Umgebungsvariable löschen wollt, dann könnt ihr sie einfach auf einen leeren Wert setzen. Das geht sowohl mit der `$Env:`-Schreibweise, als auch mit der .NET Methode.

```powershell
# Löschen einer Umgebungsvariable per .NET Methode
[System.Environment]::SetEnvironmentVariable("Kanal","","User")

# Löschen einer Umgebungsvariable per $Env:-Schreibweise
$Env:Test123 = ""
# Löschen einer Umgebungsvariable per $Env:-Schreibweise (so geht's auch)
$Env:Test123 = $null
```
