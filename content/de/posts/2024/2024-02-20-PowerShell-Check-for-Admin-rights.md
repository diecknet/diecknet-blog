---
slug: "powershell-check-admin-rights"
title: "PowerShell: Überprüfen ob Admin-Rechte vorhanden sind"
date: 2024-02-20
comments: true
tags: [powershell, security identifiers, windows, admin rights]
cover: 
    image: "/images/2024/2024-02-20_PowerShell_UAC_Deutsch.jpg"
---

Wenn ihr ein PowerShell Skript erstellt habt, was Aktionen ausführen soll, die Adminrechte erfordern, dann könnt ihr das auch per Code überprüfen. Damit könnt ihr sicherstellen, dass euer Skript erfolgreich ausgeführt werden kann. Am einfachsten geht das mit einer `Requires`-Anweisung.
**[🎬 Ich habe übrigens auch ein Video zu dem Thema erstellt.](https://youtu.be/ACUCARq7joM)**

## Admin-Rechte per Requires Anweisung erfordern

```powershell
#Requires -RunAsAdministrator
```

Diese Zeile kann an eine beliebigen Stelle im PowerShell Code eingefügt werden. Ich würde es immer relativ am Anfang des Skriptes einbauen, damit es gut sichtbar ist. Aber die Position spielt technisch gesehen keine Rolle. Also wenn die `#Requires` Anweisung im Code drin steht, wird das vor der richtigen Ausführung des gesamten restlichen Codes ausgewertet. Und je nachdem ob Adminrechte vorhanden sind, oder nicht - wird ein Fehler ausgegeben.

[![Fehler wenn #Requires -RunAsAdministrator Anweisung im Code genutzt wird, aber keine Admin-Rechte vorhanden sind](/images/2024/2024-02-20_PowerShell_Admin_Requires_Error.jpg "Fehler wenn #Requires -RunAsAdministrator Anweisung im Code genutzt wird, aber keine Admin-Rechte vorhanden sind")](/images/2024/2024-02-20_PowerShell_Admin_Requires_Error.jpg)

## Windows: Admin-Rechte per Code prüfen

Aber die `#Requires -RunAsAdministrator` Methode ist nicht für alle Fälle passend.
Stellt euch mal vor, ihr habt ein Skript was nicht unbedingt Admin-Rechte benötigt - aber falls sie vorhanden sind, dann könnte etwas besser umgesetzt werden. Zum Beispiel, dass eine Konfiguration mit Admin-Rechten für das ganze System eingestellt wird, aber falls nur normale User-Rechte vorhanden sind, dann wird die Einstellung nur für den aktuellen User gemacht. Wenn ihr sowas abfragen wollt, dann müsst ihr ein paar .NET Methoden verwenden. Es gibt ein paar verschiedene Varianten wie man es machen kann. Ich finde die folgende am Besten, weil dafür nur eine Codezeile benötigt wird.
Wir verwenden dafür die `[Security.Principal.WindowsIdentity]` Klasse und rufen dort die `::GetCurrent()` Methode auf. Damit werden uns einige Infos zur aktuell genutzten Identity angezeigt. Was uns jetzt aber interessiert ist die Eigenschaft `Groups` . Da stehen die Gruppen drin, in denen unsere Identity drin ist. Die Gruppen werden hier als Security Identifier (SID) aufgelistet. Was uns interessiert ist die SID `S-1-5-32-544`. Die steht für folgendes:

- Revisionsstufe `1`
- Bezeichnerautoritätswert `5` - steht für "NT-Autorität"
- Domänenbezeichner `32` - steht für Builtin (also nicht für eine Active Directory Domäne)
- Und der relative Bezeichner `544` steht für die Gruppe "Administratoren"

Ob die SID in der `.Groups`-Eigenschaft drin steht, können wir auch einfach mit in der gleichen Zeile abfragen, indem wir den `-contains` Operator verwenden.

```powershell
[Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains 'S-1-5-32-544'
```

Wenn der Code durch einen User ausgeführt wird, der zwar theoretisch Admin-Rechte hat, aber sie nicht per Benutzerkontensteuerung (UAC) bestätigt hat, dann liefert diese Methode `false` zurück, so als wäre der User gar nicht in der Admin-Gruppe. Wenn ich aber ein PowerShell Fenster mit Admin-Rechten starte, dann wird `true` zurückgegeben. Diese Code-Zeile kann ich einfach einbauen und z.B. per `if`-Abfrage die Rückgabe prüfen und dann darauf reagieren. Das geht aber leider nur unter Windows, aber dort sowohl in der Windows PowerShell, als auch in der PowerShell 7.

## Plattformübergreifend: Admin-Rechte per Code prüfen

Ab der PowerShell 7.4 gibt es auch eine plattformübergreifende Methode um abzufragen, ob wir gerade Admin-Rechte haben, oder nicht. Das machen wir auch wieder über .NET, aber es geht einfacher als die Windows-Only-Methode. Wir rufen einfach von der Klasse `[System.Environment]` die Eigenschaft `IsPrivilegedProcess` ab.

```powershell
# Ab PowerShell 7.4 (.NET 8)
[System.Environment]::IsPrivilegedProcess
```

Auch hier wird dann wieder `true` oder `false` zurückgegeben, je nachdem ob wir Admin-Rechte haben oder nicht. Und das funktioniert wie gesagt plattformübergreifend, also zum Beispiel auch unter Linux (`root`-Rechte).

## Admin-Rechte anfordern

Es gibt auch die Möglichkeit, Admin-Rechte aktiv anzufordern. Ich bin da nicht so wirklich ein Freund von, also mir reichen die obenstehenden Checks. Wenn ihr es aber machen wollt: Ich finde da den Code von Jeff Guillet und Pat Richard ganz ansprechend. [Der Code wurde im Blog von EXPTA veröffentlicht](https://blog.expta.com/2017/03/how-to-self-elevate-powershell-script.html) - ich kopiere den jetzt nicht einfach. Da wird im Grunde auch eine Windows-spezifische Abfrage durchgeführt, ob Admin-Rechte vorhanden sind. Falls sie nicht vorhanden sind, startet sich das Skript per `Start-Process` selbst neu und fordert dabei mit dem Parameter `-Verb RunAs` Admin-Rechte an. Das coole ist aber, dass in der Variante bei EXPTA auch die ursprünglichen Skript-Parameter mit übernommen werden.
