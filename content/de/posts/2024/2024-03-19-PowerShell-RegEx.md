---
slug: "powershell-regex"
title: "Regular Expressions in PowerShell"
date: 2024-03-19
comments: true
tags: [powershell, regex, regular expressions]
---

Regular Expressions sind Muster mit denen Texte verglichen werden können oder auch Infos aus Texten extrahiert werden können. Zum Beispiel könnt ihr damit überprüfen, ob eine Logdatei von einem Programm die Zeichenfolge "Error" enthält (also um zu prüfen, ob ein Fehler aufgetreten ist). Oder um einfach nur zu schauen, ob eine Zeichenkette einem bestimmten Muster entspricht, zum Beispiel einer E-Mail Adresse.

**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://youtu.be/Zk6iHL1T94k)**

Diese Muster gibt es in vielen Programmiersprachen. Die Details der Implementierungen können sich dann in den Details aber etwas unterscheiden. PowerShell und die RegEx-Engine der PowerShell basieren auf .NET. Deshalb gelten hier vorallem die .NET Eigenheiten.  
In der PowerShell gibt es verschiedene Möglichkeiten um Regular Expressions zu verwenden - also zum Beispiel in Cmdlets, als Vergleichsoperator oder per .NET Methode. Im Folgenden zeige ich euch ein paar dieser Möglichkeiten. Außerdem zeige ich euch, wie ihr die Vergleichsmuster also die tatsächlichen Regular Expressions erstellen könnt.

## Der -match Operator

Eine einfache Möglichkeit um einen Vergleich per Regular Expressions zu machen, ist der `-match` Vergleichsoperator. Zum Beispiel so:

```powershell
"Hallo PowerShell" -match "shell"

<# Rückgabe:

True
#>
```

Hier wird geprüft, ob im Text "Hallo PowerShell" auch die Zeichenkette "shell" enthalten ist. Das Ergebnis ist `True`, also wahr. Und hierbei sehen wir jetzt schon die erste Besonderheit: Denn in der PowerShell sind Regular Expressions standardmäßig **nicht case-sensitive** - also die Groß- und Kleinschreibung wird ignoriert. Ihr könnt aber auch explizit angeben, dass ihr Case-Sensitive vergleichen wollt, oder ganz explizit nicht. Explizit anzugeben, dass nicht case-sensitive gearbeitet wird, obwohl es ja eigentlich dem Standard spricht - das klingt vielleicht erstmal komisch. Hat aber seine Daseinsberechtigung. Wenn ihr das nämlich macht, dann wird spiegelt euer Code ein bisschen genauer wider, was ihr eigentlich machen wollt.

```powershell
# Explizit NICHT case-sensitive:
"Hallo PowerShell" -imatch "shell"

<# Rückgabe:

True
#>

# Case-sensitive erzwingen:
"Hallo PowerShell" -cmatch "shell"

<# Rückgabe:

False
#>
```

Es gibt auch alle drei `match` Operatoren auch noch in umgedreht, nämlich immer noch mit dem Zusatz "not" (also Englisch für "nicht"):

```powershell
# Normalerweise NICHT case-sensitive, aber negiert:
"Hallo PowerShell" -notmatch "shell"

<# Rückgabe:

False
#>

# Explizit NICHT case-sensitive, aber negiert:
"Hallo PowerShell" -inotmatch "shell"

<# Rückgabe:

False
#>

# Case-sensitive erzwingen, aber negiert:
"Hallo PowerShell" -cnotmatch "shell"

<# Rückgabe:

True
#>
```

## Platzhalter und Quantifier

Aber mit Regulären Ausdrücken können wir auch mehr: Also nicht einfach nur ein Wort oder ein Stück Text als Vergleichsmuster verwenden. Es gibt verschiedene Zeichen, mit einer speziellen Bedeutung. Zum Beispiel ein Punkt `.` steht für ein beliebiges Zeichen. Und man kann auch mit einem zusätzlichen Zeichen die Anzahl des gewünschten Zeichens angeben, auf Englisch wird das "quantifier" genannt. So einen "quantifier" hängt man dran, also es bezieht sich immer auf die Sache davor. Ein Quantifier ist zum Beispiel das Stern-Symbol `*` was für eine beliebige Anzahl steht, also auch inklusive 0. Das `+` Symbol steht für die Anzahl 1 oder mehr. Das `?` steht für die Anzahl 0 oder 1.
Also kann ich zum Beispiel auch so einen Vergleich machen:

