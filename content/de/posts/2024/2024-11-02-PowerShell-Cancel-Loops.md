---
slug: "powershell-cancel-loops"
title: "PowerShell: Schleifen gezielt abbrechen/überspringen"
date: 2024-11-02
comments: true
tags: [powershell]
---

Normalerweise wird eine Schleife in PowerShell solange ausgeführt, wie es durch den außen stehenden Bedingungsblock definiert ist. Die folgende `while`-Schleife wird zum Beispiel so lange ausgeführt, wie die Variable namens `$Variable` kleiner oder gleich `10` ist.

```powershell
while($Variable -le 10) {
    # irgendwas
}
```

Es ist aber auch möglich gezielt eine komplette Schleife vorzeitig abzubrechen oder einen einzelnen Schleifendurchgang abzubrechen. Und zwar auch, wenn ihr mehrere Schleifen ineinander verschachtelt habt.

## Grundlagen zum Schleifen abbrechen/überspringen

Hier nochmal die Grundlagen zum Schleifen abbrechen beziehungsweise zum überspringen eines Schleifendurchgangs.

### Schleifendurchgang überspringen mit `continue`

Grundsätzlich geht das Überspringen eines Schleifendurchgangs mit dem Befehl `continue` - das funktioniert bei allen gängigen Schleifentypen.
Ich habe hier zum Beispiel eine einfache `For`-Schleife die von 0 bis 10 hochzählt und jeweils die aktuelle Zahl ausgibt.

```powershell
for($i = 0; $i -le 10; $i++) {
    $i
}
<# Rückgabe:
0
1
2
3
4
5
6
7
8
9
10
#>
```

Mit `continue` könnte ich jetzt einen Schleifendurchgang abbrechen. Und normalerweise sollte man so etwas an eine bestimmte Bedingung knüpfen, z.B. mache ich das jetzt mit einer `If`-Abfrage, wenn mein Zähler bei 5 steht.

```powershell  {hl_lines=[13,14]}
for($i = 0; $i -le 10; $i++) {
    if($i -eq 5) {
        continue
    }
    $i
}

<# Rückgabe:
0
1
2
3
4
6
7
8
9
10
#>
```

In der Ausgabe fehlt jetzt im Vergleich zur vorherigen Variante die Ausgabe der Zahl 5. Denn bevor die Zeile für die Ausgabe ausgeführt werden konnte, wurde der `continue` Befehl ausgeführt. Der sorgt dafür, dass der aktuelle Schleifendurchgang abgebrochen wird, und der nächste Schleifendurchgang ausgeführt wird.
Wenn kein weiterer Schleifendurchgang folgen würde, dann wird durch `continue` aber **kein** zusätzlicher Durchgang erzwungen. Die Bedingung der Schleife wird trotzdem weiterhin ausgewertet und beachtet.

### Schleife abbrechen mit `break`

Außerdem gibt es die Möglichkeit, nicht nur *einen* Schleifen*durchgang* abzubrechen, sondern die gesamte Schleife. Das geht mit dem `break` Befehl. Auch der funktioniert bei allen gängigen Schleifentypen. Und genau so wie auch der `continue` Befehl, sollte der `break` Befehl vorzugsweise an eine bestimmte Bedingung geknüpft werden.

```powershell
for($i = 0; $i -le 10; $i++) {
    if($i -eq 5) {
        break
    }
    $i
}
```

Hier wird jetzt, wenn die Variable `$i` den Wert `5` hat, der `break` Befehl ausgeführt. Das sorgt dafür, dass wir die Schleife sofort beenden. Im Ergebnis wird hier also nur von `0` bis `4` gezählt.

## Verschachtelte Schleifen

Wenn wir mehrere Schleifen verschachteln, dann beziehen sich `break` und `continue` immer auf die aktuelle Schleife. Hier habe ich zum Beispiel zwei Schleifen:

```powershell {hl_lines=[9]}
$AlleOrdner = Get-ChildItem testdir\ -Directory
foreach($DieserOrdner in $AlleOrdner) {
    Write-Host "--- $($DieserOrdner.Name) ---" -ForegroundColor DarkGreen

    $Dateien = Get-ChildItem $DieserOrdner.FullName -File
    foreach($DieseDatei in $Dateien) {
        if($DieseDatei.Length -ge 1KB) {
            Write-Host "Die Datei $($DieseDatei.Name) ist größer oder gleich 1 KB - Überspringe Schleifendurchgang" -ForegroundColor Red
            continue
        }
        Write-Host "Inhalt von $($DieseDatei.Name): $(Get-Content $DieseDatei.FullName)" -ForegroundColor Yellow
    }
}
```

