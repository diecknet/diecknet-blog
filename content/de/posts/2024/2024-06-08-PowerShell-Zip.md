---
slug: "powershell-zip"
title: "Per PowerShell .zip-Archive erstellen und entpacken"
date: 2024-06-08
comments: true
tags: [powershell]
---
Windows kann eigentlich schon ziemlich lange mit ZIP-Archiven umgehen.
Und auch die PowerShell kann das, also sowohl ZIP-Dateien erstellen, als auch sie entpacken.
Das kann nützlich sein, wenn ihr z.B. mit einem PowerShell Skript mehrere Dateien zu einer ZIP-Datei zusammenfassen wollt - das erleichtert das wegkopieren. Oder vielleicht um eine per Skript aus dem Internet geladene ZIP-Datei zu extrahieren.

**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://youtu.be/ALoe26e8c5s)**  

## Komprimieren

Mit dem Cmdlet `Compress-Archive` könnt ihr ein ZIP-Archiv erstellen:

```powershell
Compress-Archive -Path "MeineOriginalDatei.txt" -DestinationPath "MeineGezippteDatei.zip"
```

### Kompressionslevel anpassen

Optional könnt ihr noch ein CompressionLevel angeben. Wenn ihr den Parameter nicht angebt, wird standardmäßig die Option "Optimal" gewählt, die eigentlich schon bestmöglich komprimieren sollte. Das benötigt ein wenig mehr Rechenpower beim Packen und Entpacken, kann aber Speicherplatz sparen. Alternativ gibt es noch die Optionen "Fastest", die ist schneller aber das resultierende Archiv ist dann größer und "NoCompression" - da wird dann gar nicht komprimiert, sondern nur zu einer ZIP-Datei zusammengefasst.

```powershell
Compress-Archive -Path "MeineOriginalDatei.txt" -DestinationPath "MeineGezippteDatei-Fastest.zip" -CompressionLevel Fastest
Compress-Archive -Path "MeineOriginalDatei.txt" -DestinationPath "MeineGezippteDatei-NoCompression.zip" -CompressionLevel NoCompression
```

### Mehrere Dateien zippen

Um mehrere Dateien zu zippen gibt es verschiedene Möglichkeiten:

1. Ihr könnt einfach beim `-Path` Parameter mehrere Werte angeben und die mit einem Komma trennen.

    ```powershell
    Compress-Archive -Path "MeineOriginalDatei.txt","beispiel.bmp" -DestinationPath "MeineGezippteDatei2.zip"
    ```

2. Oder ihr könnt auch einen ganzen Ordner angeben:

    ```powershell
    Compress-Archive -Path "C:\temp" -DestinationPath "MeineGezippteDatei3.zip"
    ```

3. Oder mit Wildcards arbeiten:

    ```powershell
    Compress-Archive -Path "*.jpg" -DestinationPath "MeineGezippteDatei4.zip"
    ```

4. Oder ihr übergebt die Info welche Daten komprimiert werden sollen per Pipeline:

    ```powershell
    Get-ChildItem C:\temp |
        Where-Object {$_.LastWriteTime -ge "2024-06-01"} |
        Compress-Archive -Path "C:\temp" -DestinationPath "MeineGezippteDatei5.zip"
    ```

### Bestehende ZIP-Dateien ergänzen

Um eine bereits bestehende ZIP-Datei zu ergänzen, könnt ihr den Parameter `-Update` angeben. Wenn im ZIP-Archiv schon eine Datei mit dem gleichen Namen vorhanden ist, wird sie ersetzt. Ansonsten wird die Datei einfach zusätzlich in das ZIP-Archiv hinzugefügt.

```powershell
Compress-Archive -Path "Hallo.docx" -DestinationPath "MeineGezippteDatei6.zip" -Update
```

## Entpacken

Mit dem Cmdlet `Expand-Archive` könnt ihr ZIP-Dateien entpacken:

```powershell
Expand-Archive -Path "MeineGezippteDatei6.zip"
```

Im Standard erzeugt das Cmdlet einen Unterordner im aktuellen Verzeichnis, der dem Namen der ZIP-Datei entspricht. Die Daten aus dem ZIP-Archiv landen dann in diesem neuen Ordner. Wenn ihr den Inhalt des Archivs aber woanders hin entpacken wollt, dann könnt ihr mit `-DestinationPath` einen Zielordner angeben.

```powershell
Expand-Archive -Path "MeineGezippteDatei6.zip" -DestinationPath "MeinEntpackterOrdner"
```

Oder wenn ihr in den aktuellen Ordner entpacken wollt, dann könnt ihr auch einen Punkt als Parameterwert für `-DestinationPath` angeben:

```powershell
Expand-Archive -Path "MeineGezippteDatei6.zip" -DestinationPath .
```

## Schlusswort

Bei beiden Cmdlets gibt es noch ein paar mehr Parameter und Optionen. Schaut dazu am besten in [die Dokumentation bei Microsoft zu den beiden Befehlen](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.archive/?view=powershell-7.4).

Außerdem: Auch wenn neuere Windows Versionen nativ im Explorer mit weiteren Archiv-Formaten wie `.rar` oder `.7z` umgehen können, kann die PowerShell das leider noch nicht. Falls ihr in einem Skript andere Archiv-Formate verwenden wollt, dann müsst ihr auf Alternativen zurückgreifen, wie z.B. [die Command Line Version von 7-Zip](https://www.7-zip.org/download.html) oder [das PowerShell Modul "7Zip4PowerShell"](https://github.com/thoemmi/7Zip4Powershell). Wobei ich keine Erfahrung mit dem Modul habe, Benutzung auf eigene Gefahr 😉.