```powershell
"PowerShell ist eine mächtige Skriptsprache" -match "m.chtig"
<# Rückgabe:

True
#>
```

Statt also hier explizit das "ä" anzugeben, habe ich den Punkt als Platzhalter verwendet. Das ergibt auch `True`.
Passen wir das nochmal an und nehmen einen "quantifier" mit rein.

```powershell
"PowerShell ist eine mächtige Skriptsprache" -match "m.*chtig"
<# Rückgabe:

True
#>
```

Der Stern steht ja für eine beliebige Anzahl. Also könnte ich auch den String anpassen, sodass dort "mächtig" mit drei "ä" steht.

```powershell
"PowerShell ist eine määächtige Skriptsprache" -match "m.*chtig"
<# Rückgabe:

True
#>
```

Oder es würden auch andere Zeichen gematched werden.

```powershell
"PowerShell ist eine möchtige Skriptsprache" -match "m.*chtig"
<# Rückgabe:

True
#>

"PowerShell ist eine massiv richtige Skriptsprache" -match "m.*chtig"
<# Rückgabe:

True
#>
```

Ob das letzte Beispiel ein ordentlicher deutscher Satz ist, lassen wir mal dahin gestellt. Aber auch diese Vergleichsoperation ergibt `True`, weil da irgendwo ein `m` steht und dann später `chtig`.

Übrigens: Den Quantifier können wir auch bei normalen Zeichen verwenden, also nicht nur bei Spezialzeichen wie dem Punkt. Um zum Beispiel stattdessen zu prüfen, ob 0, 1 oder mehr `ä` enthalten sind könnten wir folgendes machen:

```powershell
"PowerShell ist eine möchtige Skriptsprache" -match "mä*chtig"
<# Rückgabe:

False
#>

"PowerShell ist eine määächtige Skriptsprache" -match "mä*chtig"
<# Rückgabe:

True
#>
```

**Hinweis:** Wenn ihr eines von den Spezialzeichen `[]().\^$|?*+{}` matchen wollt, also wenn ihr zum Beispiel schauen wollt, ob das Stern-Symbol oder ein Punkt in einem Text drin steht, dann funktioniert das erstmal nicht. Um gegen so ein Spezialzeichen vergleichen zu können, müssen wir das Zeichen "escapen". Dafür schreiben wir ein Backslash-Symbol `\` vor das Zeichen, welches wir escapen wollen. Zum Beispiel so:

```powershell
"Dieser Text enthält ein *-Symbol" -match "\*"
<# Rückgabe:

True
#>
```

Das gilt übrigens auch für das Backslash-Symbol. Also um zu prüfen ob ein Backslash Symbol enthalten ist, müssen wir es mit einem Backslash escapen, sodass dann dort zwei Backslashes im Vergleichsmuster stehen.

```powershell
"Dieser Text enthält ein \-Symbol" -match "\\"
<# Rückgabe:

True
#>
```

Mehr Infos zu den anderen Spezialzeichen und Platzhaltern kommen im Laufe des Artikels.

## Die $Matches Variable

Bei der Verwendung der Match-Operatoren passiert noch mehr als nur die Rückgabe von `True` oder `False`. Wenn das Ergebnis des Vergleichs `True` ist, dann wird die Variable `$Matches` dem ersten Suchtreffer im Text befüllt. Das macht eigentlich erst Sinn, wenn man mit irgendwelchen Platzhaltern oder Quantifiern arbeitet.

Machen wir mal noch einen Vergleich mit dem `match`-Operator und schauen in die Variable rein.
Mein Text in dem ich etwas prüfen möchte, habe ich grob an HTML oder XML Code angelehnt.
Und mein Vergleichsmuster schaut nach den Tags mit dem Namen `<test> </test>` und dazwischen dürfen dann 0 oder mehr beliebige Zeichen stehen.
Da das Ergebnis `True` ist, wird die `$Matches` Variable automatisch befüllt.

```powershell
"<b><test>Hallo</test></b>" -match "<test>.*</test>"
<# Rückgabe:

