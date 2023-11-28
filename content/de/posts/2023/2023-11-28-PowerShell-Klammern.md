---
slug: "powershell-brackets"
title: "Die unterschiedlichen Klammern in der PowerShell"
date: 2023-11-28
comments: true
tags: [powershell, klammern, brackets]
cover: 
    image: "/images/2023/2023-11-28-Klammern.jpg"
---

Wann ist welche Klammer die Richtige in der PowerShell?

{{< highlight powershell "linenos=false" >}}
# Verschiedene Klammern in der PowerShell
() {} []
{{< / highlight >}}

Die Klammern haben unterschiedliche Einsatzzwecke. Die Größer-als `<` und Kleiner-als `>` Zeichen würde ich übrigens nicht zu den Klammern zählen. Für alle echten Klammern gilt: Wenn ihr eine Klammer geöffnet habt, müsst ihr sie auch wieder schließen.

## Runde Klammern `( )`

Mit runden Klammern wird in der PowerShell ein Ausdruck bzw. ein Befehl umfasst, bzw. die Parameter für .NET Methoden umschlossen.

### Expressions

Mit runden Klammern kann ein Ausdruck (Englisch: eine Expression) zusammengefasst werden.
Ähnlich wie in einer mathematischen Formel wird das was in Klammern steht zuerst ausgeführt. Also bevor die weiter außen stehenden Sachen ausgeführt werden.

```powershell
# Hier gilt klassische Punkt-vor-Strich-Rechnung
# Es wird also erst 2*3 gerechnet (=6) und dann noch +1 dazu gerechnet
1 + 2 * 3
# Rückgabe: 7

# Der Ausdruck in den Klammern wird zuerst ausgeführt.
# Hier wird also zuerst 1+2 gerechnet = 3 
# Anschließend wird Ergebnis der Klammer * 3 gerechnet, also 3*3
(1 + 2) * 3
# Rückgabe: 9
```

Allerdings kann dabei auch mit mehr als nur Zahlen gearbeitet werden. Beispielsweise kann ich auch ein Cmdlet reinschreiben und dann einen Punkt anhängen, um auf bestimmte Eigenschaften des resultierenden Objekts zuzugreifen. Zum Beispiel:

```powershell
(Get-Date).Year
# Rückgabe: 2023
```

### Subexpressions

Abgesehen von diesen normalen Expressions gibt es auch die Subexpressions. Diese können genutzt werden, um einen Ausdruck in einem Ausdruck zu verwenden. Das meint in der Regel das Ergebnis von einem Befehl in einen String einzubauen. Ein Subexpression wird mit `$()` in einen String eingebaut. In die runden Klammern dieser Subexpression kann dann ein Cmdlet, eine Variable oder ein anderer Ausdruck geschrieben werden.

```powershell
# Beispiel für einen normalen String
"Hier ein normaler String (ist auch einfach ein Ausdruck)"

# Im folgenden String wird die Rückgabe vom Cmdlet Get-Date eingebaut:
"Heute ist $(Get-Date)"
# Rückgabe: Heute ist 11/28/2023 15:26:41

# In diesem String wird die Rückgabe vom Cmdlet Get-Date eingebaut,
# aber es wird auf die Eigenschaft DayOfWeek zugegriffen:
"Heute ist $((Get-Date).DayOfWeek)"
# Rückgabe: Heute ist Dienstag

##########################################

# Zum Vergleich, wenn ihr ein Objekt in einer Variable speichert
$Datum = Get-Date

# Dann kann die Variable einfach direkt in einem String verwendet werden.
# Allerdings nur, wenn der String mit doppelten "Anführungszeichen"
# umschlossen wird.
# Mit einfachen 'Anführungszeichen' können keine Variablen eingebaut werden
"Heute ist $Datum"
# Rückgabe: Heute ist 11/28/2023 15:27:48

# Allerdings kann nicht auf die Eigenschaften des Objekts 
# in der Variable zugegriffen werden:
"Heute ist $Datum.DayOfWeek"
# Rückgabe: Heute ist 11/28/2023 15:27:48.DayOfWeek

# Um auf Eigenschaften zuzugreifen, kann eine Subexpression verwendet werden:
"Heute ist $($Datum.DayOfWeek)"
# Rückgabe: Heute ist Dienstag

##########################################

# Es ist auch möglich mehrere Befehle in einer Subexpression zu verwenden
# wenn diese mit einem Semikolon ; getrennt werden
"Pfadinfo: $(Get-Location; Get-ChildItem)"
# Rückgabe: Pfadinfo: C:\temp\Beispielordner test1.txt test2.txt
```

### Array-Subexpressions

Wenn eure Subexpression nur ein Ergebnis, also nur ein einzelnes Objekt zurückgibt, dann wird es einfach einzeln zurückgegeben. Wenn mehrere Objekte zurückgegeben werden, dann wird ein Array zurückgegeben.
Wenn ihr ganz explizit ein Array erzeugen wollt, auch wenn euer Ausdruck nur 1 oder 0 Ergebnisse zurückgibt, dann könnt ihr die Array Subexpression Schreibweise verwenden:

