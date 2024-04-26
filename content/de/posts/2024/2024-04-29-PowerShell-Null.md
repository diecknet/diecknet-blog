---
slug: "powershell-null"
title: "NULL in PowerShell"
date: 2024-04-29
comments: true
tags: [powershell]
---
Wenn ihr in PowerShell prüfen wollt, ob ein Wert nicht gesetzt ist, dann *könnt* ihr einen Vergleich mit `$null` machen. Diese automatische Variable bedeutet immer null, nichts, kein Wert.
Das ist aber etwas anderes, als wenn ihr einfach Anführungszeichen `""` nehmt und dann nichts reinschreibt.
Zum Beispiel ergibt das hier immer FALSE:

```powershell
$null -eq "" # = false
$null -eq '' # = false

# Hat übrigens nichts mit der Zahl 0 zu tun // also das ergibt auch False
$null -eq 0  # = false
```

**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://www.youtube.com/watch?v=EXoHcYNHSm8)**  

## Was ist NULL?

Merkwürdig! Also was ist NULL eigentlich? NULL ist im Grunde ein nicht gesetzter Wert. Wenn eine Variable noch nicht gesetzt wurde, dann entspricht sie immer NULL. Und die automatische Variable `$null` repräsentiert immer NULL, also einen nicht vorhandenen Wert.

```powershell
$null -eq $NichtGesetzteVariable # = true
```

Wenn ihr aber ganz genau wissen wollt, ob eine Variable schonmal gesetzt wurde, dann ist das nicht 100%ig zuverlässig. Dann theoretisch kann eine Variable auch den *Wert* `$null` zugewiesen bekommen. Falls das für euch relevant sein sollte, dann könnt ihr stattdessen mit dem Cmdlet `Get-Variable` herausfinden ob die Variable erstellt wurde:

```powershell
# Wenn die Variable $Test123 noch nicht gesetzt wurde,
# dann erzeugt der nachfolgende Befehl einen Fehler:
Get-Variable Test123 

# Testweise die Variable initialisieren, aber $null als Wert zuweisen
$Test123 = $null

# Noch einmal Get-Variable ausprobieren:
Get-Variable Test123
<# Ergebnis:

Name                           Value
----                           -----
Test123
#>
```

Warum sind jetzt Anführungszeichen `""` ohne Inhalt nicht auch NULL? Tja, es sieht vielleicht auf den ersten Blick so aus, als hätten wir hier nichts. Aber dem ist nicht so. Tatsächlich ist das ein String-Objekt mit 0 Zeichen. Aber es ist trotzdem ein String-Objekt. Das können wir zum Beispiel per Get-Member sichtbar machen:

```powershell
"" | Get-Member

<# Ergebnis:

TypeName: System.String
...
#>

```

## Aufpassen beim Vergleich mit `$null`

Was zu beachten ist:
Bei einem Vergleich mit `$null` sollte `$null` in der Regel auf die linke Seite des Vergleichs kommen, dann der Vergleichsoperator (also zum Beispiel `-eq`) und dann der eigentliche Wert den wir prüfen wollen.
Wenn ihr automatische Tests wie den PSScriptAnalyzer verwendet wird es auch bemängelt, wenn ihr in einem Vergleich `$null` auf der rechten Seite stehen habt. Der PSScriptAnalyzer ist in VSCode bei Verwendung der PowerShell Extension standardmäßig aktiv. Dadurch gibt es dann automatisch Empfehlungen zu diversen Best Practices.

[![Beispiel für einen Hinweis vom PSScriptAnalyzer zu NULL auf der rechten Seite eines Vergleichs](/images/2024/2024-04-15_NULL_PSScriptAnalyzer.jpg "Beispiel für einen Hinweis vom PSScriptAnalyzer zu NULL auf der rechten Seite eines Vergleichs")](/images/2024/2024-04-15_NULL_PSScriptAnalyzer.jpg)

### Filterung statt Vergleich wenn links eine Sammlung steht