True
#>


$Matches

<# Rückgabe

Name                           Value
----                           -----
0                              <test>Hallo</test>
#>
```

## Capture Groups

Mit Capture Groups können wir bestimmte Bereiche aus dem Text extrahieren. Auch mehrere Capture Groups in einer regular Expression sind möglich, aber wir fangen erstmal mit einer an.  
Bleiben wir mal bei dem Beispiel vom vorherigen Abschnitt. Wenn ich jetzt genau den Text extrahieren möchte, der sich innerhalb der `<test>`-Tags befindet, dann ist der bisherige Code noch nicht optimal. Aber das Verwenden von Capture Groups ist eigentlich ganz einfach, wir müssen einfach den Bereich den wir als Capture Group behandeln wollen in Runde Klammern `()` stecken. Das Ergebnis von Capture Groups landet ebenfalls in der `$Matches` Variable.

```powershell
"<b><test>Hallo</test></b>" -match "<test>(.*)</test>"
<# Rückgabe:

True
#>


$Matches

<# Rückgabe

Name                           Value
----                           -----
1                              Hallo
0                              <test>Hallo</test>
#>
```

Die `$Matches` Variable ist übrigens eine Hashtable. Der Eintrag mit dem Namen "0" gibt unseren gesamten gematchten String zurück. Und wenn wir *eine* Capture Group verwenden, dann landet die im Eintrag "1". Wenn wir noch mehr Capture Groups verwenden würden, dann könnte es auch noch mehr Einträge geben, dann würde einfach weiter hochnummeriert werden.

Zum Beispiel extrahiere ich hier drei Infos per Capture Groups:

```powershell
"<b><test>Hallo</test></b>" -match "<b><(.+)>(.*)</(.+)></b>"
<# Rückgabe:

True
#>


$Matches

<# Rückgabe

Name                           Value
----                           -----
3                              test
2                              Hallo
1                              test
0                              <b><test>Hallo</test></b>
#>
```

Jetzt habe ich Einträge von 0-3 in meiner `$Matches` Variable. Wenn ihr die im Code weiter verarbeiten wollt, könnt ihr wie bei jeder anderen Hashtable auch, auf die einzelnen Einträge zugreifen. Zum Beispiel so:

```powershell
$Matches[2]
<# Rückgabe:

Hallo
#>

$Matches[1]
<# Rückgabe:

test
#>
```

Hier ein Bild um visuell zu zeigen, wo was gecaptured wird:  
[![Mehrere RegEx Capture Groups](/images/2024/2024-03-19_RegEx_Multiple_Capture_Groups.jpg "Mehrere RegEx Capture Groups")](/images/2024/2024-03-19_RegEx_Multiple_Capture_Groups.jpg)  

Allerdings wird der Code durch diese Nummerierungen schnell unübersichtlich. Um den Code besser verständlich zu machen, können wir "Named Captures" verwenden. Also Namen für unsere Capture Groups festlegen. Dafür müssen wir an den Anfang der Capture Group, aber innerhalb der runden Klammern, erstmal ein `?` schreiben und dann zwischen einem kleiner-als-Zeichen `<` und einem Größer-als-Zeichen `>` den gewünschten Namen. Der Eintrag in der `$Matches`-Hashtable erhält dann statt einer Nummer den gewünschten Namen.

```powershell
"<b><test>Hallo</test></b>" -match "<test>(?<MeinText>.*)</test>"
<# Rückgabe:

True
#>


$Matches

<# Rückgabe

Name                           Value
----                           -----
MeinText                       Hallo
0                              <test>Hallo</test>
#>

$Matches["MeinText"]

<# Rückgabe:

Hallo
#>
```

Ein kleines Manko gibt es bei der Verwendung von Capture Groups mit dem `-match` Operator: Wenn ihr mehrfach matchen wollt, dann geht das nicht. Also wenn eure Regular Expression mehrfach zutrifft auf euren String, dann wird nur das erste Ergebnis zurückgeliefert. Zum Beispiel so:

```powershell
"<b><test>Hallo</test></b> <u><test>Moin</test></u>" -match "<test>(?<MeinText>.*?)</test>"
<# Rückgabe:

True
#>

$Matches

<# Rückgabe

Name                           Value
----                           -----
MeinText                       Hallo
0                              <test>Hallo</test>
#>
```

Der String den ich hier überprüft habe, enthält zwei Blöcke mit diesem `<test>`-Tag. Wenn ich jetzt in die `$Matches` Variable reinschaue, dann ist da aber trotzdem nur ein Treffer drin. Das lässt sich auch nicht anpassen bei der Verwendung des `-match` Operators. Wenn ihr mehrere Treffer matchen wollt und dabei vielleicht auch noch Capture Groups verwenden wollt, dann müsst ihr eine andere Methode verwenden (zum Beispiel die [.NET Klasse `RegEx`](#net-regex-matches)).

## Greedy Captures

Euch ist vielleicht beim letzten Beispiel im vorherigen Abschnitt ([Capture Groups](#capture-groups)) aufgefallen, dass meine Regular Expression noch ein Fragezeichen `?` enthält. Durch dieses Fragezeichen habe ich eingestellt, dass die RegEx Engine hier nicht wie im Standard "greedy" ist - (zu deutsch "gierig"). Normalerweise versucht die Engine im gierigen Modus soviele Zeichen wie möglich mit der Regular Expression zu matchen. Das kann aber zu unerwünschten Ergebnissen führen. Im Vergleich hier einmal das Ergebnis ohne das Fragezeichen.

```powershell
"<b><test>Hallo</test></b> <u><test>Moin</test></u>" -match "<test>(?<MeinText>.*)</test>"
<# Rückgabe:

True
#>


$Matches

<# Rückgabe

Name                           Value
----                           -----
MeinText                       Hallo</test></b> <u><test>Moin
0                              <test>Hallo</test></b> <u><test>Moin</test>
#>
```

## Besonderheiten und Tipps zum match Operator

Eine Besonderheit beim `-match` Operator: Wenn ihr mehrere Objekte gleichzeitig als Eingabe nehmt, also zum Beispiel so:

```powershell
"Hallo", "PowerShell", "test" -match ".*o.*"
<# Rückgabe:

Hallo
PowerShell
#>
```

Dann kriegt ihr nicht `True` oder `False` zurück, sondern jeweils alle Strings bei denen die Regular Expression erfolgreich gematched hat. In so einem Fall wird die automatische Variable `$Matches` auch **nicht** befüllt. Also wenn da vorher etwas drin stand, dann ist noch der alte Wert drin. Und wenn zuvor noch nichts drin stand, dann steht da jetzt auch nichts drin.

Meine Praxistipps für den Match Operator sind wie folgt:

1. Wenn ihr nur prüfen wollt, ob ein Muster zutreffend ist, gibt es nicht viel zu beachten. Macht einfach eine `If`-Abfrage. Das funktioniert sowohl bei einem Objekt als Input, als auch mit mehreren.

    ```powershell
    $MeineVariable = "Kanal abonnieren"
    if($MeineVariable -match "abo") {
        # Das hier wird ausgeführt, wenn die Regular Expression True ergibt
        "... und Video liken!"
    }
    ```

2. Ansonsten solltet ihr sicherstellen, dass ihr wisst wieviele Objekte ihr an `-match` übergebt. Es ist ein ganz klassischer Fehler in der Programmlogik, dass nicht beachtet wird, dass ein Cmdlet auch mal mehr Objekte zurücklieferen kann als nur eins. Um sicherzustellen, dass nur ein Objekt geprüft wird, könnt ihr zum Beispiel mit `Select-Object -First 1` die Rückgabe auf ein Objekt beschränken.

    ```powershell
    $MeineVariable = "User1@example.com", "User2@example.com" | Select-Object -First 1
    if($MeineVariable -match "user") {
        "User gefunden!"
        # irgendwas mit dem User machen
    }
    ```

    Nur wenn ihr wirklich nur gegen ein Objekt matched, könnt ihr dem Inhalt der Variable `$Matches` vertrauen.

3. Wenn ihr eine Regular Expression habt, die mehrfach auf euren String passt, und ihr alle Treffer wissen wollt, und vielleicht sogar mit Capture Groups die Infos rausziehen wollt, dann ist der `-match` Operator dafür **nicht geeignet**. Es gibt aber andere Möglichkeiten zum Beispiel die [.NET RegEx Klasse](#net-regex-matches).

## Der -replace Operator

Mit dem `-replace` Operator wird der Text der dem RegEx Muster entspricht durch einen anderen Text ersetzt.
Zunächst ein einfaches Beispiel, bei dem einfach das Zeichen `W` inklusive allem was danach folgt durch das Wort `PowerShell` ersetzt wird.

```powershell
"Hallo Welt" -replace "W.*", "PowerShell"
<# Rückgabe:

Hallo PowerShell
#>
```

Aber der `-replace` Operator unterstützt auch Capture Groups. Und dann können wir die Capture Groups in unserem Ergebnis verwenden.

```powershell
# Mit unbenannten Capture Groups
"<b><test>diecknet</test></b>" -replace "<test>(.*)</test>", 'Hallo $1'
<#  
    Achtung! Hier ist es wichtig, dass mindestens der zweite Parameter von
    -replace mit einfachen Anführungszeichen umschlossen ist. Ansonsten würde
    das $1 als PowerShell Variable interpretiert werden - es ist aber keine. 
    Es ist ein Platzhalter der auf eine Regular Expression Capture Group verweist. 
#> 
# Ergebnis = <b>Hallo diecknet</b>

# Mit benannten Capture Groups
"<b><test>diecknet</test></b>" -replace "<test>(?<MeinText>.*)</test>", 'Hallo ${MeinText}'
# Ergebnis = <b>Hallo diecknet</b>
```

Die `$Matches` Variable wird übrigens **nicht** befüllt, wenn wir den `-replace` Operator verwenden. Falls sie bei euch noch gesetzt ist, dann ist das noch von einem vorherigen Vergleich per `-match` Operator.

## Der -split Operator

Mit dem `-split` Operator könnt ihr Strings aufteilen. Und auch hier können nicht nur einfache Zeichenfolgen als Trennzeichen verwendet werden, sondern auch Regular Expressions.
Einfaches Beispiel:

```powershell
"Hallo Welt!" -split " "

<# Rückgabe:

Hallo
Welt!
#>
```

Und ein komplexeres Beispiel:

```powershell
"Hallo Welt! In diesem Text wird jedes mal getrennt, wenn ein Satzzeichen auftaucht. Sinnvoll? Eher nicht." -split "[\.,!?]"

<# Rückgabe:

Hallo Welt
 In diesem Text wird jedes mal getrennt
 wenn ein Satzzeichen auftaucht
 Sinnvoll
 Eher nicht
#>
```

Der `-split` Operator unterstützt noch ein paar weitere Optionen. Ich finde es aber nicht so interessant und habe keine coolen Beispiele. Schaut dafür am besten in die Dokumentation bei Microsoft: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_split?view=powershell-7.4>

## Select-String Cmdlet

Mit dem Cmdlet `Select-String` kann ein String oder ein Dateiinhalt mit einer Regular Expression verglichen werden. Oder auch mehrere Strings oder Dateiinhalte.
Zum Beispiel vergleiche ich hier mehrere Objekte, in dem Fall einfache Strings, indem ich sie per Pipeline an `Select-Object` übergebe.

```powershell
# Der Parameter -Pattern legt die Regular Expression fest
"Moin und hallo!","Boink!","Test" | Select-String -Pattern "oi"
<# Rückgabe:

Moin und hallo!
Boink
#>
```

Von den drei Objekten erhalte ich nur zwei zurück, da nur zwei dem Muster entsprechen. In der PowerShell 7 wird es sogar auch noch in der Konsole hervorgehoben, wo das Muster zutrifft.

[![Highlight der Suchtreffer bei Select-String in PowerShell 7](/images/2024/2024-03-19_RegEx_Highlight_in_PS7.jpg "Highlight der Suchtreffer bei Select-String in PowerShell 7")](/images/2024/2024-03-19_RegEx_Highlight_in_PS7.jpg)  

Auch bei `Select-String` wird die Groß- und Kleinschreibung im Standard erstmal ignoriert. Wenn ihr wollt, dass sie beim Vergleichen beachtet wird, dann könnt ihr den zusätzlichen Parameter `-CaseSensitive` mit angeben. Außerdem könnt ihr die Überprüfung auch umdrehen, indem ihr den Parameter `-NotMatch` angebt. Dann würden nur die Strings zurückgegeben werden, die nicht dem Muster entsprechen.
Aber diese Sachen könnten wir ja auch schon mit dem `-match` Operator erreichen. Was ich dann interessanter finde, ist die Möglichkeit eine oder mehrere Dateien zu prüfen.
Zum Beispiel überprüfe ich so alle Dateien mit der Dateiendung `.log` im Verzeichnis `C:\diecknet`:

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password"
```

[![Highlight der Suchtreffer in einer Datei bei Select-String in PowerShell 7](/images/2024/2024-03-19_RegEx_Select-String-Files.jpg "Highlight der Suchtreffer in einer Datei bei Select-String in PowerShell 7")](/images/2024/2024-03-19_RegEx_Select-String-Files.jpg)  

Wenn wir jetzt eine oder mehrere Textdateien mit dem Cmdlet prüfen, dann kriegen wir bei den Suchtreffern auch noch die Information in welcher Datei sich der Treffer befindet und in welcher Zeile.
Manchmal möchte man aber noch ein bisschen mehr Infos bekommen, ein bisschen Kontext. Dafür gibt es den Parameter `-Context`. Da kann ich wahlweise eine Zahl angeben, und soviele Zeilen kriege ich dann darüber und darunter mit ausgegeben.

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password" -Context 1
```

[![Highlight der Suchtreffer in einer Datei bei Select-String in PowerShell 7 mit Kontext](/images/2024/2024-03-19_RegEx_Select-String-Files-Context.jpg "Highlight der Suchtreffer in einer Datei bei Select-String in PowerShell 7 mit Kontext")](/images/2024/2024-03-19_RegEx_Select-String-Files-Context.jpg)  

Die tatsächliche Zeile mit dem Suchergebnis ist dann mit einem Größer-als-Zeichen `>` markiert.

Wir können aber auch getrennt steuern, wieviele Zeilen davor und danach wir erhalten möchten. Dafür einfach zwei Zahlen als Parameterwert angeben und mit einem Komma trennen. In folgendem Beispiel werden eine Zeile davor und 5 danach zurückgegeben.

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password" -Context 1,5
```

Das was uns hier von `Select-String` zurückgeliefert wird, ist übrigens auch mehr als einfach nur Text. Tatsächlich kriegen wir hier Objekte vom Typ `MatchInfo` zurück.

```powershell
Select-String -Path "C:\diecknet\*" -Pattern "test" -Context 1 | Get-Member
```

[![Die Rückgabe von Select-String ist ein MatchInfo Objekt](/images/2024/2024-03-19_Select-String-Object-Infos.jpg "Die Rückgabe von Select-String ist ein MatchInfo Objekt")](/images/2024/2024-03-19_Select-String-Object-Infos.jpg)  

Das MatchInfo Objekt hat einige interessante Eigenschaften, auf die wir dann per Code zugreifen können. Wir könnten beispielsweise auch per Code die genaue Zeilennummer eines Datei-Treffers herausfinden.

```powershell
$Ergebnisse = Select-String -Path "C:\diecknet\*.log" -Pattern "password" -Context 1,5

foreach($Ergebnis in $Ergebnisse) {
    Write-Host "Treffer in $($Ergebnis.FileName) in Zeile $($Ergebnis.LineNumber):" -ForegroundColor Red
    Write-Host $Ergebnis.Line -ForegroundColor Yellow
}
```