```powershell
$beispiel = @(Get-ChildItem)
```

In einer *anderen* Expression können diese Array Subexpressions aber soweit ich weiß nicht verwendet werden. Deshalb finde ich ist der Name ein wenig irreführend. Also das hier geht nicht:

```powershell
# Das Array wird nicht interpretiert:
"Hallo hallo @(Get-ChildItem)"
# Rückgabe: Hallo hallo @(Get-ChildItem)
```

### if-Abfragen und Schleifen

Bei `if`-Abfragen oder bei Schleifen wie zum Beispiel `while`, `for`, `foreach` wird der Ausdruck, also die Bedingung auch in Runde Klammern gepackt.

```powershell
# Einfache Klammern um den Bedingungs-Ausdruck der Schleife zu umschließen
# Endlosschleifen könnt ihr übrigens mit STRG+C abbrechen 😉
while($true) {
    "🌍 https://diecknet.de/"
}

# Bei Bedarf könnt ihr zusätzliche Klammern verwenden um genau das richtige 
# gewünschte Ergebnis zu erreichen. So kann z.B. direkt in einer Zeile
# auf eine Eigenschaft der Rückgabe von Get-Date zugegriffen werden:
if((Get-Date).Year -gt 2000) {
    "Y2K Problem solved"
}
```

### .NET Methoden

Und zu guter letzt, wenn ihr .NET *Methoden* verwendet, müsst ihr auch runde Klammern verwenden. In den runden Klammern werden die einzelnen Parameter reingeschrieben. Bei mehreren Parametern werden diese per Komma getrennt. Wenn ihr gar keine Parameter angeben wollt, dann müsst ihr trotzdem runde Klammern schreiben, aber dann einfach nichts reinschreiben `()`.

```powershell
[console]::beep(420,500)
```

## Eckige Klammern `[ ]`

Eckige Klammern werden in der PowerShell verwendet, um auf Elemente in einer Objektsammlung also Arrays oder Hashtables zuzugreifen. Außerdem um Objekttypen und Klassen zu verwenden oder auch in Regular Expressions.

### Indizierte Objektsammlungen

Wenn sie nach einer indizierten Objektsammlung stehen - damit ist ein Array oder eine Hashtable gemeint - dann kann damit eines oder mehrere Objekte aus dieser Sammlung abgerufen werden. Zum Beispiel mit einem Array:

```powershell
# Definition eines Beispiel Arrays
$beispielArray = 1, 2, 3

# Zugriff auf verschiedene Einträge im Array anhand eines Indexes
$beispielArray[0]
# Rückgabe: 1

$beispielArray[2]
# Rückgabe: 3

# -1 verweist übrigens auf den letzten Eintrag
$beispielArray[-1]
# Rückgabe: 3
```

Oder mit einer Hashtable:

```powershell
# Definition einer Beispiel Hashtable
$beispielHashtable = @{
    Vorname  = "Andreas"
    Nachname = "Dieckmann"
    Website  = "https://diecknet.de"
}

# Zugriff auf ein Element in der Hashtable
$beispielHashtable["Website"]
# Rückgabe: https://diecknet.de
```

Eine indizierte Objektsammlung kann auch ohne Variable existieren.
Beispielsweise gibt das nachfolgende `Get-HotFix` Cmdlet mehrere Objekte zurück, also ein Array.
Wir umschließen den Ausdruck erstmal mit runden Klammern und greifen dann mit eckigen Klammern auf ein Element aus dem Array zu:

```powershell
(Get-HotFix | Sort-Object installedOn)[-1]
# Rückgabe: Das zuletzt installierte Update/Hotfix Paket
```

### Objekttypen

Außerdem können eckige Klammern benutzt werden, um einen bestimmten Objekttyp zu verwenden. Der Objekttyp wird in die eckigen Klammern geschrieben. Hinter die eckigen Klammern kommt dann das Objekt.

```powershell
# Explizite Angabe des int Objekttyps für eine Zahl
[int]1
# Rückgabe: 1

# Hier wird das Objekt automatisch zu einem int konvertiert
[int]1.337
# Rückgabe: 1

# Wenn das Objekt in eine Variable geladen werden soll, kann der Objekttyp
# an der Variable festgelegt werden
[int]$beispielObjekt = 1.2

# Oder beim Objekt was in die Variable geladen werden soll
$beispielObjekt2 = [int] 1.3
# 👆 Achtung! 
# Die Ergebnisse bei diesen beiden Varianten können unterschiedlich sein.
```

### .NET Klassen

Und mit eckigen Klammern kann auch auf .NET Klassen zugegriffen werden, die gar nicht instanziert werden. Also es wird gar kein ChildObject erstellt, welches die Eigenschaften der Klasse erbt. Stattdessen können die Eigenschaften und Methoden der Klasse direkt benutzt werden. Dabei müssen dann zwei Doppelpunkte verwendet werden.