Was ist jetzt das Problem? Also wenn ihr `$null` nicht nach links packen würdet, dann kann es passieren, dass hier nicht einfach nur ein Vergleich, **sondern eine Filterung passiert**. Das passiert immer, wenn nicht nur einzelner Wert auf der Linken Seite steht, sondern eine Sammlung von Objekten, meistens ein Array.

Ich demonstriere das erstmal nicht mit `$null` sondern mit richtigen (sichtbaren) Werten.

```powershell
"a", "b", "c" -eq "b"  # Ergebnis: "b", es wurde also gefiltert
"b" -eq "a", "b", "c"  # Ergebnis: false, es wurde also nur verglichen
```

### Theoretisches Beispiel mit leeren Arrays

Wenn ich prüfen möchte, ob ein Array leer ist, also keine Werte enthält, dann wäre folgendes **falsch**:

```powershell
# So bitte nicht machen!
if (@() -eq $null) { 'true' } else { 'false' } # = false
if (@() -ne $null) { 'true' } else { 'false' } # = false
```

Ergibt beides `false`? Das macht ja eigentlich keinen Sinn. Wie kann es dann einerseits nicht NULL entsprechen, aber auch **nicht-nicht** NULL entsprechen?
Besser wäre es stattdessen so:

```powershell
if ($null -eq @()) { 'true' } else { 'false' } # = false
if ($null -ne @()) { 'true' } else { 'false' } # = true
```

### Praxisnäheres Beispiel mit Objekten

Folgendes Beispiel ist vielleicht ein bisschen näher an der Praxis. Ich habe hier eine einfache Funktion die zwei Objekte zurückgibt. Beide Objekte haben die Eigenschaft "Id", allerdings ist sie bei einem der beiden Objekte auf den Wert `$null` gesetzt. In der Praxis könnte so etwas ähnliches passieren, wenn die "Id" Eigenschaft vielleicht erst später gesetzt werden soll, oder weil ein Fehler aufgetreten ist.

```powershell
function Get-ExampleObjects {
    [PSCustomObject]@{
        Name = "Value123"
        Id   = 123
    },
    [PSCustomObject]@{
        Name = "Value456"
        Id   = $null
    }
}
$Objects = Get-ExampleObjects
```

Wenn wir jetzt mal schauen, was in `$Objects` drin steht, sieht das erstmal so aus wie erwartet:

```powershell
Name       Id
----       --
Value123  123
Value456     
```

Und nun führen wir mal testweise einen Vergleich direkt aus (lassen also die If-Abfrage weg):

```powershell
$Objects.Id -eq $null
# Ergebnis: <keine sichtbare Rückgabe>
```

Wir haben jetzt auf der linken Seite des Vergleichs mehrere Objekte, es wird also gefiltert. Das Objekt was uns zurückgegeben wird, entspricht aber NULL - und das ist nicht sichtbar. Wir können uns den Fakt aber sichtbar machen, indem wir den Ausdruck in runde Klammern setzen und dann auf die `PSObject` Eigenschaft des Ausdrucks zugreifen:

```powershell
($Objects.Id -eq $null).PSObject

<# Rückgabe:
Members             : {int Length {get;}, long LongLength {get;}, int Rank {get;}, System.Object SyncRoot {get;}…}
Properties          : {int Length {get;}, long LongLength {get;}, int Rank {get;}, System.Object SyncRoot {get;}…}
Methods             : {Get, Set, Address, get_Length…}
ImmediateBaseObject : {$null}
BaseObject          : {$null}
TypeNames           : {System.Object[], System.Array, System.Object}
#>
```

An den zurückgegebenen Eigenschaften ist erkennbar, dass hier sehr wohl etwas ist. Zum Beispiel verweisen `ImmediateBaseObject` und `BaseObject` auf `$null`. Oder wir können die Eigenschaft `Count` ansehen.

```powershell
($Objects.Id -eq $null).Count 
# Rückgabe: 1
```

