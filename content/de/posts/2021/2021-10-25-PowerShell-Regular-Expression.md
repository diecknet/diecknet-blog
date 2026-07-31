---
comments: true
aliases:
    - powershell-regular-expression
slug: PowerShell-Regular-Expression
title: PowerShell Regular Expressions zum Abgleich von Dateinamen verwenden
subtitle: Infos mit benannten Capture Groups extrahieren
tags:
    [powershell, filename, regular expressions, regex, regexp, named groups]
date: 2021-10-25
---

Ein kurzes Beispiel für PowerShell Regular Expressions.

Szenario: Dateinamen wie `ID1234_MyDocumentXYZ.pdf.lnk` abgleichen. Wir wollen die Zahl nach `ID` und den Rest des Dateinamens zwischen Unterstrich `_` und Dateiendung `.lnk` extrahiert haben.

```powershell
$oldLink = "ID1337_MyDocumentXYZ.pdf.lnk"
if($oldLink -match 'ID(?<id>\d+)_(?<actualFilename>.+)\.lnk$') {
        Write-Output "ID: $($Matches.id)"
        Write-Output "Actual Filename: $($Matches.actualFilename)"
}
```

`(?<id>\d+)` ist eine benannte Regex-Capture-Group (initialisiert mit `?<groupname>`). Die Group matched jedes numerische Zeichen (`\d`). Das `+` danach ist ein Multiplikator, damit gegen beliebig viele numerische Zeichen gematcht wird.
Da die Regular Expression erfolgreich gematcht hat, ist als Ergebnis $true zurückgekommen und wir haben den `if`-Block ausgeführt.

Ausgabe:

```text
ID: 1337
Actual Filename: MyDocumentXYZ.pdf
```
