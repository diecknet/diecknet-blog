---
title: "Dateidatum per PowerShell setzen"
subtitle: "Zeitreisen per PowerShell?"
date: 2020-09-08
contenttags: [powershell, ntfs, windowsserver, powershellsnips]
image: /images/2020/2020-09-08_FileDate.png
---

Das Datum einer Datei kann beliebig per PowerShell gesetzt beziehungsweise manipuliert werden. Im Screenshot sind beispielhaft ein paar beliebig gesetzte Werte zu sehen. Die Vorgehensweise ist getestet mit Windows PowerShell 5.1.

Per `Get-Member` kann man sich die Zeit-Attribute einer Datei anzeigen lassen.

```powershell
Get-Item beispiel.txt | Get-Member *time*
```

![Dateidatums-Attribute anzeigen](/images/2020/2020-09-08_DateAttributes.png "Dateidatums-Attribute anzeigen")

Interessant sind hier die Attribute:

-   CreationTime (Wann die Datei erstellt wurde)
-   LastAccessTime (Wann das letzte Mal auf die Datei zugegriffen wurde)
-   LastWriteTime (Wann die Datei zuletzt geändert wurde)

Wie hinten am `{get;set;}` zu erkennen ist, kann man die Attribute auch nicht nur auslesen, sondern auch setzen.

## Beispiele

Im Folgenden zeige ich ein paar Beispiele, wie das Änderungsdatum, der Zeitpunkt des letzten Zugriffs und des Erstellzeitpunkts von einzelnen Dateien oder auch allen Dateien in einem Ordner geändert werden kann.

### Hinweise zu den Beispielen

#### Datum generieren

Ich generiere das Datum am liebsten im folgendem Format: `2020-09-13T13:37:37` (siehe auch [ISO 8601](https://de.wikipedia.org/wiki/ISO_8601#:~:text=Das%20%C3%BCblichste%20Zeitformat%20der%20Norm,%2D14T23%3A34%3A30.)), alternativ vereinfacht auf `2020-09-13 13:37`. Dieses standardisierte Format funktioniert unabhängig von OS-Lokalisierungen.

#### Abkürzungen und Aliase

Mit `gci` (Abkürzung/Alias für `Get-ChildItem`) lesen wir alle Elemente (Ordner und Dateien) im aktuellen Ordner aus.
Mit `%` (Alias für `ForEach-Object`) gehen wir durch alle Elemente eingegebenen Elemente durch.

### Erstelldatum ändern

Beispiele zum Erstelldatum ("Erstellt") ändern:

```powershell
# Erstelldatum aller Elemente im aktuellen Ordner auf 1991-11-06 12:03 setzen
gci | %{$_.CreationTime=(Get-Date "1991-11-06 12:03")}

# Erstelldatum einer bestimmten Datei auf 1991-11-06 12:03 setzen
Get-Item "Beispiel.txt" | %{$_.CreationTime=(Get-Date "1991-11-06 12:03")}
```

### Änderungsdatum ändern

Beispiele zum Änderungsdatum ("Geändert") ändern:

```powershell
# Änderungsdatum aller Elemente im aktuellen Ordner auf 2021-05-01 17:01 setzen
gci | %{$_.LastWriteTime=Get-Date "2021-05-01 17:01"}

# Änderungsdatum einer bestimmten Datei im aktuellen Ordner auf 2021-05-01 17:01 setzen
Get-Item "Beispiel.txt" | %{$_.LastWriteTime=Get-Date "2021-05-01 17:01"}
```

### Datum des letzten Zugriffs ändern

Beispiele zum Zugriffszeitpunkt ("Letzter Zugriff") ändern:

```powershell
# Zugriffsdatum aller Elemente im aktuellen Ordner auf 2019-01-06 08:03 setzen
gci | %{$_.LastAccessTime=(Get-Date "2019-01-06 08:03")}

# Zugriffsdatum eines bestimmten Elements im aktuellen Ordner auf 2019-01-06 08:03 setzen
Get-Item "Beispiel.txt" | %{$_.LastAccessTime=(Get-Date "2019-01-06 08:03")}
```

## Fazit

Da die Zeit-Attribute von Dateien beliebig manipuliert werden können, sollte ihnen nicht getraut werden. Sie können bestenfalls als Anhaltspunkt für eine Aktion in einem System genutzt werden. Ein Beweis sind sie jedoch definitiv nicht.