[![Beispiel für die Weiterverarbeitung der Rückgabe von Select-String](/images/2024/2024-03-19_Select-String-Object-Properties.jpg "Beispiel für die Weiterverarbeitung der Rückgabe von Select-String")](/images/2024/2024-03-19_Select-String-Object-Properties.jpg)  

Falls ihr euch für mehrere Treffer in einer Zeile interessiert, dann könnt ihr das auch aktivieren mit dem Parameter `-AllMatches`.

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password" -AllMatches
```

[![Beispiel für die Rückgabe von Select-String bei Verwendung des AllMatches Parameters](/images/2024/2024-03-19_Select-String-Multiple-Matches.jpg "Beispiel für die Rückgabe von Select-String bei Verwendung des AllMatches Parameters")](/images/2024/2024-03-19_Select-String-Multiple-Matches.jpg)  

## Switch Statement mit -RegEx Parameter

Beim `Switch` Statement können auch reguläre Ausdrücke verwendet werden. Dafür muss der Parameter `-RegEx` mit angegeben werden. Bei jedem Bedingungsblock des Switch Statements kann dann ein regulärer Ausdruck eingetragen werden.

```powershell
$MeinString = "<h1>Hallo!</h1>"
switch -Regex ( $MeinString ) {
    "<.+>" { "Sieht aus wie eine HTML-Seite!" }
    "\d{5}" { "Enthält eine 5-stellige Zahl!" }
}

<# Rückgabe

Sieht aus wie eine HTML-Seite!
#>
```

## .NET RegEx Matches

Die mächtigste Möglichkeit um Regular Expressions in der PowerShell zu verwenden, ist meiner Meinung nach die .NET Klasse `RegEx`. Es gibt verschiedene Möglichkeiten die Klasse zu benutzen. Die einfachste ist meiner Meinung nach Folgende:

```powershell
$TestString = "Hallöchen"
[regex]::Matches($TestString, 'Ha')

<# Rückgabe:

Groups    : {0}
Success   : True
Name      : 0
Captures  : {0}
Index     : 0
Length    : 2
Value     : Ha
ValueSpan :
#>


```

Wenn die Regular Expression erfolgreich gegen den String gematched wurde, dann erhaltet ihr ein Match Objekt zurück. Daran ist dann unter anderem erkennbar, dass das Muster erkannt wurde. Und ihr könnt per Code auf die Eigenschaften zugreifen.
Ich benutze die .NET Variante hier vorallem wenn ich mehrere Infos auf einmal per Capture Groups rausziehen möchte. Also nicht einfach nur mehrere Capture Groups, sondern dass das Muster mehrfach zutrifft. Ich habe hier zum Beispiel eine Text-Datei mit folgendem Inhalt (das ist übrigens alles in einer Zeile):

[![Beispiel für die Rückgabe von mehreren Treffern bei Verwendung der Matches Methode aus der .NET Klasse RegEx](/images/2024/2024-03-19_FileContent-example.jpg "Beispiel für die Rückgabe von mehreren Treffern bei Verwendung der Matches Methode aus der .NET Klasse RegEx")](/images/2024/2024-03-19_FileContent-example.jpg)  

Mit folgendem PowerShell Code lese ich die Text-Datei zunächst ein und prüfe dann mit der `[regex]::Matches()` Methode ob ein Muster darauf zutrifft.

```powershell
$MeinString = Get-Content C:\diecknet\net-beispiel.txt
[regex]::Matches($MeinString, '\b([a-f0-9]{32})\b')
```

[![Beispiel für die Rückgabe von mehreren Treffern bei Verwendung der Matches Methode aus der .NET Klasse RegEx](/images/2024/2024-03-19_RegEx-Net-Class-Matches.jpg "Beispiel für die Rückgabe von mehreren Treffern bei Verwendung der Matches Methode aus der .NET Klasse RegEx")](/images/2024/2024-03-19_RegEx-Net-Class-Matches.jpg)  

Der Code extrahiert alle Zeichenfolgen die exakt 32 Zeichen lang sind und ausschließlich aus Hexadezimalen Zeichen bestehen. Dabei hat die Regular Expression `\b([a-f0-9]{32})\b` genau eine Capture Group. Da ich die `Matches` Methode aus der `RegEx` Klasse aufgerufen habe, kriege ich nicht nur den ersten Suchtreffer zurück, sondern alle.

**Wichtig: Bei der .NET Klasse `RegEx` solltet ihr genau auf die Groß- und Kleinschreibung achten!** Im Gegensatz zu den anderen RegEx Möglichkeiten in der PowerShell, ist sie standardmäßig case-sensitive. Der folgende Code würde keinen Treffer im String finden:

```powershell
$TestString = "Hallöchen"
[regex]::Matches($TestString, 'ha')
# Keine Rückgabe, auf Grund der Groß- und Kleinschreibung.
```

Aber die .NET `[RegEx]::Matches()` Methode unterstützt diverse Optionen. Unser bisheriges Beispiel kann um einen dritten Parameter ergänzt werden, um auch hier die Groß- und Kleinschreibung zu ignorieren:

```powershell
$TestString = "Hallöchen"
[regex]::Matches($TestString, 'ha', 'IgnoreCase')