```powershell
# Abruf der Eigenschaften (Property) OSVersion
[System.Environment]::OSVersion
<# Rückgabe
Platform ServicePack Version      VersionString
-------- ----------- -------      -------------
 Win32NT             10.0.19045.0 Microsoft Windows NT 10.0.19045.0
#>

# Ausführung der Methode Beep
[Console]::Beep(300,300)
```

### Regular Expressions

Eckige Klammern können auch als Teil von Regulären Ausdrücken (englisch: Regular Expressions) benutzt werden. Regular Expressions werden benutzt um einen Text mit einem bestimmten Muster zu vergleichen.

```powershell
# Die Zahl 42 wird mit der zweifachen Range von 0-9 verglichen
42 -match '[0-9][0-9]'
# Rückgabe: True

# Der String "Hallo" wird mit einer Gruppe von Zeichen 
# (Character Groups) verglichen 
"Hallo" -match 'H[ae]llo'
# Rückgabe: True
```

## Geschweifte Klammern `{ }`

Geschweifte Klammern werden in der PowerShell verwendet um Codeblöcke zu umschließen. Außerdem können sie für die Definition von Hashtables verwendet werden. Es können Strings damit formatiert werden, oder auch ganz spezielle Variablennamen verwendet werden.

### Scriptblöcke

Das bekannteste Beispiel für die Verwendung von geschweiften Klammern in PowerShell ist das Umschließen eines Scriptblocks. Ein Scriptblock ist einfach ein Stück PowerShell Code.
Zum Beispiel bei einer if-Abfrage oder bei Schleifen.

```powershell
# Skriptblock in einer if-Abfrage
if($true -eq $true) {
    "Dieser String steckt in einem ScriptBlock"
}
```

Es gibt aber auch Cmdlets, die einen Skriptblock als Parameterwert entgegen nehmen können.

```powershell
# ScriptBlock in einem Cmdlet als Parameter
Invoke-Command -ScriptBlock {Get-ChildItem C:\} -ComputerName DC2

# SkriptBlock in Pipeline/Cmdlet
Get-Service Win* | Where-Object {$_.Status -eq "Running"}
```

Grundsätzlich ist ein Scriptblock aber auch einfach ein Objekttyp. Das bedeutet, wir können auch ein Objekt vom Typ `[ScriptBlock]` erstellen und verwenden.

```powershell
# Skriptblock-Objekt in eine Variable speichern 
$variable = [ScriptBlock]{Get-ChildItem C:\}

# Ausführen des Scriptblock-Objekts mit der .Invoke() Methode
$variable.Invoke()

# Oder auch: Invoke-Command führt den Codeblock aus, der in $variable steht
Invoke-Command -ScriptBlock $variable -ComputerName DC2
```

### Hashtables

Außerdem werden geschweifte Klammern verwendet um Hashtables mit Inhalt zu definieren:

```powershell
$meineHashtable = @{
    Vorname  = "Andreas"
    Nachname = "Dieckmann"
    Website  = "https://diecknet.de"
}
```

### Formatieren von Strings

Geschweifte Klammern können auch verwendet werden um Strings - also Texte - zu formatieren. Dafür wird hinter den String der Operator `-f` drangehängt. Hinter den Operator werden die Objekte geschrieben die in den String eingesetzt werden sollen - falls es mehrere sein sollten, dann mit einem Komma trennen.

```powershell
# Beispiel einen String mit einem zusätzlichen String anreichern
"Hallo {0}!" -f $env:username
# Rückgabe: Hallo Andreas!

# Mehrere Werte einsetzen
"Hallo {0}! Deine PowerShell Version ist: {1}" -f $env:username, $PSVersionTable.PSVersion
# Rückgabe: Hallo Andreas! Deine PowerShell Version ist: 5.1.19041.3570

# Werte können auch mehrfach verwendet werden
# Hier auch noch ein Spezialfall mit Datumsformatierung
"Hallo {0}! Es ist: {1:HH}:{1:mm} Uhr." -f $env:username, (Get-Date)
# Rückgabe: Hallo Andreas! Es ist: 21:01 Uhr.
```

### Sonderzeichen in Variablennamen

Und mit geschweiften Klammern können auch Variablennamen mit Sonderzeichen (z.B. Leerzeichen) verwendet werden. Empfehlen würde ich das aber nicht.

```powershell
# Beispiel für einen Variablennamen mit Leerzeichen
${dieser Variablennamen ist sehr schlecht} = "Hallo, das ist kein Scherz. Das geht wirklich."

# Ausgabe des Variableninhalts, ganz normal über Nennung der Variable
${dieser Variablennamen ist sehr schlecht}
```

Richtig weird - und das habe ich noch nie in einem produktiven Skript gesehen: Einige PowerShell Provider wie der FileSystem Provider unterstützen auch die Verwendung per Variablen**namen**. Dadurch kann dann auf den Inhalt zugegriffen werden. Ich würde das auch nicht empfehlen zu verwenden, das macht den Code nur schlechter verständlich.

```powershell
# Inhalt der Datei anzeigen:
${C:\temp\beispiel.txt}

# Inhalt in eine Datei schreiben:
${C:\temp\beispiel.txt} = "boink!"
```
