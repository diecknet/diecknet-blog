---
slug: "powershell-pad-zeros"
title: "Führende Nullen per PowerShell hinzufügen"
date: 2025-05-19
tags: [powershell]
---

Es gibt viele verschiedene Wege um führende Nullen zu einer Zahl in PowerShell hinzuzufügen. Wobei eigentlich können Zahlen (Objekttyp: `[int]`) keine führenden Nullen haben, deshalb erzeugen wir eigentlich einen Text (Objekttyp: `[string]`), der die Zahl enthält.

**In den folgenden Beispielen ergänze ich die Zahl `42` jeweils auf vier Stellen (= `0042`). Ihr könnt aber die Länge des "Paddings" natürlich anpassen :)**

Ich demonstriere die nachfolgenden Möglichkeiten (plus noch ein paar mehr) auch [in diesem Video hier auf YouTube](https://youtu.be/0Ck8rzW3f-g).

## Per Format Operator

Mein persönlicher Favorit ist der "Format"-Operator `-f`:

```powershell
$Zahl = 42

# 4 Stellen als Zahl angeben:
"{0:d4}" -f $Zahl

# Alternativ: Die gewünschte Anzahl von Nullen direkt eingeben:
"{0:0000}" -f $Zahl

# Alternativ: Die Anzahl per Variable steuern
$Stellen = 4 # für 4 Stellen
"{0:d$Stellen}" -f $Zahl

# Rückgabe jeweils: 0042
```

Falls ihr euch z.B. einen Computernamen mit fixer Länge generieren wollt, könntet ihr z.B. so etwas machen:

```powershell
$Zahl = 42

"PC{0:d4}" -f $Zahl
# Rückgabe: PC0042
```

Der Format Operator kann auch noch mehr, für einen ersten Überblick empfehle ich [diese Seite bei SS64.com](https://ss64.com/ps/syntax-f-operator.html).

## `[int].ToString()` Methode

Eine andere Möglichkeit, ist die Verwendung der `.ToString()` Methode eines `[int]`-Objekts:

```powershell
$Zahl = 42

$Zahl.ToString("d4")

$Zahl.ToString("0000")

# Rückgabe jeweils: 0042
```

## `[String].PadLeft()` Methode

Für manche Szenarien vielleicht auch nett: Die `.PadLeft()` Methode eines `[String]`-Objekts. Da wir hier mit einer Zahl `[int]` anfangen, konvertieren wir sie zunächst per `ToString()` zu einem String. Es wäre natürlich möglich hier auch schon direkt bei der String-Konvertierung die Nullen hinzuzufügen (siehe Abschnitt [`[int].ToString()` Methode](#inttostring-methode)), aber ich finde es trotzdem interessant die `.PadLeft()` Methode zu erwähnen. Vielleicht könnt ihr sie ja mal für etwas anderes gebrauchen?

```powershell
$Zahl = 42

# Die Anführungszeichen um die "0" sind wichtig!
$Zahl.ToString().PadLeft(4, "0")

# Rückgabe: 0042
```

Falls ihr mal nach rechts mit Zeichen polstern wollt, gibt es übrigens auch `.PadRight()`:

```powershell
$Zahl = 42

# Die Anführungszeichen um die "0" sind wichtig!
$Zahl.ToString().PadRight(4, "0")

# Rückgabe: 4200
```