<# Rückgabe

Groups    : {0}
Success   : True
Name      : 0
Captures  : {0}
Index     : 0
Length    : 2
Value     : Ha
ValueSpan :
#>
```

💡 Weitere Optionen könnt ihr hier in der Microsoft Dokumentation finden: <https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-options?redirectedfrom=MSDN>

Außerdem gibt es noch weitere Methoden in der `RegEx` Klasse, die je nach Anwendungsfall auch noch sehr praktisch sein können. Schaut dafür in die Dokumentation zur `RegEx` Klasse: <https://learn.microsoft.com/en-us/dotnet/api/system.text.regularexpressions.regex?view=net-8.0#methods>

## Regular Expressions entwerfen

Okay, kommen wir also dazu wie ihr Regular Expressions entwerfen könnt. Wie zum Beispiel die Expression von eben: `\b([a-f0-9]{32})\b`
Also ganz ehrlich: Ich finde Regular Expressions sind nicht einfach. Ich habe nicht genug Erfahrung mit Regular Expressions, dass ich die einfach so runtertippe ohne irgendwelche Hilfe. Aber ich guck eigentlich gar nicht erst in die [Microsoft Dokumentation zu RegEx in .NET](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference) oder [PowerShell](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_regular_expressions). Stattdessen nehme ich ein Tool um ein RegEx Muster zu entwerfen. Es gibt einige kostenlose Websites, mit denen man Regular Expressions im Browser bauen kann und direkt live gegen einen oder mehrere Strings testen kann. Ich habe in letzter Zeit gerne [RegEx101.com](https://regex101.com) verwendet, weil dort auch speziell mit Bezug auf die .NET Eigenheiten gearbeitet werden kann. In der Vergangenheit habe ich auch andere allgemeinere Websites benutzt, die dann z.B. eher an JavaScript orientiert sind. Aber meistens hat das auch richtig funktioniert. Keine Ahnung wie seriös diese [RegEx101.com](https://regex101.com) Seite ist, also ich würde da jetzt keine personenbezogenen Daten oder sonst wie was kritisches reintun.
**Wichtig:** Auf der Seite müsst ihr links den Flavor auf ".NET" umstellen.

Wenn ihr jetzt ein Muster entwerfen wollt, dann schaut unten rechts in den Bereich "Quick Reference". Dort werden alle möglichen Platzhalter und Spezialzeichen erklärt. Außerdem gibt es den Bereich Explanation, der die erstellte Regular Expression erklärt. Sehr nice!

## Schlusswort

Das waren meiner Meinung nach die wichtigsten Möglichkeiten Regular Expressions in der PowerShell zu verwenden. Vermutlich gibt auch noch mehr Möglichkeiten. Aber das Grundprinzip das war hoffentlich verständlich, sodass ihr Regular Expressions hoffentlich auch an den anderen Stellen anwenden könnt.

**Ein wichtiger Hinweis noch:** Wenn ihr nur einen einfachen Vergleich durchführen wollt, ist es empfehlenswert Regular Expressions **gar nicht** erst zu verwenden. Denn die Verwendung der RegEx Engine hat einen gewissen Overhead. Im Zweifelsfall testen und Zeit messen!