Wenn wir unseren ursprünglichen Code anpassen, sodass nicht nur eines sondern mehrere Objekte mit NULL als Eigenschaftswert zurückgeliefert werden, wird es richtig kurios:

```powershell
function Get-ExampleObjects {
    [PSCustomObject]@{
        Name = "Value123"
        Id   = $null
    },
    [PSCustomObject]@{
        Name = "Value456"
        Id   = $null
    }
}
$Objects = Get-ExampleObjects
```

Denn wenn wir jetzt nochmal den Vergleich ausführen, kriegen wir keine sichtbare Ausgabe:

```powershell
$Objects.Id -eq $null
# Ergebnis: <keine sichtbare Rückgabe>
```

Aber wenn wir den Vergleich in einer If-Abfrage verwenden, dann wird es als TRUE gewertet:

```powershell
if($Objects.Id -eq $null) {
    "TRUE"
} else {
    "FALSE"
}
# Rückgabe: TRUE
```

Das liegt daran, dass hier jetzt mehrere Objekte zurückgegeben wurden (das war ja erkennbar an `Count` = 2). Und mehrere Objekte sorgen dafür, dass eine If-Abfrage als erfolgreich zählt und ausgeführt wird. Das kann für sehr komische Fehler sorgen, denn die If-Abfrage würde **ein einzelnes** (als Zahl `1`) NULL Objekt nicht positiv werden, also würde der Else-Block ausgeführt werden.

Richtig wäre es also eigentlich so:

```powershell
if($null -eq $Objects.Id) {
    "TRUE"
} else {
    "FALSE"
}
# Rückgabe: FALSE
```

**Fazit:** Ich weiß, das ist alles sehr komisch. Selbst wenn ihr jetzt nicht jedes Detail verstanden habt, zieht ihr aber hoffentlich die gleiche Schlussfolgerung daraus: Einfach `$null` auf die linke Seite des Vergleichs schreiben.

## Testen ob ein String leer ist

Anderes Thema, aber mit NULL verwandt: Wenn ihr mit Strings arbeitet und schauen wollt, ob der String leer ist, dann ist `$null` dafür normalerweise nicht geeignet. Ich hatte ja schon ganz am Anfang des Posts gezeigt, dass auch ein String-Objekt ohne Zeichen nicht `$null` entspricht.
Es gibt zwei nützliche Methoden aus der String-Klasse die wir stattdessen verwenden können. Einmal `IsNullOrEmpty` und dann noch `IsNullOrWhiteSpace`. Die werden allerdings nicht als Methoden von einem bestehenden String Objekt aufgerufen, sondern direkt aus der .NET Klasse. Der String den wir testen wollen, geben wir dann als Parameter an.
Also:

```powershell
$MeinString = ""

[string]::IsNullOrEmpty($MeinString) # Ergebnis: true
[string]::IsNullOrWhiteSpace($MeinString) # Ergebnis: true
```

Die zweite Methode, also `IsNullOrWhiteSpace` können wir auch benutzen, wenn wir auch Leerzeichen oder Zeilenumbrüche als leeren Wert ansehen möchten.

```powershell
$MeinString = "    "

[string]::IsNullOrEmpty($MeinString) # false
[string]::IsNullOrWhiteSpace($MeinString) # true
```

Und diese .NET Methoden können wir auch in einer If-Abfrage einbauen:

```powershell
$MeinString = "    "

if([string]::IsNullOrWhiteSpace($MeinString)) {
    "Es wurde ein leerer Wert angegeben!"
}
# Rückgabe: Es wurde ein leerer Wert angegeben!
```

## `$null` um die Ausgabe zu unterdrücken

Ansonsten ist `$null` auch noch praktisch, wenn ihr die Ausgabe von einem Befehl oder Skript unterdrücken wollt. Mehr dazu findet ihr im separatem [Blog-Post "PowerShell Ausgabe unterdrücken"]({{< relref "2024-04-09-PowerShell-Suppress-Output.md" >}}).