Erstmal werden alle Ordner im aktuellen Verzeichnis durchgegangen, und dann werden jeweils alle Dateien in dem jeweiligen Ordner durchgegangen. Als einfaches Beispiel wird hier immer der Inhalt der Dateien ausgegeben, es sei denn, dass die Datei größer als `1` Kilobyte ist. In diesem Fall wird stattdessen ein Hinweis ausgegeben und per `continue` in den nächsten Schleifendurchgang gesprungen (also in den nächsten Schleifendurchgang der inneren `ForEach` Schleife, die die Dateien durchgeht).
Und wenn ich hier `continue` durch `break` ersetzen würde, dann würde diese innere Schleife komplett abgebrochen werden, also die Prüfung aller Dateien im aktuellen Ordner wird abgebrochen.

```powershell {hl_lines=[9]}
$AlleOrdner = Get-ChildItem testdir\ -Directory
foreach($DieserOrdner in $AlleOrdner) {
    Write-Host "--- $($DieserOrdner.Name) ---" -ForegroundColor DarkGreen

    $Dateien = Get-ChildItem $DieserOrdner.FullName -File
    foreach($DieseDatei in $Dateien) {
        if($DieseDatei.Length -ge 1KB) {
            Write-Host "Die Datei $($DieseDatei.Name) ist größer oder gleich 1 KB - Überspringe Schleifendurchgang" -ForegroundColor Red
            break
        }
        Write-Host "Inhalt von $($DieseDatei.Name): $(Get-Content $DieseDatei.FullName)" -ForegroundColor Yellow
    }
}
```

Oftmals reicht das aus, um Schleifen zusätzlich zum normalen Bedingungsblock steuern.

### Verschachtelte Schleifen ansteuern mit "Labels"

Aber manchmal ist es auch notwendig, in einer inneren Schleife, also tiefer verschachtelt ein Überspringen eines weiter außenliegenden Schleifendurchgangs anzustoßen oder vielleicht sogar eine komplette Schleife abzubrechen.
Dafür können wir Label verwenden, also Beschriftungen für unsere Schleifen. Und das funktioniert auch wieder bei allen gängigen Schleifentypen.

Um eine Schleife zu labeln müssen wir einfach vor den Schleifenbefehl `:` und dann einen frei wählbaren Namen schreiben - und dann noch ein Leerzeichen vor den eigentlichen Schleifenbefehl. Zum Beispiel `:Ordner` für meine äußere Ordner-Schleife und `:Datei` für meine innere Datei-Schleife.
Wenn ich jetzt in meiner inneren Schleife die äußere Schleife mit `break` oder `continue` ansprechen möchte, dann muss ich einfach nur hinter `break` oder `continue` ein Leerzeichen hängen und dann das Label der gewünschten Schleife. Hier jetzt aber ohne die Doppelpunkte.

```powershell {hl_lines=[2,6,9]}
$AlleOrdner = Get-ChildItem testdir\ -Directory
:Ordner foreach($DieserOrdner in $AlleOrdner) {
    Write-Host "--- $($DieserOrdner.Name) ---" -ForegroundColor DarkGreen

    $Dateien = Get-ChildItem $DieserOrdner.FullName -File
    :Datei foreach($DieseDatei in $Dateien) {
        if($DieseDatei.Length -ge 1KB) {
            Write-Host "Die Datei $($DieseDatei.Name) ist größer oder gleich 1 KB - Breche Ordner-Schleife ab" -ForegroundColor Red
            break Ordner
        }
        Write-Host "Inhalt von $($DieseDatei.Name): $(Get-Content $DieseDatei.FullName)" -ForegroundColor Yellow
    }
}
```

Als Ergebnis wird hier der übergeordnete Vorgang (das Durchlaufen der Ordner) abgebrochen, wenn eine Datei mit mehr als `1KB` Größe gefunden wird.

Ich hätte jetzt die innere Schleife auch nicht unbedingt labeln müssen, aber ich find es so besser lesbar.
Und das funktioniert natürlich auch bei tieferen Verschachtelungen als nur zwei Schleifen. **Hauptsache ihr habt die Schleife gelabelt, die ihr von weiter innen aus ansprechen wollt.**

## Fazit

Mein Fazit zu den gelabelten Schleifen, um `break` und `continue` gezielt einsetzen zu können: Ich find's cool und praktisch. Einige Szenarien lassen sich so viel effizienter lösen, oder überhaupt erst lösen. Aber wie so oft, wird der Code dadurch natürlich auch wieder etwas komplexer.
